import React, { useState } from 'react';

const UnsplashTest = () => {
  const [apiKey, setApiKey] = useState('');
  const [searchTerm, setSearchTerm] = useState('school');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testApiKey = async () => {
    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=10`,
        {
          headers: {
            'Authorization': `Client-ID ${apiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setImages(data.results);
      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Unsplash API Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Your Unsplash API Key (Access Key):
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Unsplash Access Key"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Search Term:
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="e.g., school, education, children"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        
        <button 
          onClick={testApiKey}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test API Key'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div>
          <h3>Test Results ({images.length} images found)</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '10px' 
          }}>
            {images.map((image) => (
              <div key={image.id} style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                <img 
                  src={image.urls.small} 
                  alt={image.alt_description || 'Unsplash image'}
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
                <div style={{ padding: '8px', fontSize: '12px' }}>
                  <div>By: {image.user.name}</div>
                  <div>Likes: {image.likes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Go to <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer">https://unsplash.com/developers</a></li>
          <li>Register as a developer</li>
          <li>Create a new application</li>
          <li>Copy your "Access Key" (not the Secret Key)</li>
          <li>Paste it above and test</li>
        </ol>
      </div>
    </div>
  );
};

export default UnsplashTest; 