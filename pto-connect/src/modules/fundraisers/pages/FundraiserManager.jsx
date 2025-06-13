import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../utils/supabaseClient';
import { toast } from 'react-toastify';
import DonationTierManager from './DonationTierManager';
import FundraiserAnalytics from './FundraiserAnalytics';
import SocialShare from './SocialShare';

const FundraiserManager = () => {
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);

  useEffect(() => {
    fetchFundraisers();
  }, []);

  const fetchFundraisers = async () => {
    try {
      const { data, error } = await supabase
        .from('fundraisers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFundraisers(data);
    } catch (error) {
      toast.error('Error fetching fundraisers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fundraiser?')) return;

    try {
      const { error } = await supabase
        .from('fundraisers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Fundraiser deleted successfully');
      fetchFundraisers();
    } catch (error) {
      toast.error('Error deleting fundraiser');
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fundraisers</h1>
        <Link
          to="/fundraisers/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Fundraiser
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundraisers.map((fundraiser) => (
          <div
            key={fundraiser.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-2">{fundraiser.title}</h2>
            <p className="text-gray-600 mb-4">{fundraiser.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-bold">
                ${fundraiser.goal_amount}
              </span>
              <div className="space-x-2">
                <Link
                  to={`/fundraisers/${fundraiser.id}/edit`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(fundraiser.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFundraiser && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Fundraiser Details</h2>
          <DonationTierManager fundraiserId={selectedFundraiser.id} />
          <FundraiserAnalytics fundraiserId={selectedFundraiser.id} />
          <SocialShare fundraiserId={selectedFundraiser.id} />
        </div>
      )}
    </div>
  );
};

export default FundraiserManager; 