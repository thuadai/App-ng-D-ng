import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { ConversationLine, BookRecommendation, Story, PronunciationAnalysis, ListeningExercise } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = "gemini-2.5-flash";

// --- Schema Definitions ---

const conversationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      character: { type: Type.STRING },
      vi: { type: Type.STRING },
      en: { type: Type.STRING },
    },
    required: ["character", "vi", "en"],
  },
};

const booksSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      author: { type: Type.STRING },
      summary: { type: Type.STRING },
      reason: { type: Type.STRING },
    },
    required: ["title", "author", "summary", "reason"],
  },
};

const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    paragraphs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING },
          vi: { type: Type.STRING },
        },
        required: ["en", "vi"],
      },
    },
  },
  required: ["title", "paragraphs"],
};

const pronunciationSchema = {
    type: Type.OBJECT,
    properties: {
        correctedSentence: { type: Type.STRING },
        ipa: { type: Type.STRING },
        commonMistakes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
    },
    required: ["correctedSentence", "ipa", "commonMistakes"],
};

const listeningExerciseSchema = {
    type: Type.OBJECT,
    properties: {
        level: { type: Type.STRING },
        audioScript: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer"],
            }
        },
    },
    required: ["level", "audioScript", "questions"],
};


// --- API Functions ---

const callApi = async <T>(prompt: string, responseSchema: object | null): Promise<T> => {
  try {
    const config: any = { responseMimeType: responseSchema ? "application/json" : "text/plain" };
    if (responseSchema) {
      config.responseSchema = responseSchema;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const text = response.text;
    if (!text) {
      throw new Error("API returned an empty response.");
    }
    
    return responseSchema ? JSON.parse(text) : text as T;

  } catch (error) {
    console.error("Error with Gemini API:", error);
    throw new Error("Failed to get response from AI. Please check the console for details.");
  }
};

export const generateConversation = (scenario: string, topic: string): Promise<ConversationLine[]> => {
  const prompt = `You are an English teaching assistant. Create a short, 4-6 line bilingual conversation for the scenario: "${scenario}". The topic is "${topic}". Return a valid JSON array.`;
  return callApi<ConversationLine[]>(prompt, conversationSchema);
};

export const generateBookRecommendations = (topic: string): Promise<BookRecommendation[]> => {
  const prompt = `You are a helpful reading assistant for English learners. Based on the topic "${topic}", recommend 2-3 books. For each book, provide the title, author, a short summary, and a brief reason why it's suitable for learning English. Return a valid JSON array.`;
  return callApi<BookRecommendation[]>(prompt, booksSchema);
};

export const generateStory = (userPrompt: string): Promise<Story> => {
  const prompt = `You are a creative storyteller. Based on the user's idea: "${userPrompt}", write a short, simple bilingual story (around 100-150 words). Provide a title, and the story as an array of paragraphs, where each paragraph has an "en" (English) and "vi" (Vietnamese) version. Return a valid JSON object.`;
  return callApi<Story>(prompt, storySchema);
};

export const checkGrammar = (text: string): Promise<string> => {
    const prompt = `You are an expert English grammar teacher for Vietnamese learners. The user has provided the following text: "${text}". 
    Analyze it for grammar mistakes, explain the errors clearly in Vietnamese, provide the corrected English version, and give examples. If it's a question, answer it thoroughly. 
    Format your response in simple Markdown. Use ** for bold text. Use * for list items.`;
    return callApi<string>(prompt, null);
};

export const translateText = (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Provide only the translated text, without any additional comments or explanations.\n\nText: "${text}"`;
    return callApi<string>(prompt, null);
};

export const analyzePronunciation = (text: string): Promise<PronunciationAnalysis> => {
    const prompt = `You are an English pronunciation coach for Vietnamese speakers. Analyze the sentence: "${text}". 
    Provide a corrected version if there are any grammatical errors. 
    Provide the IPA transcription for the corrected sentence. 
    Provide a short list of common pronunciation mistakes a Vietnamese speaker might make with this sentence and how to correct them.
    Return a valid JSON object.`;
    return callApi<PronunciationAnalysis>(prompt, pronunciationSchema);
};

export const generateListeningExercise = (level: string): Promise<ListeningExercise> => {
    const prompt = `You are an English teacher creating a listening exercise for a Vietnamese student. The student's selected level is: ${level}.
    Based on this level, generate an appropriate exercise:
    - For 'A1 - Beginner': Use simple vocabulary (A1-A2 CEFR), short sentences, present tense, and a clear, slow-paced topic like introductions or daily routines. The script should be 40-60 words.
    - For 'B1 - Intermediate': Use a wider range of vocabulary (B1 CEFR), compound sentences, past/future tenses, and a topic like making plans or telling a simple story. The script should be 60-80 words.
    - For 'C1 - Advanced': Use idiomatic expressions, complex sentence structures (C1 CEFR), nuanced vocabulary, and a more abstract topic like discussing opinions or a news summary. The script should be 80-100 words.

    Your output must include:
    1. A short dialogue or monologue in English as 'audioScript'.
    2. 2-3 multiple-choice comprehension questions. Questions should also match the difficulty level.
    3. Indicate the correct answer for each question (e.g., "A", "B", "C").
    Return a valid JSON object.`;
    return callApi<ListeningExercise>(prompt, listeningExerciseSchema);
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("API did not return audio data.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error with Gemini TTS API:", error);
        throw new Error("Failed to generate speech. Please check the console for details.");
    }
};