import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import { GigPlatform, TamilNaduCity, UserRole, VehicleType } from '../../types';
import {
  X,
  User,
  Phone,
  Bike,
  Building,
  CheckCircle2,
  Shield,
  LogOut,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, language, login, quickStartGuest, updateProfile, logout } = useAuth();
  const t = translations[language];

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [platform, setPlatform] = useState<GigPlatform>('swiggy');
  const [vehicle, setVehicle] = useState<VehicleType>('two_wheeler');
  const [city, setCity] = useState<TamilNaduCity>('chennai');
  const [role, setRole] = useState<UserRole>('gig_worker');
  const [womenFriendlyOnly, setWomenFriendlyOnly] = useState<boolean>(false);
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!phone.trim()) {
        setError('Please enter your phone number or worker ID');
        setLoading(false);
        return;
      }
      await login(phone.trim(), name.trim(), platform, role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await quickStartGuest(city, role);
      onClose();
    } catch (err: any) {
      setError('Guest mode failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {user ? t.profile : mode === 'login' ? t.signIn : t.register}
              </h3>
              <p className="text-xs text-slate-400">
                {user ? user.phone : 'HeatSafe Routes Tamil Nadu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {user ? (
            /* Logged-In Profile View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black text-xl flex items-center justify-center">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-base text-white">{user.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">
                    {user.platform} • {user.city}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {user.role === 'municipal_planner'
                      ? 'State Planner / Union Advocate'
                      : 'Active Gig Worker'}
                  </span>
                </div>
              </div>

              {/* Preferences Editor */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-750 space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Worker Preferences
                </h5>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-300">{t.womenFriendlyOnly}</span>
                  <input
                    type="checkbox"
                    checked={user.womenFriendlyOnly}
                    onChange={(e) => updateProfile({ womenFriendlyOnly: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-300">{t.freeOnly}</span>
                  <input
                    type="checkbox"
                    checked={user.freeOnly}
                    onChange={(e) => updateProfile({ freeOnly: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                </label>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.role}:</span>
                  <select
                    value={user.role}
                    onChange={(e) => updateProfile({ role: e.target.value as UserRole })}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold"
                  >
                    <option value="gig_worker">{t.gigWorkerRole}</option>
                    <option value="municipal_planner">{t.plannerRole}</option>
                  </select>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            /* Login & Registration Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
                  {error}
                </div>
              )}

              {/* Phone or Worker ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.workerId}:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9840123456 or SWIGGY-CH-409"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.fullName}:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karthik S."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Gig Platform */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {t.platform}:
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as GigPlatform)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold capitalize focus:outline-none focus:border-amber-500"
                  >
                    <option value="swiggy">Swiggy</option>
                    <option value="zomato">Zomato</option>
                    <option value="zepto">Zepto</option>
                    <option value="blinkit">Blinkit</option>
                    <option value="ola">Ola</option>
                    <option value="uber">Uber</option>
                    <option value="rapido">Rapido</option>
                    <option value="porter">Porter</option>
                    <option value="shadowfax">Shadowfax</option>
                    <option value="independent">Independent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    {t.city}:
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as TamilNaduCity)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold capitalize focus:outline-none focus:border-amber-500"
                  >
                    <option value="chennai">Chennai</option>
                    <option value="madurai">Madurai</option>
                    <option value="coimbatore">Coimbatore</option>
                    <option value="tiruchirappalli">Tiruchirappalli</option>
                    <option value="salem">Salem</option>
                  </select>
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.role}:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('gig_worker')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'gig_worker'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    Delivery / Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('municipal_planner')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'municipal_planner'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    City Planner / Union
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-98"
                >
                  {loading ? 'Logging In...' : t.signIn}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleGuest}
                    className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {t.quickStartGuest}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
