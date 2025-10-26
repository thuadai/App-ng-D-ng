import React, { useState, useEffect } from 'react';
import { translateText } from '../services/geminiService';

type Language = 'Vietnamese' | 'English';

const Translator: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language>('Vietnamese');
  const [targetLang, setTargetLang] = useState<Language>('English');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!inputText.trim()) {
        setOutputText('');
        setError(null);
        return;
    }

    setLoading(true);
    setError(null);
    const handler = setTimeout(() => {
        translateText(inputText, sourceLang, targetLang)
            .then(result => {
                setOutputText(result);
            })
            .catch(() => {
                setError('Lỗi dịch thuật. Vui lòng thử lại.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
      setLoading(false);
    };
  }, [inputText, sourceLang, targetLang]);


  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Dịch Thuật Thông Minh</h2>
      <p className="text-gray-600 mb-6">
        Dịch văn bản giữa Tiếng Việt và Tiếng Anh, được hỗ trợ bởi AI.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Source Language */}
        <div>
            <label className="font-semibold text-gray-700">{sourceLang === 'Vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}</label>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập văn bản..."
                className="mt-1 w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition duration-200 h-48 resize-none"
            />
        </div>

        {/* Target Language */}
        <div>
            <label className="font-semibold text-gray-700">{targetLang === 'Vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}</label>
            <textarea
                value={outputText}
                readOnly
                placeholder={loading ? "Đang dịch..." : "Bản dịch sẽ xuất hiện ở đây..."}
                className={`mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl h-48 resize-none text-gray-800 transition-colors ${loading ? 'bg-gray-200/80 animate-pulse' : 'bg-gray-200/50'}`}
            />
        </div>
        
        {/* Swap Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <button onClick={handleSwapLanguages} className="bg-purple-500 text-white rounded-full p-3 shadow-lg hover:bg-purple-600 transition transform hover:rotate-180 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>
        </div>
      </div>
       <button onClick={handleSwapLanguages} className="mt-4 w-full md:hidden bg-purple-500 text-white rounded-full p-3 shadow-lg hover:bg-purple-600 transition">
           Đảo Ngôn Ngữ
       </button>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default Translator;