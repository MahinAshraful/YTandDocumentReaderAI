import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabase';

function RAGpdfQueryComponent({ onQuerySubmit, onUploadSuccess }) {
  const [query, setQuery] = useState('');
  const [pdf_path, setLink] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentQueries, setRecentQueries] = useState([]);
  const [showTips, setShowTips] = useState(false);
  const [pdfList, setPdfList] = useState([]);
  const [showPdfList, setShowPdfList] = useState(true);

  useEffect(() => {
    const storedQueries = JSON.parse(localStorage.getItem('recentQueries') || '[]');
    setRecentQueries(storedQueries);
    fetchPDFs();
  }, [onUploadSuccess]);

  const fetchPDFs = async () => {
    const { data, error } = await supabase.storage
      .from('your-bucket-name')
      .list();

    if (error) {
      console.error('Error fetching PDFs:', error.message);
    } else {
      setPdfList(data);
    }

  };

  const formatPdfName = (name) => {
    // Remove the first 10 characters and the following underscore
    return name.slice(14);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/perform_pdf_rag`, { query, pdf_path });
      setResult(response.data.result);
      updateRecentQueries();
      onQuerySubmit(query);
    } catch (error) {
      console.error('Error processing request:', error);
      setResult('An error occurred while processing your request.');
    }
    setIsLoading(false);
  };

  const updateRecentQueries = () => {
    const updatedQueries = [{ query, pdf_path }, ...recentQueries.slice(0, 4)];
    setRecentQueries(updatedQueries);
    localStorage.setItem('recentQueries', JSON.stringify(updatedQueries));
  };

  const handleViewFile = async (pdfName) => {
    try {
      const { data, error } = await supabase.storage
        .from('your-bucket-name')
        .createSignedUrl(pdfName, 60); // URL valid for 60 seconds

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error.message);
    }
  };

  const handleDeleteFile = async (pdfName) => {
    try {
      const { error } = await supabase.storage
        .from('your-bucket-name')
        .remove([pdfName]);

      if (error) throw error;

      fetchPDFs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting file:', error.message);
    }
  };

  return (
    <div className="p-6 mx-auto bg-gray-100 rounded-lg shadow-md shadow-gray-400">
      <h1 className="text-3xl font-bold text-center">File Reader</h1>
      <p className='text-center text-gray-500'>Click the "View" button to open and the PDF link</p>
      <div className="mb-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Uploaded PDFs</h2>
          <button
            onClick={() => setShowPdfList(!showPdfList)}
            className="text-blue-600 transition duration-300 hover:text-blue-700"
          >
            {showPdfList ? 'Hide' : 'Show'}
          </button>
        </div>
        {showPdfList && (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {pdfList.map((pdf) => (
              <li
                key={pdf.id}
                className="p-3 bg-blue-100 rounded-md shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{formatPdfName(pdf.name)}</span>
                  <div>
                    <button
                      onClick={() => handleViewFile(pdf.name)}
                      className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteFile(pdf.name)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {showPdfList && pdfList.length === 0 && (
          <p className="text-center text-gray-500">No PDFs uploaded yet.</p>
        )}
      </div>

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
          placeholder="Enter PDF link "
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
          <div className="p-4 mt-2 rounded-md bg-blue-100 animate-fade-in">
            <h4 className="mb-2 font-semibold">How to use:</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Enter your question in the first box</li>
              <li>Select a PDF from the list above or enter the PDF path manually</li>
              <li>Press Submit and wait up to 15 sec!</li>
            </ul>
            <br />
            <h4 className="mb-2 font-semibold">Tips for effective queries:</h4>
            <ul className="space-y-1 text-sm list-disc list-inside">
              <li>Formulate questions that target particular sections or details in the PDF</li>
              <li>Identify and use key terms or phrases that are central to the PDF's content</li>
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

