import React, { useState } from 'react';
import { supabase } from './supabase';

const UploadPDFButton = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file to upload.');

    try {
      setUploading(true);

      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from('your-bucket-name')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      alert('File uploaded successfully!');
      onUploadSuccess(); // Trigger the update
      fileName && setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label
        htmlFor="dropzone-file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center w-full h-50 border-2 border-gray-500 border-dashed rounded-lg cursor-pointer bg-gray-200 dark:border-gray-600 dark:hover:border-gray-500"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PDF Only</p>
          <button onClick={handleUpload} disabled={uploading} className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
      </label>
      {file && <p className="mt-2 ml-2 text-gray-700 font-bold">File to Upload: {file.name}</p>}
    </div>
  );
};

export default UploadPDFButton;