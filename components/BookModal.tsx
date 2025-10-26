import React from 'react';
import type { BookRecommendation } from '../types';

interface BookModalProps {
  book: BookRecommendation;
  onClose: () => void;
}

const BookModal: React.FC<BookModalProps> = ({ book, onClose }) => {
  // Add a simple fade-in and slide-up animation effect
  const modalAnimationClasses = 'animate-fade-in';
  const cardAnimationClasses = 'animate-[slide-up_0.3s_ease-out]';

  // Add keydown listener for Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${modalAnimationClasses}`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-title"
    >
        <div 
            className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-2xl transform transition-all ${cardAnimationClasses}`}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h2 id="book-title" className="text-2xl md:text-3xl font-bold text-gray-800">{book.title}</h2>
                    <p className="text-md text-gray-500 mt-1">by {book.author}</p>
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                <div>
                    <h3 className="font-semibold text-lg text-gray-700 mb-1">Tóm tắt</h3>
                    <p className="text-gray-600 leading-relaxed">{book.summary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-700 mb-1">Tại sao bạn nên đọc?</h3>
                    <p className="p-3 bg-purple-50 text-purple-900 rounded-lg border border-purple-200">{book.reason}</p>
                </div>
            </div>
        </div>
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-\\[slide-up_0\\.3s_ease-out\\] { animation: slide-up 0.3s ease-out; }
          .animate-fade-in { animation: fade-in 0.2s ease-out; }
        `}</style>
    </div>
  );
};

export default BookModal;
