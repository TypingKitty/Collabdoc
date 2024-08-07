import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';


const ydoc = new Y.Doc();
const provider = new WebrtcProvider('room', ydoc);

const Editor = () => {
  const initialDoc = { name: 'untitled', content: '<p>Hello</p>' };
  const [username, setUsername] = useState(null);
  const [docname, setDocname] = useState(initialDoc.name);

  useEffect(() => {
    const name = prompt('Enter your name:');
    setUsername(name || 'Anonymous');
  }, []);

  const handleDocName = (event) => {
    setDocname(event.target.value);
  };

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
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
        style={{ width: '100%', marginBottom: '10px' }} // Ensure proper styling
      />
      {username ? <EditorContent editor={editor} /> : 'Loading...'}
    </div>
  );
};

export default Editor;
