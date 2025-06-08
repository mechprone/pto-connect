import React from 'react'
import { useTheme } from './ThemeProvider'
import { Check } from 'lucide-react'

const ThemeSettings = () => {
  const { currentTheme, themes, changeTheme } = useTheme()

  const themeOptions = [
    { key: 'blue', color: 'bg-blue-500', hoverColor: 'hover:border-blue-200' },
    { key: 'pink', color: 'bg-pink-400', hoverColor: 'hover:border-pink-200' },
    { key: 'purple', color: 'bg-purple-500', hoverColor: 'hover:border-purple-200' },
    { key: 'green', color: 'bg-green-500', hoverColor: 'hover:border-green-200' },
    { key: 'orange', color: 'bg-orange-400', hoverColor: 'hover:border-orange-200' },
    { key: 'teal', color: 'bg-teal-500', hoverColor: 'hover:border-teal-200' },
    { key: 'indigo', color: 'bg-indigo-500', hoverColor: 'hover:border-indigo-200' },
    { key: 'rose', color: 'bg-rose-500', hoverColor: 'hover:border-rose-200' }
  ]

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Theme Preferences</h1>
        <p className="text-gray-600">Personalize your PTO Connect experience with your favorite colors.</p>
      </div>

      {/* Theme Selection Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Theme Color</h2>
          <p className="text-gray-600 text-sm">Select a pastel color that reflects your PTO's personality. This will change the accent colors throughout the application.</p>
        </div>

        {/* Theme Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {themeOptions.map((option) => {
            const theme = themes[option.key]
            const isSelected = currentTheme === option.key
            
            return (
              <div
                key={option.key}
                onClick={() => handleThemeChange(option.key)}
                className={`
                  bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                  hover:transform hover:-translate-y-1 hover:shadow-lg
                  ${isSelected 
                    ? `border-${option.key}-200 ring-2 ring-${option.key}-500 transform -translate-y-1 shadow-lg` 
                    : `border-gray-200 ${option.hoverColor}`
                  }
                `}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-6 h-6 ${option.color} rounded-full`}></div>
                  <span className="font-medium text-gray-900 text-sm">{theme.name}</span>
                </div>
                
                <div className="space-y-2">
                  <div className={`h-2 bg-${option.key}-100 rounded`}></div>
                  <div className={`h-2 bg-${option.key}-200 rounded w-3/4`}></div>
                  <div className={`h-2 bg-${option.key}-300 rounded w-1/2`}></div>
                </div>
                
                {isSelected && (
                  <div className="mt-3 flex justify-center">
                    <Check className={`w-5 h-5 text-${option.key}-600`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            className="px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: `rgb(var(--theme-primary))` }}
          >
            Save Theme Preference
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
        <p className="text-gray-600 text-sm mb-6">See how your selected theme looks across different components.</p>
        
        {/* Sample Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Metric Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `rgb(var(--theme-primary-light))` }}
              >
                <svg 
                  className="w-5 h-5" 
                  style={{ color: `rgb(var(--theme-primary))` }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ 
                  color: `rgb(var(--theme-primary))`,
                  backgroundColor: `rgb(var(--theme-primary-light))`
                }}
              >
                +12%
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">247</h3>
            <p className="text-gray-600 text-sm">Total Members</p>
          </div>

          {/* Sample Button Group */}
          <div className="space-y-3">
            <button 
              className="w-full text-white px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: `rgb(var(--theme-primary))` }}
            >
              Primary Button
            </button>
            <button 
              className="w-full border-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ 
                borderColor: `rgb(var(--theme-primary))`,
                color: `rgb(var(--theme-primary))`
              }}
            >
              Secondary Button
            </button>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 border-gray-300 rounded focus:ring-2"
                style={{ 
                  accentColor: `rgb(var(--theme-primary))`,
                  '--tw-ring-color': `rgb(var(--theme-primary))`
                }}
                defaultChecked 
              />
              <label className="text-sm text-gray-700">Sample checkbox with theme color</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSettings
