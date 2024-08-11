import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

const BucketItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBucketItems = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('your-bucket-name')
          .list('', { limit: 100 });

        if (error) {
          throw error;
        }

        const itemsWithUrls = await Promise.all(data
          .filter(item => item.name !== '.emptyFolderPlaceholder')
          .map(async item => {
            const { data, error: urlError } = await supabase
              .storage
              .from('your-bucket-name')
              .createSignedUrl(item.name, 60 * 60);

            if (urlError) {
              console.error('Error fetching signed URL:', urlError);
              return null;
            }

            return {
              name: item.name,
              url: data.signedUrl,
            };
          })
        );

        setItems(itemsWithUrls.filter(item => item !== null));
      } catch (error) {
        console.error('Error fetching bucket items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBucketItems();
  }, []);

  const deleteItem = async (itemName) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .storage
        .from('your-bucket-name')
        .remove([itemName]);

      if (error) {
        throw error;
      }

      // Remove the item from the state after successful deletion
      setItems(items.filter(item => item.name !== itemName));
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="w-16 h-16 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="p-6 bg-blue-200 rounded-t-lg shadow-md shadow-gray-400 dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">PDF's Uploaded</h2>
      <p className="mb-2 text-black">Click "View" to copy the link to PDF</p>
      {items.length === 0 ? (
        <p className="text-gray-800 dark:text-gray-400">No items found in the bucket.</p>
      ) : (
        <ul className="space-y-4">
          {items.map(item => (
            <li key={item.name} className="flex items-center justify-between p-4 rounded-md bg-gray-100 dark:bg-gray-600">
              <span className="font-medium text-gray-800 dark:text-gray-200">{item.name.substring(14)}</span>
              {item.url ? (
                <div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 mr-2 text-white transition duration-300 ease-in-out bg-blue-600 rounded hover:bg-blue-800"
                  >View
                  </a>
                  <a
                    onClick={() => deleteItem(item.name)}
                    className="p-2 text-white transition duration-300 ease-in-out bg-red-600 rounded hover:bg-red-800"
                  >X
                  </a>
                </div>

              ) : (
                <span className="text-red-600 dark:text-red-400">No URL available</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BucketItems;