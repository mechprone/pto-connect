import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
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
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';

const DonationTierManager = ({ fundraiserId, onTierAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    benefits: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tierData = {
        ...formData,
        fundraiser_id: fundraiserId,
        amount: parseFloat(formData.amount),
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('donation_tiers')
        .insert([tierData])
        .select()
        .single();

      if (error) throw error;

      setFormData({
        name: '',
        amount: '',
        description: '',
        benefits: ''
      });

      toast.success('Donation tier added successfully');
      if (onTierAdded) {
        onTierAdded(data);
      }
    } catch (error) {
      console.error('Error adding donation tier:', error);
      toast.error('Failed to add donation tier');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Donation Tier</CardTitle>
        <CardDescription>
          Create a new donation tier for your fundraiser
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tier Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Bronze Supporter"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Enter donation amount"
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
              placeholder="Describe what this tier represents"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="List any benefits or perks for this tier"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Donation Tier'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DonationTierManager; 