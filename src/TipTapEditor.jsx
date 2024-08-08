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

const Editor = ({ user}) => {
  const doc = {name:'untitled',content:'<p>hello</p>'}
  console.log(`editor ${doc}`)
  const [docname, setDocname] = useState(doc.name);
  const [username, setUsername] = useState('Anonymous');
  const { docId } = useParams();
  const [initialContent, setInitialContent] = useState(doc.content);

 
console.log(user)
  useEffect(() => {
  }, [docId]);

  useEffect(() => {
    const name = prompt('Enter your name:');
    setUsername(name || 'Anonymous');

    // Set the initial awareness state
    awareness.setLocalStateField('user', {
      name: name || 'Anonymous',
    });


    return () => {
      console.log("save called");
      saveDocument(); // Save the document on unmount
    };
  }, []);

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

  const saveDocument = async () => {
    try {
      console.log(ydoc);
      await axios.post(`http://localhost:5000/documents/${docId}`, {
        title: docname,
        content: editor.getHTML(),
      });
      alert('Document saved!');
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document.');
    }
  };

  const editor = useEditor(
    {
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
    },
    [username]
  );

  return (
    <div className="editor-wrapper">
      <textarea
        onChange={handleDocName}
        className="doc-name"
        name="docname"
        value={docname}
      />
      {username ? <EditorContent editor={editor} /> : 'Loading...'}
      <button onClick={generateAndCopyShareLink}>Share link</button>
      <button onClick={saveDocument}>Save</button>
    </div>
  );
};

export default Editor;
