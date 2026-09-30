import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n/translations';
import { X, QrCode, Copy, Check, Share2, Smartphone } from 'lucide-react';

interface QRShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({ isOpen, onClose }) => {
  const { language } = useAuth();
  const t = translations[language];

  const [copied, setCopied] = useState<boolean>(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://heatsafe.in';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">{t.qrTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Display */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-amber-500">
            {/* SVG simulated crisp QR code */}
            <svg
              className="w-48 h-48"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              {/* Corner markers */}
              <rect x="10" y="10" width="24" height="24" rx="3" fill="#0f172a" />
              <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
              <rect x="18" y="18" width="8" height="8" rx="1" fill="#f59e0b" />

              <rect x="66" y="10" width="24" height="24" rx="3" fill="#0f172a" />
              <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
              <rect x="74" y="18" width="8" height="8" rx="1" fill="#f59e0b" />

              <rect x="10" y="66" width="24" height="24" rx="3" fill="#0f172a" />
              <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
              <rect x="18" y="74" width="8" height="8" rx="1" fill="#f59e0b" />

              {/* Data matrix dots */}
              <rect x="40" y="12" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="16" width="6" height="6" fill="#0f172a" />
              <rect x="46" y="24" width="6" height="6" fill="#0f172a" />
              <rect x="40" y="38" width="8" height="8" fill="#f59e0b" />
              <rect x="54" y="38" width="6" height="6" fill="#0f172a" />
              <rect x="14" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="26" y="48" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="44" width="6" height="6" fill="#0f172a" />
              <rect x="84" y="52" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="54" width="8" height="8" fill="#0f172a" />
              <rect x="54" y="54" width="6" height="6" fill="#f59e0b" />
              <rect x="42" y="72" width="6" height="6" fill="#0f172a" />
              <rect x="54" y="76" width="6" height="6" fill="#0f172a" />
              <rect x="70" y="72" width="6" height="6" fill="#0f172a" />
              <rect x="80" y="80" width="8" height="8" fill="#f59e0b" />
            </svg>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-white">HeatSafe Routes Tamil Nadu</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{t.qrDesc}</p>
          </div>

          {/* Copy link */}
          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
