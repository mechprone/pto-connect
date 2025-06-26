import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

const Tabs = ({ value, onValueChange, children, className = '' }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '' }) => {
  const { value: currentValue, onValueChange } = useContext(TabsContext);
  const isActive = currentValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const { value: currentValue } = useContext(TabsContext);
  
  if (currentValue !== value) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent }; 