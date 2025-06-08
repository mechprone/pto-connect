# PTO Connect Theme System

A comprehensive theme customization system for PTO Connect that allows users to personalize their experience with beautiful pastel color schemes.

## Features

- **8 Beautiful Pastel Themes**: Ocean Blue, Blossom Pink, Lavender, Mint Green, Peach, Seafoam, Periwinkle, and Rose Quartz
- **Real-time Theme Switching**: Instant preview and application of theme changes
- **Persistent User Preferences**: Themes are saved to the database and persist across sessions
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Accessibility Support**: High contrast and reduced motion support included
- **CSS Variable System**: Dynamic theming using CSS custom properties

## Installation

### 1. Database Setup

First, run the database schema to add the user preferences table:

```sql
-- Run this in your Supabase SQL editor or database console
-- File: database-schema.sql
```

### 2. Add Theme CSS

Import the theme CSS file in your main CSS file or index.css:

```css
/* Add to your main CSS file */
@import './theme.css';
```

### 3. Wrap Your App with ThemeProvider

Update your main App.jsx to include the ThemeProvider:

```jsx
import { ThemeProvider } from './path/to/ThemeProvider'
import './theme.css'

function App() {
  return (
    <ThemeProvider>
      {/* Your existing app content */}
    </ThemeProvider>
  )
}
```

### 4. Add Theme Settings to Your Routes

Add the theme settings page to your routing:

```jsx
import ThemeSettings from './path/to/ThemeSettings'

// In your routes
<Route path="/settings/theme" element={<ThemeSettings />} />
```

## Usage

### Using the Theme Hook

```jsx
import { useTheme } from './path/to/ThemeProvider'

function MyComponent() {
  const { currentTheme, theme, changeTheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme.name}</p>
      <button onClick={() => changeTheme('pink')}>
        Switch to Pink
      </button>
    </div>
  )
}
```

### Using Theme CSS Classes

```jsx
// Dynamic theme colors using CSS variables
<button 
  className="px-4 py-2 rounded-lg text-white"
  style={{ backgroundColor: `rgb(var(--theme-primary))` }}
>
  Primary Button
</button>

// Pre-built theme classes
<button className="theme-button-primary">
  Primary Button
</button>

<div className="theme-card">
  <div className="theme-metric-icon">
    <Icon />
  </div>
</div>
```

### Available CSS Variables

```css
:root {
  --theme-primary: /* RGB values for primary color */
  --theme-primary-light: /* RGB values for light variant */
  --theme-primary-dark: /* RGB values for dark variant */
}
```

### Available Theme Classes

- `.bg-theme-primary` - Primary background color
- `.bg-theme-primary-light` - Light background color
- `.text-theme-primary` - Primary text color
- `.text-theme-primary-dark` - Dark text color
- `.border-theme-primary` - Primary border color
- `.theme-button-primary` - Styled primary button
- `.theme-button-secondary` - Styled secondary button
- `.theme-card` - Themed card component
- `.theme-metric-card` - Themed metric card with hover effects
- `.theme-badge` - Themed badge/pill component

## Theme Options

| Theme Key | Name | Primary Color | Description |
|-----------|------|---------------|-------------|
| `blue` | Ocean Blue | #3B82F6 | Professional blue (default) |
| `pink` | Blossom Pink | #EC4899 | Soft feminine pink |
| `purple` | Lavender | #9333EA | Elegant purple |
| `green` | Mint Green | #22C55E | Fresh green |
| `orange` | Peach | #FB923C | Warm orange |
| `teal` | Seafoam | #14B8A6 | Calming teal |
| `indigo` | Periwinkle | #6366F1 | Deep indigo |
| `rose` | Rose Quartz | #F43F5E | Vibrant rose |

## Integration with Existing Components

### Update Your Sidebar Navigation

```jsx
// Replace static blue classes with theme classes
<a 
  href="#" 
  className="flex items-center space-x-3 px-3 py-2 bg-theme-primary-light text-theme-primary-dark rounded-lg font-medium"
>
  <Icon className="w-5 h-5" />
  <span>Dashboard</span>
</a>
```

### Update Metric Cards

```jsx
function MetricCard({ icon: Icon, value, label, trend }) {
  return (
    <div className="theme-metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="theme-metric-icon">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="theme-badge">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  )
}
```

### Update Buttons

```jsx
// Primary button
<button className="theme-button-primary px-6 py-2 rounded-lg">
  Save Changes
</button>

// Secondary button
<button className="theme-button-secondary px-6 py-2 rounded-lg">
  Cancel
</button>

// Custom styled button
<button 
  className="px-6 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
  style={{ backgroundColor: `rgb(var(--theme-primary))` }}
>
  Custom Button
</button>
```

## File Structure

```
pto-connect-theme-system/
├── ThemeProvider.jsx      # React context provider for theme management
├── ThemeSettings.jsx      # Theme selection UI component
├── theme.css             # CSS variables and utility classes
├── database-schema.sql   # Database schema for user preferences
└── README.md            # This documentation
```

## Browser Support

- Modern browsers with CSS custom properties support
- Graceful fallback to default blue theme for older browsers
- Responsive design works on all screen sizes
- Accessibility features for high contrast and reduced motion

## Performance Considerations

- CSS variables provide efficient theme switching without re-rendering
- Database queries are optimized with proper indexing
- Theme preferences are cached in React state
- Minimal bundle size impact

## Future Enhancements

- Dark mode support
- Custom color picker for advanced users
- Theme scheduling (different themes for different times)
- Organization-wide theme defaults
- Theme import/export functionality

## Troubleshooting

### Theme not applying
- Ensure ThemeProvider wraps your entire app
- Check that theme.css is imported
- Verify database schema is applied

### Database errors
- Ensure user_preferences table exists
- Check RLS policies are properly configured
- Verify user authentication is working

### CSS not updating
- Clear browser cache
- Check CSS variable syntax
- Ensure proper class names are used

## Support

For issues or questions about the theme system, please refer to the main PTO Connect documentation or contact the development team.
