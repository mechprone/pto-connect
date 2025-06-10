import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, X, Loader2, Wand2, Facebook, Instagram, Twitter, Image as ImageIcon } from 'lucide-react';

const AiWizardModal = ({ mode, onGenerate, onClose }) => {
  const [autoPrompt, setAutoPrompt] = useState('');
  const [assistedData, setAssistedData] = useState({
    topic: '',
    keyInfo: '',
    hashtags: '',
    vibe: 'Excited'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI call
    setTimeout(() => {
      let post = '';
      if (mode === 'auto') {
        post = `🎉 Get ready! ${autoPrompt} is happening soon. We can't wait to see you there! #PTO #CommunityEvent`;
      } else {
        post = `
          📢 ${assistedData.vibe} announcement! 📢\n\n
          ${assistedData.topic}\n\n
          ${assistedData.keyInfo}\n\n
          ${assistedData.hashtags.split(' ').map(h => `#${h.replace('#','')}`).join(' ')}
        `;
      }
      
      onGenerate({ post: post.trim() });
      setIsGenerating(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stella's Social Assistant</h2>
              <p className="text-gray-600">
                {mode === 'auto' ? 'Give me a topic and I\'ll draft a post.' : 'Provide some details for a tailored post.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'auto' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's the post about?</label>
            <input type="text" value={autoPrompt} onChange={(e) => setAutoPrompt(e.target.value)} placeholder="e.g., Next week's bake sale" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <input type="text" value={assistedData.topic} onChange={(e) => setAssistedData({...assistedData, topic: e.target.value})} placeholder="Topic (e.g., Fall Festival Volunteer Signup)" className="w-full p-2 border border-gray-300 rounded-lg" />
            <textarea value={assistedData.keyInfo} onChange={(e) => setAssistedData({...assistedData, keyInfo: e.target.value})} placeholder="Key Info (e.g., We need 10 more volunteers! Sign up by Friday.)" className="w-full p-2 border border-gray-300 rounded-lg" rows={3} />
            <input type="text" value={assistedData.hashtags} onChange={(e) => setAssistedData({...assistedData, hashtags: e.target.value})} placeholder="Hashtags (e.g., #Volunteer #Community #PTO)" className="w-full p-2 border border-gray-300 rounded-lg" />
            <select value={assistedData.vibe} onChange={(e) => setAssistedData({...assistedData, vibe: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Excited</option>
              <option>Informational</option>
              <option>Urgent</option>
              <option>Grateful</option>
            </select>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
            {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-5 h-5 mr-2" />Generate Post</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SocialPostComposer() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Ready');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState(null);
  const [formData, setFormData] = useState({
    postContent: '',
    platforms: { facebook: true, instagram: false, twitter: false },
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'auto' || mode === 'assisted') {
      setAiMode(mode);
      setShowAiModal(true);
    }
  }, [searchParams]);

  const handleAiGenerate = ({ post }) => {
    setFormData(prev => ({ ...prev, postContent: post }));
    setStatus('AI draft loaded. Review and make edits.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, platforms: { ...prev.platforms, [name]: checked } }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      {showAiModal && (
        <AiWizardModal mode={aiMode} onClose={() => setShowAiModal(false)} onGenerate={handleAiGenerate} />
      )}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Social Media Post Composer</h1>
            <p className="text-sm text-gray-500">{status}</p>
          </div>
          <div className="space-x-3">
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Save Draft</button>
            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Schedule Post</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Composer */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
              <textarea name="postContent" value={formData.postContent} onChange={handleInputChange} placeholder="What's on your mind?" className="w-full p-2 border border-gray-300 rounded-lg" rows={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
              <div className="flex space-x-4">
                <label className="flex items-center"><input type="checkbox" name="facebook" checked={formData.platforms.facebook} onChange={handlePlatformChange} className="h-4 w-4 text-blue-600 rounded" /><Facebook className="w-5 h-5 ml-2 text-blue-700" /></label>
                <label className="flex items-center"><input type="checkbox" name="instagram" checked={formData.platforms.instagram} onChange={handlePlatformChange} className="h-4 w-4 text-pink-600 rounded" /><Instagram className="w-5 h-5 ml-2 text-pink-600" /></label>
                <label className="flex items-center"><input type="checkbox" name="twitter" checked={formData.platforms.twitter} onChange={handlePlatformChange} className="h-4 w-4 text-sky-500 rounded" /><Twitter className="w-5 h-5 ml-2 text-sky-500" /></label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Image</label>
              <input type="file" onChange={handleImageChange} accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">Social Media Preview</p>
            <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <img src="https://placehold.co/40x40/E2E8F0/4A5568" alt="avatar" className="w-10 h-10 rounded-full" />
                  <div className="ml-3">
                    <p className="font-semibold text-sm">Your PTO Name</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{formData.postContent || "Your post content will appear here..."}</p>
              </div>
              {imagePreview && <img src={imagePreview} alt="preview" className="w-full object-cover" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
