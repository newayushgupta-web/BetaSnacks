import { useState } from 'react';
import { User, MapPin, Award, Lock, Plus, Trash2, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, addAddress, deleteAddress, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // profile, addresses, rewards, security

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // New Address State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    landmark: '',
    type: 'home',
  });

  const [saving, setSaving] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.pincode) {
      toast.error('Please fill required street and pincode fields');
      return;
    }
    setSaving(true);
    try {
      if (addAddress) {
        await addAddress(newAddress);
      } else {
        const currentAddresses = user?.addresses || [];
        const updatedList = [...currentAddresses, newAddress];
        await updateProfile({ addresses: updatedList });
      }
      toast.success('Address saved successfully!');
      setShowAddressModal(false);
      setNewAddress({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        landmark: '',
        type: 'home',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addr, indexToDelete) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      if (deleteAddress && addr?._id) {
        await deleteAddress(addr._id);
      } else {
        const updatedList = (user?.addresses || []).filter((_, idx) => idx !== indexToDelete);
        await updateProfile({ addresses: updatedList });
      }
      toast.success('Address removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove address');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
    { id: 'rewards', label: 'Betasnacks Rewards', icon: Award },
    { id: 'security', label: 'Security & Password', icon: Lock },
  ];

  return (
    <div className="bg-cream-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and Sign Out Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-charcoal-900">
              My Account
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Manage your personal profile, delivery addresses, and account security.
            </p>
          </div>
          <button
            onClick={logout}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider transition-colors border border-rose-200 shadow-sm"
            title="Sign out of your Betasnacks account"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Navigation Tabs */}
          <aside className="md:col-span-4 space-y-3">
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-brand-500 text-white font-display font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="font-bold text-lg text-charcoal-900 mt-3">{user?.name}</h2>
              <p className="text-xs text-charcoal-400">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                <Award className="w-3.5 h-3.5 text-brand-500" />
                <span>{user?.rewardPoints || 0} Reward Points</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-3 border border-charcoal-200/80 shadow-sm space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-charcoal-700 hover:bg-cream-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <hr className="my-2 border-charcoal-100" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Tab Content Panes */}
          <section className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200/80 shadow-sm">
            {/* Tab 1: Profile Information */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <h3 className="font-display font-bold text-xl text-charcoal-900 border-b border-charcoal-100 pb-3">
                  Personal Information
                </h3>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-charcoal-100 border border-charcoal-200 rounded-xl text-xs sm:text-sm text-charcoal-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Addresses Management */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-xl text-charcoal-900">
                      Saved Delivery Addresses
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Addresses are automatically available during checkout for 1-click delivery.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors border border-brand-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Address Cards List */}
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={addr._id || idx}
                        className="p-4 rounded-2xl bg-cream-50 border border-charcoal-200/80 flex flex-col justify-between gap-3 relative hover:border-brand-300 transition-colors"
                      >
                        <div className="space-y-1 text-xs text-charcoal-700">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-charcoal-900 text-sm">{addr.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-charcoal-200 text-[10px] font-bold uppercase text-brand-600">
                              {addr.type || 'Home'}
                            </span>
                          </div>
                          <div className="text-charcoal-800 font-medium">{addr.street}</div>
                          <div>
                            {addr.city}, {addr.state || 'Karnataka'} - <span className="font-bold">{addr.pincode}</span>
                          </div>
                          {addr.landmark && (
                            <div className="text-[11px] text-charcoal-500">Landmark: {addr.landmark}</div>
                          )}
                          <div className="text-charcoal-600 font-medium">📞 {addr.phone}</div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-charcoal-200/40">
                          <button
                            onClick={() => handleDeleteAddress(addr, idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-cream-50/50 rounded-2xl border border-dashed border-charcoal-200 p-6">
                    <MapPin className="w-10 h-10 text-brand-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-charcoal-700">No saved addresses yet</p>
                    <p className="text-xs text-charcoal-400 mt-1 max-w-sm mx-auto">
                      Save your home, office, or regular food drop spot for instant 1-click checkout.
                    </p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Address</span>
                    </button>
                  </div>
                )}

                {/* Add Address Form Modal */}
                {showAddressModal && (
                  <form onSubmit={handleAddAddress} className="p-6 rounded-3xl bg-cream-100/70 border border-brand-200 space-y-4 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-brand-200/60">
                      <h4 className="font-bold text-sm text-charcoal-900">Add New Delivery Address</h4>
                      <div className="flex gap-2">
                        {['home', 'work', 'other'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewAddress({ ...newAddress, type: t })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                              newAddress.type === t
                                ? 'bg-brand-500 text-white shadow-sm'
                                : 'bg-white text-charcoal-600 border border-charcoal-200'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Contact Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ayush Gupta"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-white border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Contact Phone *</label>
                        <input
                          type="text"
                          placeholder="10-digit mobile number"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-white border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Street Address / Flat / Floor *</label>
                        <input
                          type="text"
                          placeholder="House/Shop no, building name, street, nearby landmark"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-white border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">City *</label>
                        <input
                          type="text"
                          placeholder="e.g. Bengaluru, Mumbai"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-white border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">Pincode *</label>
                        <input
                          type="text"
                          placeholder="e.g. 560001"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-white border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="px-4 py-2 bg-white border border-charcoal-200 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        {saving ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Tab 3: Rewards Program */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="border-b border-charcoal-100 pb-3">
                  <h3 className="font-display font-bold text-xl text-charcoal-900">
                    Betasnacks Rewards
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Earn 1 reward point for every ₹10 spent. Redeem at checkout for instant cash discounts!
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Available Points</span>
                    <Award className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight">
                    {user?.rewardPoints || 0} <span className="text-lg font-medium text-white/80">Points</span>
                  </div>
                  <div className="text-xs text-white/90 font-medium">
                    Equivalent to <span className="font-bold text-yellow-300">₹{((user?.rewardPoints || 0) * 0.1).toFixed(2)}</span> instant discount on your next craving.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Security & Password */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <h3 className="font-display font-bold text-xl text-charcoal-900 border-b border-charcoal-100 pb-3">
                  Change Password
                </h3>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
