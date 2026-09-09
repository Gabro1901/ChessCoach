import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const SlideSheet: React.FC<SlideSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-[#161c28] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#1c2433]">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-emerald-400">{icon}</span>}
            <h3 className="font-bold text-sm md:text-base text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin scrollbar-thumb-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};
