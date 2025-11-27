import * as React from 'react';
import { Heart } from 'lucide-react';

export const Logo: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => {
  const isLarge = size === 'lg';
  
  return (
    <div className={`flex items-center gap-2 select-none`}>
      <div className={`
        relative flex items-center justify-center 
        ${isLarge ? 'w-10 h-10' : 'w-8 h-8'} 
        bg-gradient-to-tr from-rose-600 to-pink-500 rounded-xl
        shadow-lg shadow-rose-900/20
      `}>
        <Heart className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'} text-white fill-white`} />
      </div>
      
      <div className="flex flex-col justify-center">
        <h1 className={`
          font-bold text-white tracking-tight leading-none
          ${isLarge ? 'text-3xl' : 'text-xl'}
        `}>
          CupidBot
        </h1>
      </div>
    </div>
  );
};