import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RAGpdfQueryComponent() {
  const [query, setQuery] = useState('');
  const [pdf_path, setLink] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentQueries, setRecentQueries] = useState([]);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const storedQueries = JSON.parse(localStorage.getItem('recentQueries') || '[]');
    setRecentQueries(storedQueries);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/perform_pdf_rag`, { query, pdf_path });
      setResult(response.data.result);
      updateRecentQueries();
    } catch (error) {
      if (error.response) {
        console.error('Server responded with an error:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up the request:', error.message);
      }
      setResult('An error occurred while processing your request.');
    }
    setIsLoading(false);
  };

  const updateRecentQueries = () => {
    const updatedQueries = [{ query, pdf_path }, ...recentQueries.slice(0, 4)];
    setRecentQueries(updatedQueries);
    localStorage.setItem('recentQueries', JSON.stringify(updatedQueries));
  };

  return (
    <div className="p-6 mx-auto bg-gray-100 rounded-b-lg shadow-md shadow-gray-400">
      <h1 className="mb-6 text-3xl font-bold text-center">File Reader</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="text"
          value={pdf_path}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter pdf path"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full transition duration-300 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {result && (
        <div className="mt-6 animate-fade-in">
          <h3 className="mb-2 text-lg font-semibold">Result:</h3>
          <p className="p-4 bg-gray-100 rounded-md">{result}</p>
        </div>
      )}



      <div className="mt-8">
        <button
          onClick={() => setShowTips(!showTips)}
          className="text-blue-600 transition duration-300 hover:text-blue-700"
        >
          {showTips ? 'Hide' : 'How to Use'}
        </button>
        {showTips && (
          <div className="p-4 mt-2 rounded-md bg-blue-50 animate-fade-in">
            <h4 className="mb-2 font-semibold">How to use:</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Enter the your question in the first box</li>
              <li>Click on the View File button on desired file and copy the link</li>
              <li>Paste Link in the second box</li>
              <li>Press Submit and wait up to 15 sec!</li>
            </ul>
            <br />
            <h4 className="mb-2 font-semibold">Tips for effective queries:</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Formulate questions that target particular sections or details in the PDF</li>
              <li> Identify and use key terms or phrases that are central to the PDF’s content</li>
              <li>Focus on the main topics covered in the PDF</li>
              <li>If you know particular sections or pages that contain important information, reference them in your questions</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default RAGpdfQueryComponent;