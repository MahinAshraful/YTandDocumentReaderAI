import React, { useState } from 'react';
import { supabase } from './supabase';

const UploadPDFButton = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default UploadPDFButton;
