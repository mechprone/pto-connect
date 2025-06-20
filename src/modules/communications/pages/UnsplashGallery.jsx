import React, { useState, useEffect, useCallback } from 'react';

const UnsplashGallery = ({ editor, apiKey }) => {
  const [searchTerm, setSearchTerm] = useState('business');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchImages = useCallback(async () => {
    if (!apiKey) {
      setError('Unsplash API key is not configured.');
      return;
    }
    setLoading(true);
    setError('');
    setImages([]);

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=20&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${apiKey}`
          }
        }
      );

      if (response.status === 403) {
        setError('Rate limit exceeded or invalid key. Please check your Unsplash account.');
        throw new Error('API request forbidden');
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setImages(data.results);
    } catch (err) {
      console.error(err);
      if (!error) {
        setError(`Error fetching images: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [apiKey, searchTerm, error]);

  const addImageToAssets = (image) => {
    if (!editor) return;

    editor.AssetManager.add({
      src: image.urls.regular,
      name: image.alt_description || searchTerm,
    });
    
    // Open the asset manager to show the newly added image
    editor.runCommand('open-assets');
  };

  // Perform an initial search on component mount
  useEffect(() => {
    searchImages();
  }, [searchImages]);

  return (
    <div style={{ padding: '10px', color: '#333' }}>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchImages()}
          placeholder="Search for photos..."
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button onClick={searchImages} disabled={loading} style={{ padding: '0 15px', border: 'none', background: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? '...' : 'Go'}
        </button>
      </div>
      {error && <div style={{ color: '#d9534f', padding: '8px', marginBottom: '10px', background: '#f2dede', borderRadius: '4px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
        {images.map(img => (
          <div key={img.id} onClick={() => addImageToAssets(img)} style={{ cursor: 'pointer', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
            <img src={img.urls.thumb} alt={img.alt_description} style={{ width: '100%', display: 'block' }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.6)', color: 'white',
                fontSize: '10px', padding: '4px', overflow: 'hidden',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'center'
              }}>
                by {img.user.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnsplashGallery; 