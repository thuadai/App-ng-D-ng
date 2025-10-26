
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-4 mb-6 md:mb-8 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-300 shadow-lg">
      <div className="flex items-center gap-4">
        <span className="text-4xl md:text-5xl" role="img" aria-label="Graduation Cap">🎓</span>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-600 text-outline uppercase tracking-wide">
            Hỗ trợ học tiếng Anh
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-semibold">THUA DAI AI</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
