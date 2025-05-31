import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const locales = {
  'en-US': require('date-fns/locale/en-US')
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
})

export default function EventsCalendarPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    async function fetchEvents() {
      const user = (await supabase.auth.getUser()).data.user
      const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('org_id', orgId)

      if (data) {
        const formatted = data.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.event_date),
          end: new Date(event.event_date)
        }))
        setEvents(formatted)
      } else {
        console.error('Error loading events:', error)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
      />
    </div>
  )
}
