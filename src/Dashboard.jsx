import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [docLink, setDocLink] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false); // State to track document creation
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await axios.get('http://localhost:5000/documents', {
          params: { userId: user.id },
        });

        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          console.error('Unexpected data format:', data);
          setError('Failed to load documents.');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Error fetching documents.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchDocuments();
    }
  }, [user]);

  const handleDocumentClick = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    const docId = docLink.split('/').pop(); // Assuming the link contains the document ID at the end
    navigate(`/documents/${docId}`);
  };

  const createDocument = async () => {
    setCreatingDoc(true);
    try {
      const { data } = await axios.post('http://localhost:5000/documents', {
        userId: user.id,
      });
      setDocuments((prevDocs) => [data, ...prevDocs]); // Add the new document to the beginning of the list
      navigate(`/documents/${data.id}`); // Redirect to the new document
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Failed to create document.');
    } finally {
      setCreatingDoc(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <button onClick={createDocument} disabled={creatingDoc}>
        {creatingDoc ? 'Creating...' : 'Create Document'}
      </button>
      <ul>
        {documents.length > 0 ? (
          documents.map((doc) => (
            <li key={doc.id} onClick={() => handleDocumentClick(doc.id)}>
              {doc.title}
            </li>
          ))
        ) : (
          <p>No documents available.</p>
        )}
      </ul>
      <h3>Access with a link</h3>
      <form onSubmit={handleLinkSubmit}>
        <textarea 
          value={docLink}
          onChange={(e) => setDocLink(e.target.value)}
          placeholder="Enter document link here"
        ></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Dashboard;
