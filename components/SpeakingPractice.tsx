import React, { useState, useEffect } from 'react';
import { analyzePronunciation } from '../services/geminiService';
import type { PronunciationAnalysis } from '../types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { MicrophoneIcon } from './icons';

const SpeakingPractice: React.FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    isSupported,
    setTranscript,
  } = useVoiceRecognition();

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);
  
  const handleMicClick = () => {
      if (isListening) {
          stopListening();
      } else {
          setText('');
          setTranscript('');
          startListening();
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Stop listening if mic is on
    if (isListening) {
        stopListening();
    }
    if (!text.trim()) {
      setAiError('Vui lòng nhập một câu để kiểm tra.');
      return;
    }
    setLoading(true);
    setAiError(null);
    setAnalysis(null);
    try {
      const result = await analyzePronunciation(text);
      setAnalysis(result);
    } catch (err) {
      setAiError('Đã xảy ra lỗi khi phân tích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Luyện Phát Âm</h2>
      <p className="text-gray-600 mb-6">
        Nhập hoặc nói một câu tiếng Anh, AI sẽ sửa lỗi, cung cấp phiên âm và chỉ ra các lỗi phát âm phổ biến.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative w-full">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isListening ? "Đang nghe..." : "Ví dụ: I want to improve my pronunciation"}
            className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition duration-200 h-24 resize-none"
            disabled={isListening}
          />
          {isSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
              aria-label={isListening ? "Stop recording" : "Start recording"}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <button type="submit" disabled={loading || isListening} className="w-full mt-2 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'AI đang phân tích...' : 'Kiểm Tra Phát Âm'}
        </button>
      </form>
      
      {!isSupported && <p className="text-yellow-600 bg-yellow-100 p-2 rounded-md mt-4 text-center text-sm">Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.</p>}
      {voiceError && <p className="text-red-500 mt-4 text-center">{voiceError}</p>}
      {aiError && <p className="text-red-500 mt-4 text-center">{aiError}</p>}
      
      {loading && (
        <div className="mt-6 p-6 border border-gray-200 bg-gray-50 rounded-2xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="p-3 bg-white rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="p-3 bg-white rounded-lg">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="p-3 bg-white rounded-lg space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="mt-6 p-6 border border-purple-200 bg-purple-50 rounded-2xl animate-fade-in">
          <h3 className="text-xl font-bold text-purple-800 mb-4">Kết quả phân tích</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700">Câu đã sửa:</h4>
              <p className="p-3 bg-white rounded-lg text-blue-700 italic">{analysis.correctedSentence}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Phiên âm (IPA):</h4>
              <p className="p-3 bg-white rounded-lg text-gray-800 font-mono">{analysis.ipa}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Lỗi thường gặp:</h4>
              <ul className="list-disc list-inside p-3 bg-white rounded-lg space-y-1">
                {analysis.commonMistakes.map((mistake, i) => <li key={i} className="text-gray-700">{mistake}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakingPractice;