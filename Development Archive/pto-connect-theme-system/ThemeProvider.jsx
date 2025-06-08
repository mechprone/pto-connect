import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const themes = {
  blue: {
    name: 'Ocean Blue',
    primary: 'rgb(59, 130, 246)',
    primaryLight: 'rgb(219, 234, 254)',
    primaryDark: 'rgb(29, 78, 216)',
    primaryRgb: '59, 130, 246',
    primaryLightRgb: '219, 234, 254',
    primaryDarkRgb: '29, 78, 216',
    tailwindClass: 'blue'
  },
  pink: {
    name: 'Blossom Pink',
    primary: 'rgb(236, 72, 153)',
    primaryLight: 'rgb(252, 231, 243)',
    primaryDark: 'rgb(190, 24, 93)',
    primaryRgb: '236, 72, 153',
    primaryLightRgb: '252, 231, 243',
    primaryDarkRgb: '190, 24, 93',
    tailwindClass: 'pink'
  },
  purple: {
    name: 'Lavender',
    primary: 'rgb(147, 51, 234)',
    primaryLight: 'rgb(237, 233, 254)',
    primaryDark: 'rgb(109, 40, 217)',
    primaryRgb: '147, 51, 234',
    primaryLightRgb: '237, 233, 254',
    primaryDarkRgb: '109, 40, 217',
    tailwindClass: 'purple'
  },
  green: {
    name: 'Mint Green',
    primary: 'rgb(34, 197, 94)',
    primaryLight: 'rgb(220, 252, 231)',
    primaryDark: 'rgb(21, 128, 61)',
    primaryRgb: '34, 197, 94',
    primaryLightRgb: '220, 252, 231',
    primaryDarkRgb: '21, 128, 61',
    tailwindClass: 'green'
  },
  orange: {
    name: 'Peach',
    primary: 'rgb(251, 146, 60)',
    primaryLight: 'rgb(254, 243, 199)',
    primaryDark: 'rgb(234, 88, 12)',
    primaryRgb: '251, 146, 60',
    primaryLightRgb: '254, 243, 199',
    primaryDarkRgb: '234, 88, 12',
    tailwindClass: 'orange'
  },
  teal: {
    name: 'Seafoam',
    primary: 'rgb(20, 184, 166)',
    primaryLight: 'rgb(204, 251, 241)',
    primaryDark: 'rgb(13, 148, 136)',
    primaryRgb: '20, 184, 166',
    primaryLightRgb: '204, 251, 241',
    primaryDarkRgb: '13, 148, 136',
    tailwindClass: 'teal'
  },
  indigo: {
    name: 'Periwinkle',
    primary: 'rgb(99, 102, 241)',
    primaryLight: 'rgb(224, 231, 255)',
    primaryDark: 'rgb(67, 56, 202)',
    primaryRgb: '99, 102, 241',
    primaryLightRgb: '224, 231, 255',
    primaryDarkRgb: '67, 56, 202',
    tailwindClass: 'indigo'
  },
  rose: {
    name: 'Rose Quartz',
    primary: 'rgb(244, 63, 94)',
    primaryLight: 'rgb(255, 228, 230)',
    primaryDark: 'rgb(190, 18, 60)',
    primaryRgb: '244, 63, 94',
    primaryLightRgb: '255, 228, 230',
    primaryDarkRgb: '190, 18, 60',
    tailwindClass: 'rose'
  }
}

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue')
  const [loading, setLoading] = useState(true)

  // Load user's theme preference from database
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('user_preferences')
            .select('theme')
            .eq('user_id', user.id)
            .single()
          
          if (profile?.theme && themes[profile.theme]) {
            setCurrentTheme(profile.theme)
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error)
      } finally {
        setLoading(false)
      }
    }

    loadThemePreference()
  }, [])

  // Apply theme CSS variables to document root
  useEffect(() => {
    const theme = themes[currentTheme]
    if (theme) {
      const root = document.documentElement
      root.style.setProperty('--theme-primary', theme.primaryRgb)
      root.style.setProperty('--theme-primary-light', theme.primaryLightRgb)
      root.style.setProperty('--theme-primary-dark', theme.primaryDarkRgb)
      
      // Update body class for theme-specific styling
      document.body.className = document.body.className.replace(/theme-\w+/g, '')
      document.body.classList.add(`theme-${currentTheme}`)
    }
  }, [currentTheme])

  const changeTheme = async (themeName) => {
    if (!themes[themeName]) return

    setCurrentTheme(themeName)

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            theme: themeName,
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    changeTheme,
    loading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
