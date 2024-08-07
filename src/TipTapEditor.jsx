import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as Y from 'yjs';
import { useParams } from 'react-router-dom';
import { WebrtcProvider } from 'y-webrtc';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import './editor.css';
import axios from 'axios';

const ydoc = new Y.Doc();
const provider = new WebrtcProvider('room', ydoc);
const awareness = provider.awareness;

const Editor = ({ user }) => {
  const initialDoc = { name: 'untitled', content: '<p>Hello</p>' };
  const [docname, setDocname] = useState(initialDoc.name);
  const [username, setUsername] = useState('Anonymous');
  const { docId } = useParams();
  const [initialContent, setInitialContent] = useState('');

  // Initialize editor directly
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: username,
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  });

  // Fetch document content when component mounts
  useEffect(() => {
    const fetchDocumentContent = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/documents/${docId}`);
        if (data && data.content) {
          setInitialContent(data.content);
          setDocname(data.title);
        }
      } catch (error) {
        console.error('Error fetching document content:', error);
      }
    };

    fetchDocumentContent();
  }, [docId]);

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  // Set username and handle awareness updates
  useEffect(() => {
    const name = prompt('Enter your name:');
    setUsername(name || 'Anonymous');

    // Set the initial awareness state
    awareness.setLocalStateField('user', {
      name: name || 'Anonymous',
    });

    const previousStates = new Set();

    const updateDocumentWithUserState = async (action) => {
      try {
        await axios.post(`http://localhost:5000/documents/${docId}/update`, {
          user: username,
          action,
        });
      } catch (error) {
        console.error('Error updating document with user state:', error);
      }
    };

    const handleAwarenessUpdate = () => {
      const currentStates = new Set(Array.from(awareness.getStates().keys()));

      const entered = Array.from(currentStates).filter(userId => !previousStates.has(userId));
      const left = Array.from(previousStates).filter(userId => !currentStates.has(userId));

      entered.forEach(async userId => {
        const userState = awareness.getStates().get(userId);
        if (userState) {
          const userName = userState.user.name;
          console.log(`${userName} has entered the room`);
          await updateDocumentWithUserState('entered');
        }
      });

      left.forEach(async userId => {
        const userState = awareness.getStates().get(userId);
        if (userState) {
          const userName = userState.user.name;
          console.log(`${userName} has left the room`);
          await updateDocumentWithUserState('left');
        }
      });

      previousStates.clear();
      currentStates.forEach(userId => previousStates.add(userId));
    };

    awareness.on('change', handleAwarenessUpdate);

    return () => {
      awareness.off('change', handleAwarenessUpdate);
    };
  }, [username]);

  const generateAndCopyShareLink = () => {
    const link = `${window.location.origin}?room=${encodeURIComponent(docname)}`;
    window.history.pushState(null, '', link); // Update the URL without reloading
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleDocName = (event) => {
    setDocname(event.target.value);
  };

  return (
    <div className="editor-wrapper">
      <textarea
        onChange={handleDocName}
        className="doc-name"
        name="docname"
        value={docname}
      />
      {editor ? <EditorContent editor={editor} /> : 'Loading editor...'}
      <button onClick={generateAndCopyShareLink}>Share link</button>
    </div>
  );
};

export default Editor;
