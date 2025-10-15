import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../supabaseClient';

function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('events').select('*').gte('event_date', now).order('event_date', { ascending: true });
      if (error) console.error('Error fetching events:', error);
      else setEvents(data);
      setLoading(false);
    };
    fetchUpcomingEvents();
  }, []);

  if (loading) return <div className="text-center text-gray-400 mt-20">Finding Upcoming Events...</div>;

  return (
    <div className="w-full">
      <div className="mb-10 pb-6 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-white text-center">Upcoming Events</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.length > 0 ? (
          events.map((event) => (
            <Link to={`/event/${event.id}`} key={event.id} className="block group">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-700 group-hover:border-blue-500 transition-all duration-300">
                <div className="p-6 flex-grow">
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{event.title}</h2>
                  <p className="text-gray-400 flex items-center gap-3 mb-2">
                    <span>📅</span>
                    {format(new Date(event.event_date), "MMMM d, yyyy")}
                  </p>
                  <p className="text-gray-400 flex items-center gap-3">
                    <span>📍</span>
                    {event.location}
                  </p>
                </div>
                <div className="bg-gray-900/50 mt-auto px-6 py-4 text-right font-semibold text-blue-500 group-hover:text-blue-300 transition-colors">
                  View Details →
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center bg-gray-800 p-12 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-semibold text-white">No Upcoming Events Found</h3>
            <p className="text-gray-400 mt-2">Please check back later for new events!</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default EventsListPage;