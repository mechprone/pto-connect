import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';

const FundraiserManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentOrg } = useOrganization();
  const [fundraisers, setFundraisers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFundraisers();
    fetchCategories();
  }, [currentOrg?.id]);

  const fetchFundraisers = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraisers')
        .select(`
          *,
          fundraiser_categories(name),
          donation_tiers(*),
          fundraiser_analytics(*)
        `)
        .eq('org_id', currentOrg?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFundraisers(data);
    } catch (error) {
      console.error('Error fetching fundraisers:', error);
      toast.error('Failed to load fundraisers');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateFundraiser = () => {
    navigate('/fundraisers/new');
  };

  const handleFundraiserClick = (fundraiser) => {
    setSelectedFundraiser(fundraiser);
    setActiveTab('overview');
  };

  const calculateProgress = (fundraiser) => {
    const totalDonations = fundraiser.donation_tiers?.reduce((sum, tier) => {
      return sum + (tier.amount * (tier.donations_count || 0));
    }, 0) || 0;
    
    return Math.min((totalDonations / fundraiser.goal_amount) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fundraisers</h1>
        <Button onClick={handleCreateFundraiser}>Create New Fundraiser</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fundraisers.map((fundraiser) => (
          <Card
            key={fundraiser.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleFundraiserClick(fundraiser)}
          >
            <CardHeader>
              <CardTitle>{fundraiser.title}</CardTitle>
              <CardDescription>
                {fundraiser.fundraiser_categories?.name || 'Uncategorized'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Progress</Label>
                  <Progress value={calculateProgress(fundraiser)} className="mt-2" />
                  <div className="flex justify-between text-sm mt-1">
                    <span>{formatCurrency(fundraiser.goal_amount)} Goal</span>
                    <span>{formatCurrency(fundraiser.current_amount)} Raised</span>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      fundraiser.status === 'active' ? 'bg-green-100 text-green-800' :
                      fundraiser.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {fundraiser.status.charAt(0).toUpperCase() + fundraiser.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFundraiser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedFundraiser.title}</CardTitle>
                  <CardDescription>
                    {selectedFundraiser.fundraiser_categories?.name || 'Uncategorized'}
                  </CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setSelectedFundraiser(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tiers">Donation Tiers</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-4">
                    <div>
                      <Label>Description</Label>
                      <p className="mt-1">{selectedFundraiser.description}</p>
                    </div>
                    <div>
                      <Label>Progress</Label>
                      <Progress value={calculateProgress(selectedFundraiser)} className="mt-2" />
                      <div className="flex justify-between text-sm mt-1">
                        <span>{formatCurrency(selectedFundraiser.goal_amount)} Goal</span>
                        <span>{formatCurrency(selectedFundraiser.current_amount)} Raised</span>
                      </div>
                    </div>
                    <div>
                      <Label>Campaign Page</Label>
                      <div className="mt-1">
                        <a
                          href={selectedFundraiser.campaign_page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Campaign Page
                        </a>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tiers">
                  <div className="space-y-4">
                    {selectedFundraiser.donation_tiers?.map((tier) => (
                      <Card key={tier.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{tier.name}</h3>
                              <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(tier.amount)}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {tier.donations_count || 0} donations
                            </div>
                          </div>
                          <p className="mt-2">{tier.description}</p>
                          {tier.benefits && (
                            <div className="mt-2">
                              <Label>Benefits</Label>
                              <p className="text-sm text-gray-600">{tier.benefits}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="space-y-4">
                    {selectedFundraiser.fundraiser_analytics?.map((analytic) => (
                      <Card key={analytic.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{analytic.metric}</h3>
                              <p className="text-2xl font-bold">{analytic.value}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(analytic.date).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={selectedFundraiser.status}
                        onValueChange={async (value) => {
                          try {
                            const { error } = await supabase
                              .from('fundraisers')
                              .update({ status: value })
                              .eq('id', selectedFundraiser.id);

                            if (error) throw error;
                            setSelectedFundraiser({ ...selectedFundraiser, status: value });
                            toast.success('Status updated successfully');
                          } catch (error) {
                            console.error('Error updating status:', error);
                            toast.error('Failed to update status');
                          }
                        }}
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
                      <Label>Visibility</Label>
                      <Select
                        value={selectedFundraiser.visibility}
                        onValueChange={async (value) => {
                          try {
                            const { error } = await supabase
                              .from('fundraisers')
                              .update({ visibility: value })
                              .eq('id', selectedFundraiser.id);

                            if (error) throw error;
                            setSelectedFundraiser({ ...selectedFundraiser, visibility: value });
                            toast.success('Visibility updated successfully');
                          } catch (error) {
                            console.error('Error updating visibility:', error);
                            toast.error('Failed to update visibility');
                          }
                        }}
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
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FundraiserManager; 