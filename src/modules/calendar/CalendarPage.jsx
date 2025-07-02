import React, { useEffect, useState, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import listPlugin from '@fullcalendar/list';
import './calendar.css';
import { eventsAPI } from '@/utils/api';
import EventModal from '@/components/calendar/EventModal';
import { useEventsStore } from '@/utils/eventsStore';

const EVENT_TYPE_COLORS = {
  fundraiser: '#f59e42', // orange
  meeting: '#2563eb',    // blue
  social: '#10b981',     // green
  other: '#a78bfa',      // purple
};

const CalendarPage = () => {
  console.log('🔄 [Calendar] Component render at:', new Date().toLocaleTimeString());
  
  const [tooltip, setTooltip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const tooltipRef = useRef();

  // Use the persistent events store
  const { events, loading, error, refresh: refreshEvents } = useEventsStore();

  // Status styling function to match event page
  const getStatusStyle = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.draft;
  };

  // Track component mounting
  useEffect(() => {
    console.log('🏗️ [Calendar] Component mounted');
    return () => {
      console.log('💀 [Calendar] Component unmounting');
    };
  }, []);

  // Tooltip logic
  const handleEventMouseEnter = (info) => {
    const { jsEvent, event } = info;
    
    // Format time display in 12-hour AM/PM format
    const formatTime12Hour = (time24) => {
      if (!time24) return '';
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
      return `${hour12}:${minutes} ${ampm}`;
    };

    let timeDisplay = '';
    if (!event.allDay && event.extendedProps.start_time) {
      const startTime12 = formatTime12Hour(event.extendedProps.start_time);
      const endTime12 = event.extendedProps.end_time ? formatTime12Hour(event.extendedProps.end_time) : '';
      timeDisplay = endTime12 ? `${startTime12} - ${endTime12}` : startTime12;
    }

    // Format date in MM-DD-YYYY format
    const formatUSDate = (dateStr) => {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };
    
    setTooltip({
      x: jsEvent.clientX,
      y: jsEvent.clientY,
      content: (
        <div style={{ minWidth: 200 }}>
          <div className="font-bold mb-1">{event.title}</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs capitalize">{event.extendedProps.type || 'Other'}</span>
            {event.extendedProps.status && (
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusStyle(event.extendedProps.status)}`}>
                {event.extendedProps.status}
              </span>
            )}
          </div>
          <div className="text-xs mb-1">
            📅 {formatUSDate(event.start)}
            {timeDisplay && <div>🕐 {timeDisplay}</div>}
          </div>
          {event.extendedProps.location && (
            <div className="text-xs">📍 {event.extendedProps.location}</div>
          )}
          {event.extendedProps.description && (
            <div className="text-xs mt-1">{event.extendedProps.description}</div>
          )}
        </div>
      )
    });
  };

  const handleEventMouseLeave = () => setTooltip(null);

  const handleDateClick = (arg) => {
    setSelectedEvent({ start: arg.dateStr, end: arg.dateStr });
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      type: event.extendedProps.type,
      category: event.extendedProps.category,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      location: event.extendedProps.location,
      description: event.extendedProps.description,
      status: event.extendedProps.status,
      color: event.backgroundColor,
      recurrence: event.extendedProps.recurrence_rule ? 'custom' : '',
      rrule: event.extendedProps.recurrence_rule || '',
      start_time: event.extendedProps.start_time,
      end_time: event.extendedProps.end_time,
    });
    setModalOpen(true);
  };

  const handleEventDrop = async (info) => {
    try {
      const updated = {
        id: info.event.id,
        event_date: info.event.startStr.split('T')[0], // Extract date part
        start_time: info.event.allDay ? null : info.event.startStr.split('T')[1]?.substring(0, 8),
        end_time: info.event.allDay ? null : info.event.endStr?.split('T')[1]?.substring(0, 8),
      };
      
      console.log('🔄 [Calendar] Updating event:', updated);
      await eventsAPI.updateEvent(updated.id, updated);
      
      // Refresh cache to get updated data
      refreshEvents();
    } catch (error) {
      console.error('❌ [Calendar] Error updating event:', error);
    }
  };

  const handleModalSave = async (form) => {
    try {
      console.log('💾 [Calendar] Saving event:', form);
      
      if (form.id) {
        await eventsAPI.updateEvent(form.id, form);
      } else {
        await eventsAPI.createEvent(form);
      }
      setModalOpen(false);
      setSelectedEvent(null);
      
      // Refresh cache to get updated data
      refreshEvents();
    } catch (error) {
      console.error('❌ [Calendar] Error saving event:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setTooltip(null);
    };
    if (tooltip) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tooltip]);

  if (loading) {
    return (
      <div className="calendar-page-container flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-page-container flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading calendar</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page-container" style={{ position: 'relative' }}>
      {/* Header with event count and legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">PTO Calendar</h2>
          <span className="text-sm text-gray-600">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="font-semibold">Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span style={{background: EVENT_TYPE_COLORS.fundraiser, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>
            Fundraiser
          </span>
          <span className="inline-flex items-center gap-1">
            <span style={{background: EVENT_TYPE_COLORS.meeting, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>
            Meeting
          </span>
          <span className="inline-flex items-center gap-1">
            <span style={{background: EVENT_TYPE_COLORS.social, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>
            Social
          </span>
          <span className="inline-flex items-center gap-1">
            <span style={{background: EVENT_TYPE_COLORS.other, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>
            Other
          </span>
        </div>
      </div>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        events={events}
        height="auto"
        themeSystem="standard"
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        editable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        eventContent={(eventInfo) => {
          // Custom event content to show time for non-all-day events
          return (
            <div className="fc-event-main-frame">
              <div className="fc-event-title-container">
                <div className="fc-event-title fc-sticky">
                  {eventInfo.event.title}
                  {!eventInfo.event.allDay && eventInfo.event.extendedProps.start_time && (
                    <div className="text-xs opacity-80">
                      {eventInfo.event.extendedProps.start_time.substring(0, 5)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      />
      
      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
        onSave={handleModalSave}
        initialEventData={selectedEvent}
      />
      
      {tooltip && (
        <div
          ref={tooltipRef}
          className="fc-tooltip"
          style={{ position: 'fixed', left: tooltip.x + 12, top: tooltip.y + 12, zIndex: 1000 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default CalendarPage; 