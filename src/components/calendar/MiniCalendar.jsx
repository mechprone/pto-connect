import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import './miniCalendar.css';
import { eventsAPI } from '@/utils/api';
import EventModal from '@/components/calendar/EventModal';

const EVENT_TYPE_COLORS = {
  fundraiser: '#f59e42',
  meeting: '#2563eb',
  social: '#10b981',
  other: '#a78bfa',
};

const MiniCalendar = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const tooltipRef = useRef();

  useEffect(() => {
    async function fetchEvents() {
      const result = await eventsAPI.getEvents();
      const mapped = (result.data || result).map(ev => ({
        id: ev.id,
        title: ev.title,
        start: ev.event_date,
        end: ev.end_date || ev.event_date,
        allDay: true,
        color: EVENT_TYPE_COLORS[ev.type] || EVENT_TYPE_COLORS.other,
        rrule: ev.rrule || undefined,
        extendedProps: { ...ev },
      }));
      setEvents(mapped);
    }
    fetchEvents();
  }, []);

  // Tooltip logic
  const handleEventMouseEnter = (info) => {
    const { jsEvent, event } = info;
    setTooltip({
      x: jsEvent.clientX,
      y: jsEvent.clientY,
      content: (
        <div style={{ minWidth: 180 }}>
          <div className="font-bold mb-1">{event.title}</div>
          <div className="text-xs mb-1">{event.extendedProps.type || 'Other'} | {event.startStr} {event.endStr && `- ${event.endStr}`}</div>
          {event.extendedProps.location && <div className="text-xs">📍 {event.extendedProps.location}</div>}
          {event.extendedProps.description && <div className="text-xs mt-1">{event.extendedProps.description}</div>}
        </div>
      )
    });
  };

  const handleEventMouseLeave = () => setTooltip(null);

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      type: info.event.extendedProps.type,
      start: info.event.startStr,
      end: info.event.endStr,
      allDay: info.event.allDay,
      location: info.event.extendedProps.location,
      description: info.event.extendedProps.description,
      color: info.event.backgroundColor,
      recurrence: info.event.extendedProps.rrule ? 'custom' : '',
      rrule: info.event.extendedProps.rrule || '',
    });
    setModalOpen(true);
  };

  const handleModalSave = async (form) => {
    // For now, just close modal; in future, update event via API
    setModalOpen(false);
    setSelectedEvent(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setTooltip(null);
    };
    if (tooltip) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tooltip]);

  return (
    <div className="mini-calendar-container" style={{ position: 'relative' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        events={events}
        height="auto"
        contentHeight={300}
        aspectRatio={1.2}
        eventClick={handleEventClick}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        themeSystem="journal"
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

export default MiniCalendar; 