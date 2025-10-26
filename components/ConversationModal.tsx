
import React from 'react';
import type { ConversationLine } from '../types';

interface ConversationModalProps {
  conversation: ConversationLine[];
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({ conversation, onClose }) => {
  return (
    <div className="mt-6 p-6 border border-purple-200 bg-purple-50 rounded-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-purple-800">Cuộc hội thoại mẫu</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        {conversation.map((line, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="font-bold text-indigo-700">{line.character}:</p>
            <p className="text-gray-700 mt-1">{line.vi}</p>
            <p className="text-blue-600 italic mt-1">{line.en}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationModal;
