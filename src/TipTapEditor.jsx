import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import './editor.css';

const ydoc = new Y.Doc();
const provider = new WebrtcProvider('room', ydoc);
const awareness = provider.awareness;

const Editor = () => {
  const initialDoc = { name: 'untitled', content: '<p>Hello</p>' };
  const [username, setUsername] = useState(null);
  const [docname, setDocname] = useState(initialDoc.name);

  useEffect(() => {
    const name = prompt('Enter your name:');
    setUsername(name || 'Anonymous');

    // Set the initial awareness state
    awareness.setLocalStateField('user', {
      name: name || 'Anonymous',
    });

    // Track user entries and exits
    const previousStates = new Set();

    const handleAwarenessUpdate = () => {
      const currentStates = new Set(Array.from(awareness.getStates().keys()));

      // Determine who has entered or left
      const entered = Array.from(currentStates).filter(userId => !previousStates.has(userId));
      const left = Array.from(previousStates).filter(userId => !currentStates.has(userId));

      // Call API for users who entered
      entered.forEach(userId => {
        const userState = awareness.getStates().get(userId);
        if (userState) {
          const userName = userState.user.name;
          console.log(`${userName} has entered the room`);
          fetch('https://your-api-endpoint.com/user-entered', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userName, docname }),
          });
        }
      });

      // Call API for users who left
      left.forEach(userId => {
        const userState = awareness.getStates().get(userId);
        if (userState) {
          const userName = userState.user.name;
          console.log(`${userName} has left the room`);
          fetch('https://your-api-endpoint.com/user-left', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: userName, docname }),
          });
        }
      });

      // Update previousStates
      previousStates.clear();
      currentStates.forEach(userId => previousStates.add(userId));
    };

    awareness.on('change', handleAwarenessUpdate);

    // Cleanup on component unmount
    return () => {
      awareness.off('change', handleAwarenessUpdate);
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
      content: initialDoc.content,
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
    </div>
  );
};

export default Editor;
