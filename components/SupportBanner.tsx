
import React from 'react';

const SupportBanner: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-400 to-cyan-300 text-white p-6 rounded-2xl shadow-lg text-center flex flex-col gap-4">
      <p className="font-semibold text-lg">
        👉 HÃY VÀO NHÓM ĐỂ ĐƯỢC HỖ TRỢ THÊM NHIỀU CÔNG CỤ AI 💎
      </p>
      <p className="font-bold text-xl tracking-wider">
        HOTLINE: 0878.333.332
      </p>
      <p className="font-bold text-xl uppercase mt-2">
        Chúc các bạn học tập vui vẻ
      </p>
    </div>
  );
};

export default SupportBanner;
