import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { Plus, Building, DollarSign, Calendar, User, CheckCircle } from 'lucide-react';
import { api } from '@/utils/api';

const EventSponsorships = ({ eventId, onSponsorshipUpdated }) => {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSponsorships();
  }, [eventId]);

  const loadSponsorships = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}/sponsorships`);
      setSponsorships(response.data);
    } catch (err) {
      setError('Failed to load sponsorships');
      console.error('Error loading sponsorships:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'negotiating': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadSponsorships} variant="outline" className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sponsorships ({sponsorships.length})</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsorship
        </Button>
      </div>

      {/* Sponsorship Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sponsorship Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${sponsorships.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Raised</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {sponsorships.filter(s => s.status === 'confirmed').length}
            </p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {sponsorships.filter(s => s.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {sponsorships.length}
            </p>
            <p className="text-sm text-gray-600">Total Sponsors</p>
          </div>
        </div>
      </Card>

      {/* Sponsorships List */}
      <div className="space-y-3">
        {sponsorships.length === 0 ? (
          <Card className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No sponsorships found for this event.</p>
            <Button variant="outline">
              Add First Sponsorship
            </Button>
          </Card>
        ) : (
          sponsorships.map((sponsorship) => (
            <Card key={sponsorship.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-lg">{sponsorship.sponsor_name}</h3>
                    <Badge className={getTierColor(sponsorship.tier)}>
                      {sponsorship.tier}
                    </Badge>
                    <Badge className={getStatusColor(sponsorship.status)}>
                      {sponsorship.status}
                    </Badge>
                  </div>
                  
                  {sponsorship.description && (
                    <p className="text-gray-600 mb-3">{sponsorship.description}</p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    {sponsorship.amount && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${sponsorship.amount.toLocaleString()}
                      </div>
                    )}
                    {sponsorship.contact_person && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {sponsorship.contact_person}
                      </div>
                    )}
                    {sponsorship.contact_email && (
                      <div className="flex items-center">
                        <span className="mr-1">📧</span>
                        {sponsorship.contact_email}
                      </div>
                    )}
                    {sponsorship.contact_phone && (
                      <div className="flex items-center">
                        <span className="mr-1">📞</span>
                        {sponsorship.contact_phone}
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  {sponsorship.benefits && sponsorship.benefits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                      <div className="space-y-1">
                        {sponsorship.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventSponsorships; 