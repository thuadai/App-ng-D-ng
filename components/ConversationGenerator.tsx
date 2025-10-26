import React, { useState } from 'react';
import { generateConversation } from '../services/geminiService';
import type { ConversationLine } from '../types';
import ConversationModal from './ConversationModal';

const ConversationGenerator: React.FC = () => {
  const [scenario, setScenario] = useState('Chàng trai IT 🇻🇳 & Cô gái 🇷🇺');
  const [topic, setTopic] = useState('');
  const [conversation, setConversation] = useState<ConversationLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề hội thoại.');
      return;
    }

    setLoading(true);
    setError(null);
    setConversation(null);

    try {
      const result = await generateConversation(scenario, topic);
      setConversation(result);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo hội thoại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo Tình Huống Giao Tiếp</h2>
      <p className="text-gray-600 mb-6">
        Chọn một kịch bản, nhập chủ đề và để AI tạo ra một cuộc hội thoại mẫu cho bạn thực hành.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scenario" className="block text-sm font-semibold text-gray-700 mb-1">
              Chọn kịch bản
            </label>
            <select
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-200"
            >
              <option>Chàng trai IT 🇻🇳 & Cô gái 🇷🇺</option>
              <option>Du khách 🇺🇸 & Hướng dẫn viên 🇻🇳</option>
              <option>Hai người bạn thân 🇬🇧 & 🇦🇺</option>
              <option>Giáo viên 🇨🇦 & Học sinh 🇻🇳</option>
            </select>
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-1">
              Chủ đề hội thoại
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Lên kế hoạch cuối tuần"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-200"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI đang viết hội thoại...
            </div>
          ) : 'Tạo Hội Thoại'}
        </button>
      </form>
      
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {loading && (
        <div className="mt-6 p-6 border border-gray-200 bg-gray-50 rounded-2xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conversation && !loading && (
        <ConversationModal 
          conversation={conversation} 
          onClose={() => setConversation(null)} 
        />
      )}
    </div>
  );
};

export default ConversationGenerator;