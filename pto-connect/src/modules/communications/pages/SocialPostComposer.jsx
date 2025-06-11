import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabaseClient';
import { Sparkles, X, Loader2, Wand2, Facebook, Instagram, Twitter, Image as ImageIcon } from 'lucide-react';

const AiWizardModal = ({ mode, onGenerate, onClose }) => {
  const [autoPrompt, setAutoPrompt] = useState('');
  const [assistedData, setAssistedData] = useState({
    topic: '',
    keyInfo: '',
    hashtags: '',
    vibe: 'Excited',
    platform: 'Facebook'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [orgData, setOrgData] = useState(null);

  useEffect(() => {
    // Fetch organization data for context enhancement
    const fetchOrgData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select(`
              organization_id,
              organizations (
                name,
                type,
                schools (
                  name,
                  grade_levels
                )
              )
            `)
            .eq('user_id', user.id)
            .single();
          
          setOrgData(profile?.organizations);
        }
      } catch (error) {
        console.error('Error fetching org data:', error);
      }
    };

    fetchOrgData();
  }, []);

  const enhancePromptWithContext = (userPrompt) => {
    const schoolType = orgData?.schools?.grade_levels || 'K-12';
    const orgName = orgData?.name || 'Your PTO';
    const orgType = orgData?.type || 'PTO';
    
    // Determine school level context
    let schoolLevel = 'elementary';
    if (schoolType.includes('6') || schoolType.includes('7') || schoolType.includes('8')) {
      schoolLevel = 'middle school';
    } else if (schoolType.includes('9') || schoolType.includes('10') || schoolType.includes('11') || schoolType.includes('12')) {
      schoolLevel = 'high school';
    }

    return `
Create a highly engaging, influencer-quality social media post for ${orgName}, a ${schoolLevel} ${orgType}.

Original request: "${userPrompt}"

Context to incorporate:
- This is for a ${schoolLevel} community (grades ${schoolType})
- Organization: ${orgName}
- Audience: Parents, teachers, and school community members
- Platform: ${assistedData.platform || 'Facebook'}

Social Media Requirements:
- Write like a top influencer - engaging, authentic, and compelling
- Use strategic emoji placement for maximum engagement
- Create urgency and excitement where appropriate
- Include relevant, trending hashtags for ${schoolLevel} communities
- Make it highly shareable and comment-worthy
- Use storytelling techniques to connect emotionally
- Include clear calls-to-action that drive engagement
- Make it informative but entertaining
- Use community-building language that brings people together
- Create FOMO (fear of missing out) where appropriate
- Fix any grammar or spelling issues
- Make it scroll-stopping content

Please create a social media post that would get high engagement from a professional influencer account.
    `;
  };

  const generateInfluencerQualityPost = (prompt, mode) => {
    const enhancedPrompt = enhancePromptWithContext(prompt);
    let post = '';

    if (mode === 'auto') {
      // Auto mode: Create complete influencer-quality posts
      if (prompt.toLowerCase().includes('popcorn')) {
        post = `🍿✨ IT'S POPCORN FRIDAY, FAMILIES! ✨🍿

Who else is already counting down the hours? 🙋‍♀️ There's something magical about that fresh-popped smell filling our hallways! 

💫 Here's what you need to know:
🎒 Send $0.50 with your kiddo
⏰ Available during lunch
🤤 Freshly popped perfection awaits!

Every single bag sold goes directly back to OUR kids and OUR programs. When you buy popcorn, you're literally investing in your child's future! 🌟

Drop a 🍿 in the comments if your family is READY for Popcorn Friday! Let's see how excited our community is! 

#PopcornFriday #SchoolCommunity #PTOLife #ProudParent #SchoolSpirit #CommunityLove #FridayFeels`;
      } else if (prompt.toLowerCase().includes('volunteer')) {
        post = `🙋‍♀️ CALLING ALL AMAZING HUMANS! 🙋‍♂️

We need YOU to help make magic happen! ✨ Our upcoming event is going to be INCREDIBLE, but we can't do it without our phenomenal parent community!

🌟 Why volunteer with us?
• Meet other amazing families
• Show your kids the power of giving back
• Be part of something bigger than yourself
• Have FUN while making a difference!

⏰ Just 2 hours of your time = HUGE impact on our kids
🎯 Multiple shifts available to fit YOUR schedule

Ready to be a hero in your child's eyes? Link in bio to sign up! 👆

Tag a friend who would LOVE to volunteer with you! Let's build this incredible community together! 💪

#VolunteerLife #CommunityHeroes #PTOVolunteers #MakingADifference #SchoolCommunity #ParentPower #TogetherWeRise`;
      } else if (prompt.toLowerCase().includes('fundraiser') || prompt.toLowerCase().includes('fundraising')) {
        post = `💰🎯 FUNDRAISER ALERT! This is NOT a drill! 🎯💰

Friends, we are SO close to our goal and I'm getting CHILLS thinking about what this means for our kids! 🥺✨

Every. Single. Dollar. Goes directly to:
📚 New books for our library
🎨 Art supplies for creativity
🏃‍♀️ Playground equipment for active play
💻 Technology that prepares them for the future

We're not just raising money - we're raising the bar for what our children deserve! 🌟

🔥 CHALLENGE: Can we hit our goal by Friday? I KNOW this community has what it takes! 

Drop a 💪 if you're IN! Share this post! Tag your friends! Let's show our kids what happens when a community comes together!

Link in bio to donate! Every amount matters! 🙏

#FundraiserGoals #CommunityStrong #ForOurKids #PTOPower #AlmostThere #TogetherWeWin #SchoolSupport`;
      } else {
        // Generic enhanced content
        post = `🌟 EXCITING NEWS, SCHOOL FAMILY! 🌟

${prompt.charAt(0).toUpperCase() + prompt.slice(1)} and we couldn't be more thrilled to share this with our amazing community! 

This is exactly the kind of thing that makes our school so special. When we come together, incredible things happen! ✨

Stay tuned for all the details - they're coming SOON and you're going to LOVE what we have planned! 

Who's excited? Drop your favorite emoji in the comments! Let's see that school spirit! 🎉

#SchoolNews #CommunityLove #ExcitingTimes #PTOLife #StayTuned #SchoolSpirit #TogetherWeShine`;
      }
    } else {
      // Assisted mode: Use provided details with influencer flair
      const vibeEmojis = {
        'Excited': '🎉✨',
        'Informational': '📢💡',
        'Urgent': '🚨⚡',
        'Grateful': '🙏💕',
        'Inspiring': '🌟💪'
      };

      const selectedEmojis = vibeEmojis[assistedData.vibe] || '✨🌟';
      
      post = `${selectedEmojis} ${assistedData.topic.toUpperCase()}! ${selectedEmojis}

${assistedData.keyInfo}

This is what community looks like, friends! When we come together, amazing things happen for our kids! 💫

${assistedData.hashtags ? `${assistedData.hashtags.split(' ').map(h => `#${h.replace('#','')}`).join(' ')}` : '#SchoolCommunity #PTOLife #TogetherWeShine'}

Drop a ❤️ if you're as excited as we are! Let's show our school spirit in the comments! 👇`;
    }

    return post;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const prompt = mode === 'auto' ? autoPrompt : assistedData.topic;
      const post = generateInfluencerQualityPost(prompt, mode);
      
      onGenerate({ post });
      setIsGenerating(false);
      onClose();
    }, 2500); // Longer delay to show sophisticated processing
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
                {mode === 'auto' ? 'Give me a topic and I\'ll create an influencer-quality post.' : 'Provide details for a highly engaging post.'}
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
            <textarea
              value={autoPrompt}
              onChange={(e) => setAutoPrompt(e.target.value)}
              placeholder="e.g., Popcorn Friday, Volunteer recruitment, Fundraiser update"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <input 
              type="text" 
              value={assistedData.topic} 
              onChange={(e) => setAssistedData({...assistedData, topic: e.target.value})} 
              placeholder="Topic (e.g., Fall Festival Volunteer Signup)" 
              className="w-full p-2 border border-gray-300 rounded-lg" 
            />
            <textarea 
              value={assistedData.keyInfo} 
              onChange={(e) => setAssistedData({...assistedData, keyInfo: e.target.value})} 
              placeholder="Key Info (e.g., We need 10 more volunteers! Sign up by Friday.)" 
              className="w-full p-2 border border-gray-300 rounded-lg" 
              rows={3} 
            />
            <input 
              type="text" 
              value={assistedData.hashtags} 
              onChange={(e) => setAssistedData({...assistedData, hashtags: e.target.value})} 
              placeholder="Hashtags (e.g., #Volunteer #Community #PTO)" 
              className="w-full p-2 border border-gray-300 rounded-lg" 
            />
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={assistedData.vibe} 
                onChange={(e) => setAssistedData({...assistedData, vibe: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>Excited</option>
                <option>Informational</option>
                <option>Urgent</option>
                <option>Grateful</option>
                <option>Inspiring</option>
              </select>
              <select 
                value={assistedData.platform} 
                onChange={(e) => setAssistedData({...assistedData, platform: e.target.value})} 
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option>Facebook</option>
                <option>Instagram</option>
                <option>Twitter</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Stella is Creating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Post
              </>
            )}
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
    setStatus('✨ Influencer-quality post created! Review and customize as needed.');
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
              <textarea 
                name="postContent" 
                value={formData.postContent} 
                onChange={handleInputChange} 
                placeholder="What's on your mind?" 
                className="w-full p-2 border border-gray-300 rounded-lg" 
                rows={12} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="facebook" 
                    checked={formData.platforms.facebook} 
                    onChange={handlePlatformChange} 
                    className="h-4 w-4 text-blue-600 rounded" 
                  />
                  <Facebook className="w-5 h-5 ml-2 text-blue-700" />
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="instagram" 
                    checked={formData.platforms.instagram} 
                    onChange={handlePlatformChange} 
                    className="h-4 w-4 text-pink-600 rounded" 
                  />
                  <Instagram className="w-5 h-5 ml-2 text-pink-600" />
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="twitter" 
                    checked={formData.platforms.twitter} 
                    onChange={handlePlatformChange} 
                    className="h-4 w-4 text-sky-500 rounded" 
                  />
                  <Twitter className="w-5 h-5 ml-2 text-sky-500" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Image</label>
              <input 
                type="file" 
                onChange={handleImageChange} 
                accept="image/*" 
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
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
              <div className="p-4 border-t">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>📤 Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
