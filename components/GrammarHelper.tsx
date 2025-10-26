import React, { useState } from 'react';
import { checkGrammar } from '../services/geminiService';

const GrammarHelper: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Vui lòng nhập câu hoặc câu hỏi ngữ pháp.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await checkGrammar(text);
      setResult(response);
    } catch (err) {
      setError('Đã xảy ra lỗi khi kiểm tra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Basic markdown to HTML renderer
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\s?\*\s(.*?)/g, (match, p1) => `\n<li class="ml-4 list-disc">${p1}</li>`)
      .replace(/(\n<li.*<\/li>)+/g, (match) => `<ul class="mt-2 mb-2">${match.replace(/\n/g, '')}</ul>`);
    return { __html: html.replace(/\n/g, '<br />') };
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Gỡ Rối Ngữ Pháp</h2>
      <p className="text-gray-600 mb-6">
        Nhập câu hoặc câu hỏi ngữ pháp của bạn, AI sẽ giải thích cặn kẽ và đưa ra ví dụ.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ví dụ: Phân biệt 'in time' và 'on time'?"
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition duration-200 h-32 resize-none"
        />
        <button type="submit" disabled={loading} className="w-full mt-2 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'AI đang phân tích...' : 'Kiểm Tra Ngữ Pháp'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {loading && (
        <div className="mt-6 p-6 border border-gray-200 bg-gray-50 rounded-2xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="mt-6 p-6 border border-purple-200 bg-purple-50 rounded-2xl animate-fade-in">
          <h3 className="text-xl font-bold text-purple-800 mb-4">Giải thích từ AI</h3>
          <div className="prose prose-blue max-w-none text-gray-800" dangerouslySetInnerHTML={renderMarkdown(result)} />
        </div>
      )}
    </div>
  );
};

export default GrammarHelper;