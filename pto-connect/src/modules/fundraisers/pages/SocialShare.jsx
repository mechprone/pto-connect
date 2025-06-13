import React from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';

const SocialShare = ({ fundraiserId }) => {
  const handleShare = async (platform) => {
    try {
      // Get fundraiser details
      const { data: fundraiser, error: fetchError } = await supabase
        .from('fundraisers')
        .select('title, description, campaign_page_url')
        .eq('id', fundraiserId)
        .single();

      if (fetchError) throw fetchError;

      // Record the share
      const { error: shareError } = await supabase
        .from('fundraiser_shares')
        .insert([{
          fundraiser_id: fundraiserId,
          platform,
          shared_at: new Date().toISOString()
        }]);

      if (shareError) throw shareError;

      // Generate share URL and text
      const shareUrl = fundraiser.campaign_page_url;
      const shareText = `Check out ${fundraiser.title}: ${fundraiser.description}`;

      // Open share dialog based on platform
      switch (platform) {
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            'facebook-share',
            'width=580,height=296'
          );
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            'twitter-share',
            'width=580,height=296'
          );
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            'linkedin-share',
            'width=580,height=296'
          );
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(fundraiser.title)}&body=${encodeURIComponent(shareText + '\\n\\n' + shareUrl)}`;
          break;
        default:
          break;
      }

      toast.success('Share recorded successfully');
    } catch (error) {
      toast.error('Error sharing fundraiser');
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Share This Fundraiser</h2>
      <p className="text-gray-600 mb-4">
        Help us reach our goal by sharing this fundraiser with your network.
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
          </svg>
          Share on Facebook
        </button>

        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
          </svg>
          Share on Twitter
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Share on LinkedIn
        </button>

        <button
          onClick={() => handleShare('email')}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          Share via Email
        </button>
      </div>
    </div>
  );
};

export default SocialShare; 