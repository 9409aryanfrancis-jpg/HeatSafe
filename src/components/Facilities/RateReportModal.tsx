import React, { useState } from 'react';
import { CarePoint, IssueType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../i18n/translations';
import { X, Star, AlertTriangle, Check, Shield, ThumbsUp } from 'lucide-react';

interface RateReportModalProps {
  point: CarePoint | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const RateReportModal: React.FC<RateReportModalProps> = ({
  point,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const { user, language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'rate' | 'report'>('rate');
  const [cleanliness, setCleanliness] = useState<number>(5);
  const [safety, setSafety] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Clean today']);
  const [comment, setComment] = useState<string>('');

  const [issueType, setIssueType] = useState<IssueType>('locked_closed');
  const [issueComment, setIssueComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isOpen || !point) return null;

  const availableTags = [
    { id: 'Clean today', label: t.tagsCleanToday },
    { id: 'Cold drinking water', label: t.tagsColdWater },
    { id: 'Good for women', label: t.tagsWomenSafe },
    { id: 'Phone charging spot', label: t.tagsCharging },
    { id: 'Seated rest available', label: t.tagsSeating },
    { id: 'Dirty / smells', label: t.tagsSmelly },
    { id: 'No running water', label: t.tagsNoWater },
    { id: 'Locked / Closed', label: t.tagsLocked },
    { id: 'Extra fee demanded', label: t.tagsExtraMoney },
  ];

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carePointId: point.id,
          userId: user?.id || 'guest-rider',
          userName: user?.name || 'Fellow Delivery Partner',
          userPlatform: user?.platform || 'Swiggy',
          cleanlinessRating: cleanliness,
          safetyRating: safety,
          tags: selectedTags,
          comment,
        }),
      });

      setSuccessMsg(language === 'ta' ? 'மதிப்பீடு வெற்றிகரமாக பகிரப்பட்டது!' : 'Rating submitted successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onSubmitted();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carePointId: point.id,
          userId: user?.id || 'guest-rider',
          userName: user?.name || 'Rider on Road',
          issueType,
          comment: issueComment,
        }),
      });

      setSuccessMsg(language === 'ta' ? 'புகார் பதிவு செய்யப்பட்டது. மற்ற தோழர்களுக்கு எச்சரிக்கப்படும்!' : 'Issue reported! Fellow workers alerted.');
      setTimeout(() => {
        setSuccessMsg('');
        onSubmitted();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <h3 className="font-extrabold text-base text-white">
              {activeTab === 'rate' ? t.rateTitle : t.reportIssueTitle}
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">{point.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Rate & Report */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab('rate')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'rate'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ★ {t.ratePlace}
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'report'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚠️ {language === 'ta' ? 'அவசர புகார் (Report Issue)' : 'Report Problem'}
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-bold text-base text-white">{successMsg}</p>
          </div>
        ) : activeTab === 'rate' ? (
          /* Form 1: Rating Form */
          <form onSubmit={handleRatingSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Cleanliness Stars */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t.cleanliness} (1 - 5):
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCleanliness(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span className={star <= cleanliness ? 'text-amber-400' : 'text-slate-700'}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">{cleanliness} / 5</span>
              </div>
            </div>

            {/* Safety Stars */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {t.safety} (1 - 5):
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSafety(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span className={star <= safety ? 'text-emerald-400' : 'text-slate-700'}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-xs font-bold text-emerald-400 ml-2">{safety} / 5</span>
              </div>
            </div>

            {/* Quick tags */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {language === 'ta' ? 'விரைவு குறிப்புகள் (Tags):' : 'Select Worker Tags:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'ta' ? 'கூடுதல் கருத்து (விருப்பப்பட்டால்):' : 'Comment / Tip:'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-98"
              >
                {submitting ? 'Submitting...' : t.submit}
              </button>
            </div>
          </form>
        ) : (
          /* Form 2: Report Breakdown / Lockout */
          <form onSubmit={handleReportSubmit} className="p-5 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {language === 'ta' ? 'சிக்கலின் வகை:' : 'Select Problem Type:'}
              </label>
              <div className="space-y-2">
                {[
                  { id: 'locked_closed', label: t.issueLocked },
                  { id: 'water_not_working', label: t.issueNoWater },
                  { id: 'toilet_unusable', label: t.issueUnusable },
                  { id: 'asked_extra_money', label: t.issueFee },
                  { id: 'unsafe_night', label: t.issueUnsafe },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      issueType === item.id
                        ? 'bg-red-500/15 border-red-500 text-red-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={item.id}
                      checked={issueType === item.id}
                      onChange={() => setIssueType(item.id as IssueType)}
                      className="accent-red-500"
                    />
                    <span className="text-xs font-bold">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'ta' ? 'விளக்கம்:' : 'Details:'}
              </label>
              <textarea
                value={issueComment}
                onChange={(e) => setIssueComment(e.target.value)}
                placeholder="e.g. Gate locked since 2 PM, dispenser empty..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all active:scale-98"
              >
                {submitting ? 'Submitting...' : 'Submit Emergency Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
