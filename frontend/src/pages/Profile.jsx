import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    created_at: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/profile');
        setProfileData(res.data.user);
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [addToast]);

  const validate = () => {
    const errs = {};
    if (!profileData.name.trim()) {
      errs.name = 'Name cannot be empty';
    }

    if (!profileData.email.trim()) {
      errs.email = 'Email cannot be empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setErrors({});
      const res = await api.put('/auth/profile', {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });
      updateUser(res.data.user);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setErrors({ form: msg });
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatCreationDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar title="User Profile" onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          {loading ? (
            <Loading text="Loading profile details..." />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Header Profile Banner */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-extrabold text-3xl shadow-lg uppercase">
                  {profileData.name ? profileData.name.charAt(0) : 'U'}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{profileData.name}</h2>
                  <p className="text-indigo-100 text-sm mt-1">{profileData.email}</p>
                  <div className="inline-flex items-center gap-1.5 mt-3 text-xs bg-white/10 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {formatCreationDate(profileData.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  Edit Personal Information
                </h3>

                {errors.form && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition ${
                          errors.name
                            ? 'border-rose-500 focus:ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition ${
                          errors.email
                            ? 'border-rose-500 focus:ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
