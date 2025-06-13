import React, { useState } from 'react';
import { Sparkles, User, Settings } from 'lucide-react';

const AIAssistanceToggle = ({ 
  onModeChange, 
  defaultMode = 'manual',
  showSettings = true,
  className = ''
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [aiSettings, setAiSettings] = useState({
    autoSuggestions: true,
    contentGeneration: true,
    workflowAutomation: false
  });

  const handleModeChange = (newMode) => {
    setMode(newMode);
    onModeChange?.(newMode, aiSettings);
  };

  const modes = [
    {
      id: 'manual',
      label: 'Manual Creation',
      icon: User,
      description: 'Full manual control',
      color: 'gray'
    },
    {
      id: 'assisted',
      label: 'AI Assisted',
      icon: Sparkles,
      description: 'AI suggestions & help',
      color: 'blue'
    },
    {
      id: 'automated',
      label: 'AI Automated',
      icon: Sparkles,
      description: 'Full AI automation',
      color: 'purple'
    }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Creation Mode</h3>
        {showSettings && (
          <button className="p-1 hover:bg-gray-100 rounded">
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon;
          const isSelected = mode === modeOption.id;
          
          return (
            <button
              key={modeOption.id}
              onClick={() => handleModeChange(modeOption.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? `border-${modeOption.color}-300 bg-${modeOption.color}-50`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon 
                className={`w-5 h-5 ${
                  isSelected ? `text-${modeOption.color}-600` : 'text-gray-400'
                }`} 
              />
              <div className="flex-1 text-left">
                <div className={`font-medium ${
                  isSelected ? `text-${modeOption.color}-900` : 'text-gray-700'
                }`}>
                  {modeOption.label}
                </div>
                <div className={`text-xs ${
                  isSelected ? `text-${modeOption.color}-700` : 'text-gray-500'
                }`}>
                  {modeOption.description}
                </div>
              </div>
              {isSelected && (
                <div className={`w-2 h-2 rounded-full bg-${modeOption.color}-600`} />
              )}
            </button>
          );
        })}
      </div>
      
      {mode === 'assisted' && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-900 font-medium mb-2">AI Assistance Options</div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={aiSettings.autoSuggestions}
                onChange={(e) => setAiSettings({...aiSettings, autoSuggestions: e.target.checked})}
                className="rounded border-blue-300 text-blue-600"
              />
              <span className="text-sm text-blue-800">Auto-suggestions</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={aiSettings.contentGeneration}
                onChange={(e) => setAiSettings({...aiSettings, contentGeneration: e.target.checked})}
                className="rounded border-blue-300 text-blue-600"
              />
              <span className="text-sm text-blue-800">Content generation</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistanceToggle;
