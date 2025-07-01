import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import listPlugin from '@fullcalendar/list';
import './calendar.css';
import { eventsAPI } from '@/utils/api';
import EventModal from '@/components/calendar/EventModal';

const EVENT_TYPE_COLORS = {
  fundraiser: '#f59e42', // orange
  meeting: '#2563eb',    // blue
  social: '#10b981',     // green
  other: '#a78bfa',      // purple
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const tooltipRef = useRef();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const result = await eventsAPI.getEvents();
        
        if (result.error) {
          console.error('❌ Error fetching events:', result.error);
          return;
        }
        
        const eventsData = result.data || result;
        
        if (!Array.isArray(eventsData)) {
          console.error('❌ Events data is not an array:', eventsData);
          return;
        }
        
        const mapped = eventsData.map(ev => {
          // Map category to type for color coding
          const eventType = ev.type || ev.category || 'other';
          return {
            id: ev.id,
            title: ev.title,
            start: ev.event_date,
            end: ev.end_date || ev.event_date,
            allDay: true,
            color: EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.other,
            rrule: ev.rrule || undefined,
            extendedProps: { ...ev, type: eventType },
          };
        });
        
        setEvents(mapped);
      } catch (error) {
        console.error('❌ Error in fetchEvents:', error);
      }
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
        <div style={{ minWidth: 200 }}>
          <div className="font-bold mb-1">{event.title}</div>
          <div className="text-xs mb-1">{event.extendedProps.type || 'Other'} | {event.startStr} {event.endStr && `- ${event.endStr}`}</div>
          {event.extendedProps.location && <div className="text-xs">📍 {event.extendedProps.location}</div>}
          {event.extendedProps.description && <div className="text-xs mt-1">{event.extendedProps.description}</div>}
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

  const handleEventDrop = async (info) => {
    try {
      const updated = {
        id: info.event.id,
        start: info.event.startStr,
        end: info.event.endStr,
      };
      await eventsAPI.updateEvent(updated.id, updated);
      // Refetch events
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
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleModalSave = async (form) => {
    try {
      if (form.id) {
        await eventsAPI.updateEvent(form.id, form);
      } else {
        await eventsAPI.createEvent(form);
      }
      setModalOpen(false);
      setSelectedEvent(null);
      // Refetch events
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
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setTooltip(null);
    };
    if (tooltip) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tooltip]);

  return (
    <div className="calendar-page-container" style={{ position: 'relative' }}>
      {/* Legend and Calendar */}
      <div className="flex gap-4 mb-4">
        <span className="font-semibold">Legend:</span>
        <span className="inline-flex items-center gap-1"><span style={{background: EVENT_TYPE_COLORS.fundraiser, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>Fundraiser</span>
        <span className="inline-flex items-center gap-1"><span style={{background: EVENT_TYPE_COLORS.meeting, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>Meeting</span>
        <span className="inline-flex items-center gap-1"><span style={{background: EVENT_TYPE_COLORS.social, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>Social</span>
        <span className="inline-flex items-center gap-1"><span style={{background: EVENT_TYPE_COLORS.other, width: 16, height: 16, borderRadius: 4, display: 'inline-block'}}></span>Other</span>
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