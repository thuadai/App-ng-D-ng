import React, { useState } from 'react';
import { generateStory } from '../services/geminiService';
import type { Story } from '../types';

const StoryGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Vui lòng nhập ý tưởng cho câu chuyện.');
      return;
    }
    setLoading(true);
    setError(null);
    setStory(null);
    try {
      const result = await generateStory(prompt);
      setStory(result);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo truyện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Sáng Tạo Truyện Ngắn</h2>
      <p className="text-gray-600 mb-6">
        Hãy đưa ra một vài ý tưởng, AI sẽ viết một câu chuyện ngắn song ngữ cho bạn.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ví dụ: Một chú mèo du hành thời gian và một con khủng long..."
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition duration-200 h-28 resize-none"
        />
        <button type="submit" disabled={loading} className="w-full mt-2 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'AI đang dệt truyện...' : 'Viết Truyện'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {loading && (
        <div className="mt-6 p-6 border border-gray-200 bg-gray-50 rounded-2xl animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="space-y-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {story && !loading && (
        <div className="mt-6 p-6 border border-purple-200 bg-purple-50 rounded-2xl animate-fade-in">
          <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">{story.title}</h3>
          <div className="space-y-4">
            {story.paragraphs.map((p, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-blue-600 italic">{p.en}</p>
                <hr className="my-2 border-dashed" />
                <p className="text-gray-700">{p.vi}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;