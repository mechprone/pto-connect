import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, HelpCircle, Lightbulb } from 'lucide-react';

const StellaFloatingButton = ({ onClick, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Hide pulse after initial attention grab
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Floating Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative group
          w-16 h-16 
          bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700
          hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600
          text-white rounded-full shadow-2xl
          transform transition-all duration-300 ease-out
          ${isHovered ? 'scale-110 shadow-purple-500/30' : 'scale-100'}
          ${isActive ? 'ring-4 ring-purple-300 ring-opacity-50' : ''}
          focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
        `}
      >
        {/* Pulse Animation */}
        {showPulse && !isActive && (
          <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-30"></div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <Sparkles 
            className={`w-7 h-7 transform transition-all duration-300 ${
              isHovered ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
            }`} 
          />
        </div>

        {/* Floating Icons Animation */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <MessageCircle className="absolute -top-1 -right-1 w-4 h-4 text-purple-200 animate-bounce" style={{ animationDelay: '0s' }} />
          <HelpCircle className="absolute -bottom-1 -left-1 w-4 h-4 text-purple-200 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <Lightbulb className="absolute top-1 -left-2 w-3 h-3 text-purple-200 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </button>

      {/* Tooltip */}
      <div className={`
        absolute bottom-20 left-1/2 transform -translate-x-1/2
        transition-all duration-300 ease-out
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
      `}>
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap">
          Ask Stella for help
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Ambient Glow */}
      <div className={`
        absolute inset-0 rounded-full
        bg-gradient-to-br from-purple-400 to-indigo-500
        opacity-20 blur-xl scale-150
        transition-opacity duration-300
        ${isHovered ? 'opacity-30' : 'opacity-20'}
        pointer-events-none
      `}></div>
    </div>
  );
};

export default StellaFloatingButton;
