import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fundraisersAPI } from '@/utils/api';
import { handleError, handleSuccess } from '@/utils/errorHandling';
import PageLayout from '@/modules/components/layout/PageLayout';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { Facebook, Twitter, Linkedin, Link2, Copy, Check } from 'lucide-react';

export default function SocialShare() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundraiser, setFundraiser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFundraiser();
  }, [id]);

  const fetchFundraiser = async () => {
    try {
      setLoading(true);
      const { data, error } = await fundraisersAPI.getFundraiser(id);
      if (error) throw new Error(error);
      setFundraiser(data);
      setError(null);
    } catch (error) {
      const message = 'Failed to fetch fundraiser details';
      setError(message);
      handleError(error, message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const shareUrl = `${window.location.origin}/fundraisers/${id}`;
    const shareText = `Support ${fundraiser.title} - ${fundraiser.description}`;

    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        default:
          break;
      }
      handleSuccess('Shared successfully');
    } catch (error) {
      handleError(error, 'Failed to share');
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/fundraisers/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      handleSuccess('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      handleError(error, 'Failed to copy link');
    }
  };

  if (!fundraiser) return null;

  return (
    <PageLayout
      title="Share Fundraiser"
      loading={loading}
      error={error}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card
          title={fundraiser.title}
          description={fundraiser.description}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-2"
              >
                <Facebook className="h-5 w-5" />
                <span>Share on Facebook</span>
              </Button>

              <Button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2"
              >
                <Twitter className="h-5 w-5" />
                <span>Share on Twitter</span>
              </Button>

              <Button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-2"
              >
                <Linkedin className="h-5 w-5" />
                <span>Share on LinkedIn</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 truncate">
                {`${window.location.origin}/fundraisers/${id}`}
              </div>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
} 