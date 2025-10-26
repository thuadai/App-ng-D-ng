import type React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ConversationLine {
  character: string;
  vi: string;
  en: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  summary: string;
  reason: string;
}

export interface Story {
  title: string;
  paragraphs: Array<{
    en: string;
    vi: string;
  }>;
}

export interface PronunciationAnalysis {
  correctedSentence: string;
  ipa: string;
  commonMistakes: string[];
}

export interface ListeningExercise {
  level: string;
  audioScript: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string; // e.g., "A", "B", "C"
  }>;
}
