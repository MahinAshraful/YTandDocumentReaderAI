import React, { useState, useEffect } from 'react';
import RAGytQueryComponent from './RAGytQuery';
import RAGpdfQueryComponent from './RAGpdfQuery';
import UploadPDFButton from './UploadPDFButton';
import { supabase } from './supabase';
import BucketItems from './BucketItems';

function App() {
  const [theme, setTheme] = useState('light');
  const [showIntro, setShowIntro] = useState(true);
  const [recentQueries, setRecentQueries] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const bucketName = 'your-bucket-name';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Load recent queries from localStorage
    const savedQueries = JSON.parse(localStorage.getItem('recentQueries') || '[]');
    setRecentQueries(savedQueries);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const addRecentQuery = (query, type) => {
    const newQuery = { query, type, timestamp: new Date().toISOString() };
    const updatedQueries = [newQuery, ...recentQueries.slice(0, 9)];
    setRecentQueries(updatedQueries);
    localStorage.setItem('recentQueries', JSON.stringify(updatedQueries));
  };

  const handleUploadSuccess = () => {
    setUpdateTrigger(prev => prev + 1);
  };




  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-slate-500' : 'bg-gray-300 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-5xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">RAG Query System</h1>
          <span>
            <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'}`}
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </span>
        </header>

        {showIntro && (
          <div className="p-6 mb-8 bg-blue-100 rounded-lg shadow-md dark:bg-blue-700 animate-fade-in">
            <h2 className="mb-4 text-2xl font-semibold">Welcome to the RAG Query System!</h2>
            <p className="mb-4">
              This system allows you to ask questions about YouTube videos or PDFs using advanced AI technology.
              Simply enter your query and the YouTube video link or PDF path, and our system will provide relevant information.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Got it, thanks!
            </button>
          </div>
        )}

        <UploadPDFButton onUploadSuccess={handleUploadSuccess} />
        <br />
        <div>
          <RAGpdfQueryComponent
            onQuerySubmit={(query) => addRecentQuery(query, 'PDF')}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
        <br />
        <RAGytQueryComponent onQuerySubmit={(query) => addRecentQuery(query, 'YouTube')} />



        <footer className="mt-12 text-sm text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 RAG Query System. All rights reserved.</p>
          <p className="mt-2">
            Powered by AI - Bringing video content to your fingertips.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App
