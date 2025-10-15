import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../supabaseClient';

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (error) console.error('Error fetching events:', error);
      else setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to permanently delete this event?')) {
      const { error } = await supabase.from('events').delete().eq('id', eventId);
      if (error) alert('Error deleting event: ' + error.message);
      else {
        setEvents(events.filter((event) => event.id !== eventId));
        alert('Event deleted successfully.');
      }
    }
  };

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading events...</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-10 pb-6 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-white">Event Management</h1>
        <button
          onClick={() => navigate('/admin/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-1"
        >
          ＋ Add New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.length > 0 ? (
          events.map((event) => (
            // The key must be on the top-level element inside the map
            <div key={event.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="p-6 flex-grow">
                <h2 className="text-2xl font-bold text-white mb-3">{event.title}</h2>
                <p className="text-gray-400 flex items-center gap-3 mb-2">
                  <span className="text-xl">📅</span>
                  {format(new Date(event.event_date), "MMMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-gray-400 flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  {event.location}
                </p>
              </div>
              <div className="bg-gray-900/50 px-6 py-4 flex gap-4">
                <button onClick={() => navigate(`/admin/attendees/${event.id}`)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 w-full rounded-md transition-colors">
                  Attendees
                </button>
                <button onClick={() => navigate(`/admin/edit/${event.id}`)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 w-full rounded-md transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 w-full rounded-md transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center bg-gray-800 p-12 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-semibold text-white">No Events Found</h3>
            <p className="text-gray-400 mt-2">Click "Add New Event" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;