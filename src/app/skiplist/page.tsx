'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Globe, 
  User, 
  AlertCircle, 
  Loader2,
  Lock,
  ChevronLeft,
  Search
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

interface SkiplistItem {
  id: string;
  type: 'domain' | 'address';
  value: string;
  comment: string;
  status: string;
  is_global: boolean;
  created_at: string;
}

export default function SkiplistPage() {
  const { user, hapticFeedback } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [skiplist, setSkiplist] = useState<SkiplistItem[]>([]);
  const [view, setView] = useState<'personal' | 'global'>('personal');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbUser, setDbUser] = useState<any>(null);

  const [newItem, setNewItem] = useState({
    type: 'address' as 'address' | 'domain',
    value: '',
    comment: ''
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get profile from DB
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', user.id)
        .maybeSingle();

      if (profile) {
        setDbUser(profile);
      }

      // 2. Get skiplist
      let query = supabase.from('skiplist').select('*');
      
      if (view === 'personal') {
        if (profile) {
          query = query.eq('user_id', profile.id).eq('is_global', false);
        } else {
          setSkiplist([]);
          setLoading(false);
          return;
        }
      } else {
        query = query.eq('is_global', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        setSkiplist(data as SkiplistItem[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newItem.value || !dbUser) return;
    
    hapticFeedback('medium');
    setLoading(true);

    const { error } = await supabase.from('skiplist').insert({
      user_id: dbUser.id,
      type: newItem.type,
      value: newItem.value,
      comment: newItem.comment,
      status: 'trusted',
      is_global: false
    });

    if (!error) {
      setNewItem({ type: 'address', value: '', comment: '' });
      setShowAddForm(false);
      fetchData();
    } else {
      console.error('Insert error:', error);
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    hapticFeedback('warning');
    const { error } = await supabase.from('skiplist').delete().eq('id', id);
    if (!error) {
      fetchData();
    }
  };

  const filteredItems = skiplist.filter(item => 
    item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.comment && item.comment.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="p-2 -ml-2 text-gray-600">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Skiplist Manager</h1>
          <div className="w-10" />
        </div>

        {/* View Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => { setView('personal'); hapticFeedback('light'); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              view === 'personal' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My List
          </button>
          <button
            onClick={() => { setView('global'); hapticFeedback('light'); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              view === 'global' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Global List
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search and Action */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {view === 'personal' && (
            <button
              onClick={() => { setShowAddForm(!showAddForm); hapticFeedback('light'); }}
              className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && view === 'personal' && (
          <div className="bg-white rounded-2xl border border-blue-100 p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add New Item</h3>
              <div className="flex p-1 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setNewItem({ ...newItem, type: 'address' })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    newItem.type === 'address' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Address
                </button>
                <button
                  onClick={() => setNewItem({ ...newItem, type: 'domain' })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    newItem.type === 'domain' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Domain
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  {newItem.type === 'address' ? 'TON Address' : 'Domain Name'}
                </label>
                <input
                  type="text"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  placeholder={newItem.type === 'address' ? 'EQD...' : 'example.com'}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  Comment (optional)
                </label>
                <input
                  type="text"
                  value={newItem.comment}
                  onChange={(e) => setNewItem({ ...newItem, comment: e.target.value })}
                  placeholder="e.g., My personal wallet"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={!newItem.value || loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Add to List'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List Items */}
        <div className="space-y-3">
          {loading && !skiplist.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Shield className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No items found</p>
              <p className="text-sm text-gray-400 mt-1">
                {view === 'personal' ? 'Add trusted items to skip warnings' : 'Global list is currently empty'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    item.type === 'address' ? 'bg-blue-50' : 'bg-purple-50'
                  }`}>
                    {item.type === 'address' ? (
                      <User className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-purple-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        item.type === 'address' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type}
                      </span>
                      {item.is_global && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" />
                          Global
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-mono text-gray-900 font-medium truncate mb-0.5">
                      {item.value}
                    </p>
                    {item.comment && (
                      <p className="text-xs text-gray-500 truncate">{item.comment}</p>
                    )}
                  </div>

                  {!item.is_global && view === 'personal' && (
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global List Info */}
        {view === 'global' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-semibold mb-1">Global Skiplist</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  These items are managed by TON Shield AI and are trusted for all users. You cannot edit these entries.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
