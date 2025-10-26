import React, { useState } from 'react';
import { generateBookRecommendations } from '../services/geminiService';
import type { BookRecommendation } from '../types';
import BookModal from './BookModal';

const GoodBooks: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [books, setBooks] = useState<BookRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRecommendation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề bạn quan tâm.');
      return;
    }
    setLoading(true);
    setError(null);
    setBooks(null);
    try {
      const result = await generateBookRecommendations(topic);
      setBooks(result);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tìm sách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Gợi Ý Sách Hay</h2>
      <p className="text-gray-600 mb-6">
        Nhập chủ đề bạn quan tâm, AI sẽ gợi ý những cuốn sách tiếng Anh phù hợp để bạn luyện đọc.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ví dụ: Khoa học viễn tưởng, kinh doanh"
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition duration-200"
        />
        <button type="submit" disabled={loading} className="w-full sm:w-auto flex-shrink-0 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Đang tìm sách...' : 'Tìm Sách'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {loading && (
        <div className="mt-6 space-y-4 animate-pulse">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl border flex justify-between items-center">
              <div className="flex-grow pr-4">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
            </div>
          ))}
        </div>
      )}

      {books && !loading && (
        <div className="mt-6 space-y-3 animate-fade-in">
          {books.map((book, index) => (
            <div key={index} className="p-4 bg-white rounded-xl shadow-md border border-gray-200 flex justify-between items-center transition-shadow hover:shadow-lg">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
                <p className="text-sm text-gray-500">by {book.author}</p>
              </div>
              <button
                onClick={() => setSelectedBook(book)}
                className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors shadow-sm hover:shadow-md"
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default GoodBooks;
