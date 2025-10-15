import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const { eventId } = useParams();

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!eventId) return;
      setLoading(true);

      // Fetch from the 'event_attendees' view we just created
      const { data, error } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching attendees:', error);
      } else {
        setAttendees(data);
        if (data && data.length > 0) {
          setEventTitle(data[0].event_title); // Set the event title from the first record
        }
      }
      setLoading(false);
    };

    fetchAttendees();
  }, [eventId]);

  if (loading) {
    return <div className="text-center text-gray-400 mt-20">Loading Attendees...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/admin" className="text-blue-400 hover:text-blue-300 transition-colors">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-white mt-4">Attendees</h1>
        <p className="text-xl text-gray-400">{eventTitle}</p>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="min-w-full">
          {attendees.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RSVP Date</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {attendees.map((attendee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{attendee.player_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{format(new Date(attendee.rsvp_date), 'MMMM d, yyyy h:mm a')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-12">
              <h3 className="text-xl font-semibold text-white">No Attendees Yet</h3>
              <p className="text-gray-400 mt-2">No players have RSVP'd for this event.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}