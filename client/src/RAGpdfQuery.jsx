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
      const response = await axios.post('http://127.0.0.1:5000/perform_pdf_rag', { query, pdf_path });
      setResult(response.data.result);
      updateRecentQueries();
    } catch (error) {
      console.error('Error:', error);
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
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-center">File Reader</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={pdf_path}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter pdf path"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full px-4 py-2 text-white transition duration-300 bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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
          className="text-blue-500 transition duration-300 hover:text-blue-700"
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