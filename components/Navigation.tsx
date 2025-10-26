import React from 'react';
import type { TabItem } from '../types';
import { SpeechIcon, BookIcon, ChatIcon, PenIcon, QuestionIcon, GlobeIcon, HeadsetIcon } from './icons';

const TABS: TabItem[] = [
  { id: 'speak', label: 'Luyện Nói', icon: SpeechIcon },
  { id: 'listen', label: 'Luyện Nghe', icon: HeadsetIcon },
  { id: 'books', label: 'Sách Hay', icon: BookIcon },
  { id: 'dialogue', label: 'Hội Thoại', icon: ChatIcon },
  { id: 'story', label: 'Tạo Truyện', icon: PenIcon },
  { id: 'grammar', label: 'Hỏi Ngữ Pháp', icon: QuestionIcon },
  { id: 'translate', label: 'Dịch Thuật', icon: GlobeIcon },
];

interface NavigationProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-md">
      <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400
                ${isActive
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
