import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, DollarSign, User, Star, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  owner_id: string;
  created_at: string;
}

interface Profile {
  full_name: string;
  avatar_url: string;
}

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  async function fetchItemDetails() {
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (itemError) throw itemError;
      setItem(itemData);

      if (itemData) {
        const { data: ownerData, error: ownerError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', itemData.owner_id)
          .single();

        if (ownerError) throw ownerError;
        setOwner(ownerData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {item.title}
            </h1>

            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <Tag className="w-5 h-5" />
              <span className="capitalize">{item.category}</span>
            </div>

            <div className="flex items-center space-x-2 text-indigo-600 text-2xl font-bold mb-6">
              <DollarSign className="w-6 h-6" />
              <span>${item.price}/day</span>
            </div>

            <p className="text-gray-600 mb-6">{item.description}</p>

            {owner && (
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {owner.avatar_url ? (
                    <img
                      src={owner.avatar_url}
                      alt={owner.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Listed by</p>
                  <p className="font-medium">{owner.full_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Calendar className="w-4 h-4" />
              <span>
                Listed on{' '}
                {format(new Date(item.created_at), 'MMMM d, yyyy')}
              </span>
            </div>

            {user && user.id !== item.owner_id && (
              <button
                onClick={() => {
                  // TODO: Implement rental request
                }}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
              >
                <span>Request to Rent</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}