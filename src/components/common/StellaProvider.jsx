import React, { createContext, useContext, useState } from 'react';
import StellaAssistant from './StellaAssistant';
import StellaFloatingButton from './StellaFloatingButton';

const StellaContext = createContext();

export const useStella = () => {
  const context = useContext(StellaContext);
  if (!context) {
    throw new Error('useStella must be used within a StellaProvider');
  }
  return context;
};

const StellaProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openStella = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeStella = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const minimizeStella = () => {
    setIsMinimized(!isMinimized);
  };

  const value = {
    isOpen,
    isMinimized,
    openStella,
    closeStella,
    minimizeStella
  };

  return (
    <StellaContext.Provider value={value}>
      {children}
      
      {/* Global Floating Button */}
      <StellaFloatingButton 
        onClick={openStella}
        isActive={isOpen}
      />
      
      {/* Global Assistant Chat */}
      <StellaAssistant
        isOpen={isOpen}
        onClose={closeStella}
        onMinimize={minimizeStella}
        isMinimized={isMinimized}
      />
    </StellaContext.Provider>
  );
};

export default StellaProvider;
