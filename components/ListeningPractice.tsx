import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateListeningExercise, generateSpeech } from '../services/geminiService';
import type { ListeningExercise } from '../types';
import { PlayIcon, PauseIcon, AudioLoadingIcon } from './icons';

type Level = 'A1 - Beginner' | 'B1 - Intermediate' | 'C1 - Advanced';
const OPTION_LABELS = ['A', 'B', 'C'];

interface TimedWord {
  word: string;
  startTime: number;
  endTime: number;
}

// --- Audio Helper Functions ---
const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const ListeningPractice: React.FC = () => {
  const [level, setLevel] = useState<Level>('A1 - Beginner');
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scriptWords, setScriptWords] = useState<TimedWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scriptContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Clean up audio context on component unmount
  useEffect(() => {
    return () => {
        audioContextRef.current?.close();
    }
  }, []);

  const stopCurrentAudio = useCallback(() => {
      if (audioSourceRef.current) {
          audioSourceRef.current.onended = null; // Prevent onended from firing on manual stop
          audioSourceRef.current.stop();
          audioSourceRef.current.disconnect();
          audioSourceRef.current = null;
      }
      if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
      }
      setIsPlaying(false);
  }, []);


  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setExercise(null);
    setUserAnswers({});
    setShowResults(false);
    setAudioBuffer(null);
    setIsGeneratingAudio(false);
    setScriptWords([]);
    setCurrentWordIndex(null);
    pauseTimeRef.current = 0;
    stopCurrentAudio();
    
    try {
      const result = await generateListeningExercise(level);
      setExercise(result);
      
      setIsGeneratingAudio(true);
      const base64Audio = await generateSpeech(result.audioScript);
      
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const decodedBytes = decode(base64Audio);
      const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
      setAudioBuffer(buffer);

      // Process script for highlighting
      const words = result.audioScript.split(/(\s+)/).filter(w => w.length > 0);
      const totalDuration = buffer.duration;
      const totalChars = words.filter(w => w.trim().length > 0).join('').length;
      const durationPerChar = totalChars > 0 ? totalDuration / totalChars : 0;
      
      let currentTime = 0;
      const timedWords = words.map(word => {
        const startTime = currentTime;
        const wordDuration = word.trim().length * durationPerChar;
        currentTime += wordDuration;
        const endTime = currentTime;
        return { word, startTime, endTime };
      });
      setScriptWords(timedWords);
      wordRefs.current = timedWords.map(() => null);

    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setIsGeneratingAudio(false);
    }
  };
  
  const updateHighlight = useCallback(() => {
    if (!audioContextRef.current || playbackStartTimeRef.current === 0) return;
    
    const elapsedTime = audioContextRef.current.currentTime - playbackStartTimeRef.current;
    
    const activeWordIndex = scriptWords.findIndex(
      word => elapsedTime >= word.startTime && elapsedTime < word.endTime && word.word.trim().length > 0
    );

    if (activeWordIndex !== -1) {
        setCurrentWordIndex(activeWordIndex);
    }

    animationFrameIdRef.current = requestAnimationFrame(updateHighlight);
  }, [scriptWords]);

  const handlePlayPause = () => {
    if (isPlaying) {
        stopCurrentAudio();
        if (audioContextRef.current) {
            pauseTimeRef.current = audioContextRef.current.currentTime - playbackStartTimeRef.current;
        }
        return;
    }

    if (!audioBuffer || !audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    const newSource = audioContextRef.current.createBufferSource();
    newSource.buffer = audioBuffer;
    newSource.connect(audioContextRef.current.destination);
    
    playbackStartTimeRef.current = audioContextRef.current.currentTime - pauseTimeRef.current;
    newSource.start(0, pauseTimeRef.current);
    
    audioSourceRef.current = newSource;
    setIsPlaying(true);
    animationFrameIdRef.current = requestAnimationFrame(updateHighlight);

    newSource.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        setCurrentWordIndex(null);
        pauseTimeRef.current = 0; // Reset for next full playback
    };
  };

  useEffect(() => {
    const container = scriptContainerRef.current;
    const activeWordEl = currentWordIndex !== null ? wordRefs.current[currentWordIndex] : null;

    if (container && activeWordEl) {
      const containerHeight = container.clientHeight;
      const wordTop = activeWordEl.offsetTop; // Relative to container due to `position: relative`
      const wordHeight = activeWordEl.offsetHeight;

      // Calculate the desired scroll position to center the word/line
      const targetScrollTop = wordTop - (containerHeight / 2) + (wordHeight / 2);

      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }, [currentWordIndex]);


  const handleAnswerSelect = (questionIndex: number, option: string) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const getOptionBgClass = (questionIndex: number, option: string) => {
    if (!showResults) {
        return userAnswers[questionIndex] === option ? 'bg-purple-200 border-purple-400' : 'bg-gray-100 hover:bg-gray-200';
    }
    const correctAnswer = exercise?.questions[questionIndex].correctAnswer;
    if (option === correctAnswer) {
        return 'bg-green-200 border-green-400';
    }
    if (userAnswers[questionIndex] === option) {
        return 'bg-red-200 border-red-400';
    }
    return 'bg-gray-100';
  };


  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Luyện Nghe Theo Cấp Độ</h2>
      <p className="text-gray-600 mb-6">
        Chọn trình độ, AI sẽ tạo một đoạn hội thoại và câu hỏi để bạn luyện nghe.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          className="w-full sm:w-auto px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition"
        >
          <option>A1 - Beginner</option>
          <option>B1 - Intermediate</option>
          <option>C1 - Advanced</option>
        </select>
        <button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto flex-shrink-0 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'AI đang soạn bài...' : 'Tạo Bài Nghe'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {loading && (
        <div className="mt-6 animate-pulse space-y-6">
          <div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="p-4 bg-gray-50 border-l-4 border-gray-200 rounded-r-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              {[...Array(2)].map((_, qIndex) => (
                <div key={qIndex} className="p-4 bg-white rounded-lg shadow-sm border">
                  <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-100 rounded-lg"></div>
                    <div className="h-10 bg-gray-100 rounded-lg"></div>
                    <div className="h-10 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {exercise && !loading && (
        <div className="mt-6 animate-fade-in space-y-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
                <h3 className="text-xl font-bold text-purple-800">🎧 Nghe hội thoại:</h3>
                <button 
                    onClick={handlePlayPause} 
                    disabled={!audioBuffer || isGeneratingAudio}
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-500 text-white disabled:bg-gray-300 transition-all duration-200 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                    {isGeneratingAudio ? <AudioLoadingIcon className="h-5 w-5" /> : (isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />)}
                </button>
             </div>
             <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                <p className="italic text-gray-700 mb-2">Hãy nghe đoạn hội thoại sau và trả lời câu hỏi bên dưới.</p>
                <div ref={scriptContainerRef} className="relative text-lg font-semibold text-gray-800 leading-relaxed max-h-40 overflow-y-auto p-3 bg-white/50 rounded-md shadow-inner">
                    {scriptWords.length > 0 ? (
                        scriptWords.map((item, index) => (
                            <span
                                key={index}
                                ref={el => { if(el) wordRefs.current[index] = el; }}
                                className={`transition-colors duration-150 rounded-sm px-0.5 ${index === currentWordIndex ? 'bg-yellow-300' : 'bg-transparent'}`}
                            >
                                {item.word}
                            </span>
                        ))
                    ) : (
                        <p>{exercise.audioScript}</p>
                    )}
                </div>
             </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-purple-800 mb-4">Trả lời câu hỏi:</h3>
            <div className="space-y-4">
              {exercise.questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 bg-white rounded-lg shadow-sm border">
                  <p className="font-semibold text-gray-800 mb-3">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => {
                      const optionLabel = OPTION_LABELS[oIndex];
                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleAnswerSelect(qIndex, optionLabel)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${getOptionBgClass(qIndex, optionLabel)}`}
                          disabled={showResults}
                        >
                          <strong>{optionLabel}.</strong> {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {!showResults && (
             <button onClick={() => setShowResults(true)} className="w-full mt-4 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Kiểm Tra Đáp Án
             </button>
          )}

          {showResults && (
            <div className="mt-6 p-6 border-2 border-dashed border-purple-300 bg-purple-50 rounded-2xl animate-fade-in">
                <h3 className="text-xl font-bold text-purple-800 mb-4">Đáp Án</h3>
                <div className="space-y-3">
                    {exercise.questions.map((q, qIndex) => (
                         <p key={qIndex} className="text-gray-800">
                           <strong>Câu {qIndex + 1}:</strong> Đáp án đúng là <strong>{q.correctAnswer}</strong>.
                         </p>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListeningPractice;