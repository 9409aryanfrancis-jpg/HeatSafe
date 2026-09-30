import React, { useState } from 'react';
import { CarePointType, TamilNaduCity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import { X, Plus, MapPin, Check, Sparkles } from 'lucide-react';

interface AddCarePointModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: TamilNaduCity;
  onAdded: () => void;
}

export const AddCarePointModal: React.FC<AddCarePointModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  onAdded,
}) => {
  const { user, language } = useAuth();
  const t = translations[language];

  const [name, setName] = useState<string>('');
  const [nameTa, setNameTa] = useState<string>('');
  const [type, setType] = useState<CarePointType>('water');
  const [address, setAddress] = useState<string>('');
  const [openHours, setOpenHours] = useState<string>('24/7');
  const [isFree, setIsFree] = useState<boolean>(true);
  const [womenFriendly, setWomenFriendly] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Defaults coordinates around city center
  const defaultCoords: Record<TamilNaduCity, [number, number]> = {
    chennai: [13.0450 + (Math.random() - 0.5) * 0.02, 80.2400 + (Math.random() - 0.5) * 0.02],
    madurai: [9.9280 + (Math.random() - 0.5) * 0.02, 78.1350 + (Math.random() - 0.5) * 0.02],
    coimbatore: [11.0120 + (Math.random() - 0.5) * 0.02, 76.9600 + (Math.random() - 0.5) * 0.02],
    tiruchirappalli: [10.7905, 78.7047],
    salem: [11.6643, 78.1460],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const [lat, lng] = defaultCoords[selectedCity] || [13.0405, 80.2337];

      await fetch('/api/care-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          nameTa: nameTa.trim() || name.trim(),
          type,
          lat,
          lng,
          city: selectedCity,
          address: address.trim() || `${selectedCity.toUpperCase()} Delivery Zone`,
          addressTa: address.trim() || `${selectedCity} டெலிவரி பகுதி`,
          isVerified: false,
          isFree,
          womenFriendly,
          openHours,
          tags: ['community_added', isFree ? 'free_access' : 'nominal_fee'],
          status: 'operational',
          createdBy: user?.name || 'Fellow Delivery Partner',
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onAdded();
        onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Plus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{t.addNewPointTitle}</h3>
              <p className="text-xs text-slate-400">
                {language === 'ta'
                  ? 'மற்ற கிக் தொழிலாளர்களுக்கு உதவ புதிய இடத்தை வரைபடத்தில் சேர்க்கவும்'
                  : 'Map a tea shop, public toilet, or tree shade spot'}
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

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-bold text-base text-white">
              {language === 'ta'
                ? 'புதிய இடம் சேர்க்கப்பட்டது! அனைத்து தொழிலாளர்களுக்கும் உடனடியாக ஒத்திசைக்கப்பட்டது.'
                : 'Point added! Synchronized in real-time across Tamil Nadu care network.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {t.facilityType}:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'water', label: t.water, icon: '💧' },
                  { id: 'toilet', label: t.toilet, icon: '🚻' },
                  { id: 'shade', label: t.shade, icon: '🌳' },
                  { id: 'ac_rest', label: t.ac_rest, icon: '❄️' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as CarePointType)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      type === item.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-[11px] font-bold leading-tight">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t.facilityName} (English):
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saravana Tea Stall Free RO Water, Shell Restroom"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tamil Name input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                பெயர் (தமிழ்):
              </label>
              <input
                type="text"
                value={nameTa}
                onChange={(e) => setNameTa(e.target.value)}
                placeholder="எ.கா. சரவணா டீ கடை RO குடிநீர் மையம்"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t.facilityAddress}:
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Signal, Usman Road, T. Nagar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Hours & Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.hours}:
                </label>
                <input
                  type="text"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="24/7 or 06:00 AM - 11:00 PM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2 pt-2 sm:pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Free access for delivery workers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-pink-300">
                  <input
                    type="checkbox"
                    checked={womenFriendly}
                    onChange={(e) => setWomenFriendly(e.target.checked)}
                    className="accent-pink-500 rounded"
                  />
                  <span>Safe for women riders</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                {submitting ? 'Saving to Tamil Nadu Network...' : t.addPlace}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
