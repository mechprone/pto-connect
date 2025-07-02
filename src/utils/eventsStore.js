/**
 * Global Events Store
 * Persists events data across component unmounts/remounts
 * Uses singleton pattern with localStorage persistence
 */

import { eventsAPI } from '@/utils/api';

class EventsStore {
  constructor() {
    this.rawData = null;
    this.lastFetch = 0;
    this.cacheKey = 'pto_events_store_v2'; // Updated version
    this.cacheDuration = 10 * 60 * 1000; // 10 minutes
    this.subscribers = new Set();
    this.visibilityListenerSetup = false;
    
    // Load from localStorage on initialization
    this.loadFromStorage();
    
    // Setup visibility listener to extend cache
    this.setupVisibilityListener();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < this.cacheDuration) {
          this.rawData = parsed.data;
          this.lastFetch = parsed.timestamp;
          console.log('📦 [EventsStore] Loaded from localStorage');
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load events from storage:', error);
    }
    console.log('🔍 [EventsStore] No valid cache found');
  }

  saveToStorage() {
    try {
      const toStore = {
        data: this.rawData,
        timestamp: this.lastFetch
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to save events to storage:', error);
    }
  }

  setupVisibilityListener() {
    if (typeof document !== 'undefined' && !this.visibilityListenerSetup) {
      this.visibilityListenerSetup = true;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.rawData) {
          // Only extend cache if it's been more than 30 seconds since last activity
          const timeSinceLastFetch = Date.now() - this.lastFetch;
          if (timeSinceLastFetch > 30000) { // 30 seconds
            this.lastFetch = Date.now();
            this.saveToStorage();
            console.log('🔄 [EventsStore] Extended cache on visibility change');
          }
        }
      });
    }
  }

  async getEvents(format = 'calendar') {
    // Check if we have fresh data
    if (this.rawData && (Date.now() - this.lastFetch) < this.cacheDuration) {
      console.log('✅ [EventsStore] Using cached events');
      return format === 'raw' ? this.rawData : this.getFormattedEvents(this.rawData, format);
    }

    // Fetch fresh data
    console.log('🔄 [EventsStore] Fetching fresh events');
    try {
      const result = await eventsAPI.getEvents();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const eventsData = result.data || result;
      
      if (!Array.isArray(eventsData)) {
        throw new Error('Invalid events data received');
      }

      // Store raw data
      this.rawData = eventsData;
      this.lastFetch = Date.now();
      this.saveToStorage();
      this.notifySubscribers();
      
      console.log(`💾 [EventsStore] Cached ${eventsData.length} events`);
      return format === 'raw' ? this.rawData : this.getFormattedEvents(this.rawData, format);

    } catch (error) {
      console.error('❌ [EventsStore] Error fetching events:', error);
      // Return stale data if available
      if (this.rawData) {
        console.log('📦 [EventsStore] Using stale data due to error');
        return format === 'raw' ? this.rawData : this.getFormattedEvents(this.rawData, format);
      }
      throw error;
    }
  }

  getFormattedEvents(rawData, format) {
    if (format === 'dashboard') {
      // Format for dashboard - add calculated fields
      return rawData.map(ev => ({
        ...ev,
        attendees: ev.attendees || 0,
        progress: ev.progress || 0,
        profit: ev.profit || 0,
        type: ev.stella_generated ? 'stella-generated' : 'manual'
      }));
    }

    // Default calendar format
    const EVENT_TYPE_COLORS = {
      fundraiser: '#f59e42',
      meeting: '#2563eb',
      social: '#10b981',
      other: '#a78bfa',
    };

    return rawData.map(ev => {
      const eventType = ev.category || 'other';
      const eventColor = EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.other;
      
      let startDateTime = ev.event_date;
      let endDateTime = ev.event_date;
      let isAllDay = true;
      
      if (ev.start_time) {
        startDateTime = `${ev.event_date}T${ev.start_time}`;
        isAllDay = false;
      }
      
      if (ev.end_time) {
        endDateTime = `${ev.event_date}T${ev.end_time}`;
      } else if (ev.start_time) {
        const startTime = new Date(`${ev.event_date}T${ev.start_time}`);
        startTime.setHours(startTime.getHours() + 1);
        endDateTime = startTime.toISOString();
      }
      
      const getDarkerColor = (hexColor) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const darkR = Math.floor(r * 0.4);
        const darkG = Math.floor(g * 0.4);
        const darkB = Math.floor(b * 0.4);
        return `rgb(${darkR}, ${darkG}, ${darkB})`;
      };

      const textColor = getDarkerColor(eventColor);

      return {
        id: ev.id,
        title: ev.title,
        start: startDateTime,
        end: endDateTime,
        allDay: isAllDay,
        backgroundColor: eventColor,
        borderColor: eventColor,
        textColor: textColor,
        color: eventColor,
        className: `event-type-${eventType}`,
        rrule: ev.recurrence_rule || undefined,
        extendedProps: { 
          ...ev, 
          type: eventType,
          category: ev.category,
          status: ev.status,
          org_id: ev.org_id,
          start_time: ev.start_time,
          end_time: ev.end_time
        },
      };
    });
  }

  // Invalidate cache (for when events are updated)
  invalidate() {
    this.rawData = null;
    this.lastFetch = 0;
    localStorage.removeItem(this.cacheKey);
    console.log('🗑️ [EventsStore] Cache invalidated');
  }

  // Subscribe to data changes
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.rawData);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }
}

// Create singleton instance
const eventsStore = new EventsStore();

export default eventsStore;

// React hook for easy integration
export const useEventsStore = (format = 'calendar') => {
  const [events, setEvents] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsStore.getEvents(format);
        if (mounted) {
          setEvents(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load events');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to store changes
    const unsubscribe = eventsStore.subscribe((rawData) => {
      if (mounted && rawData) {
        const formattedData = eventsStore.getFormattedEvents(rawData, format);
        setEvents(formattedData);
      }
    });

    loadEvents();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [format]);

  const refresh = React.useCallback(async () => {
    eventsStore.invalidate();
    try {
      setLoading(true);
      setError(null);
      const data = await eventsStore.getEvents(format);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to refresh events');
    } finally {
      setLoading(false);
    }
  }, [format]);

  return { events, loading, error, refresh };
};

// Import React for the hook
import React from 'react'; 