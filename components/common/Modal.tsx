import React from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ title, children, onClose }: ModalProps) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-brand-surface rounded-lg shadow-xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up border border-brand-subtle/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <XIcon className="w-6 h-6 text-brand-subtle" />
          </button>
        </div>
        <div>{children}</div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;