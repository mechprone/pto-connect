import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

const locales = {
  'en-US': enUS
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
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User error:', userError)
      return
    }

    const orgId = user?.user_metadata?.org_id || user?.app_metadata?.org_id

    if (!orgId) {
      console.error('Missing org_id in user metadata.')
      return
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('org_id', orgId)

    if (error) {
      console.error('Error loading events:', error)
    } else {
      const formatted = data.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.event_date),
        end: new Date(event.event_date)
      }))
      setEvents(formatted)
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
