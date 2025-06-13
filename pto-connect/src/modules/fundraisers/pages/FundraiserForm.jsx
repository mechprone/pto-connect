import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';

const FundraiserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    category_id: '',
    status: 'draft',
    visibility: 'private',
    featured_image_url: '',
    campaign_page_url: '',
    social_share_text: '',
    analytics_enabled: true
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchFundraiser();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraiser_categories')
        .select('*')
        .eq('org_id', currentOrg?.id)
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchFundraiser = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraisers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error('Error fetching fundraiser:', error);
      toast.error('Failed to load fundraiser');
      navigate('/fundraisers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fundraiserData = {
        ...formData,
        org_id: currentOrg.id,
        goal_amount: parseFloat(formData.goal_amount),
        created_by: user.id
      };

      if (id) {
        const { error } = await supabase
          .from('fundraisers')
          .update(fundraiserData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Fundraiser updated successfully');
      } else {
        const { error } = await supabase
          .from('fundraisers')
          .insert([fundraiserData]);

        if (error) throw error;
        toast.success('Fundraiser created successfully');
      }

      navigate('/fundraisers');
    } catch (error) {
      console.error('Error saving fundraiser:', error);
      toast.error('Failed to save fundraiser');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Fundraiser' : 'Create New Fundraiser'}</CardTitle>
          <CardDescription>
            {id ? 'Update your fundraiser details' : 'Set up a new fundraiser for your organization'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter fundraiser title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your fundraiser"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="goal_amount">Goal Amount</Label>
                <Input
                  id="goal_amount"
                  name="goal_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.goal_amount}
                  onChange={handleChange}
                  required
                  placeholder="Enter goal amount"
                />
              </div>

              <div>
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => handleSelectChange('visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="featured_image_url">Featured Image URL</Label>
                <Input
                  id="featured_image_url"
                  name="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <Label htmlFor="campaign_page_url">Campaign Page URL</Label>
                <Input
                  id="campaign_page_url"
                  name="campaign_page_url"
                  value={formData.campaign_page_url}
                  onChange={handleChange}
                  placeholder="Enter campaign page URL"
                />
              </div>

              <div>
                <Label htmlFor="social_share_text">Social Share Text</Label>
                <Textarea
                  id="social_share_text"
                  name="social_share_text"
                  value={formData.social_share_text}
                  onChange={handleChange}
                  placeholder="Enter text for social media sharing"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/fundraisers')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : id ? 'Update Fundraiser' : 'Create Fundraiser'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundraiserForm; 