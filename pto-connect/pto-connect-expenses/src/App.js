import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import ExpenseSubmissionForm from './components/ExpenseSubmissionForm';
import MyExpenses from './components/MyExpenses';
import Navigation from './components/Navigation';
import AuthWrapper from './components/AuthWrapper';
import OfflineIndicator from './components/OfflineIndicator';
import InstallPrompt from './components/InstallPrompt';

// Services
import { authService } from './services/authService';
import { offlineService } from './services/offlineService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    initializeApp();
    setupEventListeners();
    checkPendingSync();
  }, []);

  const initializeApp = async () => {
    try {
      // Check authentication status
      const authStatus = await authService.checkAuthStatus();
      if (authStatus.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(authStatus.user);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Online/Offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      offlineService.syncPendingExpenses().then(() => {
        checkPendingSync();
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          checkPendingSync();
          // Show success notification
          showNotification('Expenses synced successfully!', 'success');
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const checkPendingSync = async () => {
    try {
      const count = await offlineService.getPendingSyncCount();
      setPendingSync(count);
    } catch (error) {
      console.error('Failed to check pending sync:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification system - could be enhanced with a toast library
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PTO Connect Expenses', {
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        {!isAuthenticated ? (
          <AuthWrapper onLogin={handleLogin} />
        ) : (
          <>
            <OfflineIndicator 
              isOnline={isOnline} 
              pendingSync={pendingSync}
            />
            
            <div className="app-content">
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to="/submit" replace />} 
                />
                <Route 
                  path="/submit" 
                  element={
                    <ExpenseSubmissionForm 
                      user={user}
                      isOnline={isOnline}
                      onSubmitSuccess={checkPendingSync}
                    />
                  } 
                />
                <Route 
                  path="/my-expenses" 
                  element={
                    <MyExpenses 
                      user={user}
                      isOnline={isOnline}
                    />
                  } 
                />
                <Route 
                  path="*" 
                  element={<Navigate to="/submit" replace />} 
                />
              </Routes>
            </div>

            <Navigation />
            
            <InstallPrompt />
          </>
        )}
      </Router>
    </div>
  );
}

export default App;
