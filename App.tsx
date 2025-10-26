import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ConversationGenerator from './components/ConversationGenerator';
import SupportBanner from './components/SupportBanner';
import GoodBooks from './components/GoodBooks';
import StoryGenerator from './components/StoryGenerator';
import GrammarHelper from './components/GrammarHelper';
import Translator from './components/Translator';
import SpeakingPractice from './components/SpeakingPractice';
import ListeningPractice from './components/ListeningPractice';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dialogue');

  const renderContent = () => {
    switch (activeTab) {
      case 'speak':
        return <SpeakingPractice />;
      case 'listen':
        return <ListeningPractice />;
      case 'books':
        return <GoodBooks />;
      case 'dialogue':
        return <ConversationGenerator />;
      case 'story':
        return <StoryGenerator />;
      case 'grammar':
        return <GrammarHelper />;
      case 'translate':
        return <Translator />;
      default:
        return <ConversationGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-300 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-poppins text-gray-800">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="flex flex-col gap-6 md:gap-8">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderContent()}
          <SupportBanner />
        </main>
      </div>
    </div>
  );
};

export default App;
