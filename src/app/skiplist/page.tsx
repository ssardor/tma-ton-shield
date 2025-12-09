'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle, Globe, User } from 'lucide-react';

// Mock data for demonstration
const MOCK_SKIPLIST = [
  {
    id: '1',
    type: 'address' as const,
    value: 'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2',
    label: 'My Cold Wallet',
    addedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    type: 'domain' as const,
    value: 'getgems.io',
    label: 'Trusted NFT Marketplace',
    addedAt: '2024-12-05T15:30:00Z',
  },
  {
    id: '3',
    type: 'address' as const,
    value: 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N',
    label: 'Friend\'s Wallet',
    addedAt: '2024-12-08T09:15:00Z',
  },
];

export default function SkiplistPage() {
  const router = useRouter();
  const [skiplist, setSkiplist] = useState(MOCK_SKIPLIST);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'address' as 'address' | 'domain',
    value: '',
    label: '',
  });

  const handleAdd = () => {
    // TODO: Add validation and actual logic
    console.log('Adding to skiplist:', newItem);
    setShowAddForm(false);
    setNewItem({ type: 'address', value: '', label: '' });
  };

  const handleRemove = (id: string) => {
    // TODO: Add confirmation and actual logic
    console.log('Removing from skiplist:', id);
    setSkiplist(skiplist.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Skiplist
            </h1>
            <p className="text-sm text-gray-600">Trusted addresses & domains</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">What is Skiplist?</h3>
              <p className="text-sm text-green-700">
                Add trusted addresses and domains to skip security warnings. Perfect for your own wallets, friends, and verified services.
              </p>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 shadow-sm">
            <h3 className="font-semibold text-gray-900">Add to Skiplist</h3>
            
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setNewItem({ ...newItem, type: 'address' })}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  newItem.type === 'address'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Address
              </button>
              <button
                onClick={() => setNewItem({ ...newItem, type: 'domain' })}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  newItem.type === 'domain'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Domain
              </button>
            </div>

            {/* Value Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {newItem.type === 'address' ? 'TON Address' : 'Domain Name'}
              </label>
              <input
                type="text"
                value={newItem.value}
                onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                placeholder={newItem.type === 'address' ? 'EQD...' : 'example.com'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Label Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label (optional)
              </label>
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                placeholder="e.g., My Wallet, DEX, Friend"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newItem.value}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Skiplist
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ type: 'address', value: '', label: '' });
                }}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skiplist Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Trusted Items ({skiplist.length})
            </h3>
          </div>

          {skiplist.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No items in skiplist</p>
              <p className="text-sm text-gray-400">
                Add trusted addresses and domains to skip warnings
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {skiplist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {item.type === 'address' ? (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {item.label && (
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {item.label}
                        </p>
                      )}
                      <p className="text-sm font-mono text-gray-600 truncate">
                        {item.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Important</h3>
              <p className="text-sm text-amber-700">
                Only add addresses and domains you completely trust. Skiplisted items will bypass all security checks.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-gray-600">Addresses</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {skiplist.filter(item => item.type === 'address').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-gray-600">Domains</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {skiplist.filter(item => item.type === 'domain').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
