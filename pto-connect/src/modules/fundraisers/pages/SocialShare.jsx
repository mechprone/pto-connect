import React from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

const SocialShare = ({ fundraiser }) => {
  const handleShare = async (platform) => {
    try {
      // Record the share in the database
      const { error } = await supabase
        .from('fundraiser_shares')
        .insert([{
          fundraiser_id: fundraiser.id,
          platform,
          shared_by: fundraiser.created_by
        }]);

      if (error) throw error;

      // Generate share URL and text
      const shareUrl = encodeURIComponent(fundraiser.campaign_page_url);
      const shareText = encodeURIComponent(fundraiser.social_share_text || fundraiser.title);

      // Open share dialog based on platform
      switch (platform) {
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            'facebook-share',
            'width=580,height=296'
          );
          break;

        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            'twitter-share',
            'width=580,height=296'
          );
          break;

        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            'linkedin-share',
            'width=580,height=296'
          );
          break;

        case 'email':
          const subject = encodeURIComponent(`Support ${fundraiser.title}`);
          const body = encodeURIComponent(
            `${fundraiser.social_share_text || fundraiser.title}\n\n` +
            `Learn more and donate here: ${fundraiser.campaign_page_url}`
          );
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
          break;

        default:
          break;
      }

      toast.success('Share recorded successfully');
    } catch (error) {
      console.error('Error recording share:', error);
      toast.error('Failed to record share');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Share this Fundraiser</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
              clipRule="evenodd"
            />
          </svg>
          Facebook
        </Button>

        <Button
          variant="outline"
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
          Twitter
        </Button>

        <Button
          variant="outline"
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              clipRule="evenodd"
            />
          </svg>
          LinkedIn
        </Button>

        <Button
          variant="outline"
          onClick={() => handleShare('email')}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Email
        </Button>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Share this fundraiser with your network to help reach the fundraising goal!
        </p>
      </div>
    </div>
  );
};

export default SocialShare; 