import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';

function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventId } = useParams();
  
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isRsvpd, setIsRsvpd] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // State for the RSVP modal
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [selectedReplica, setSelectedReplica] = useState('AEG');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (!eventId) { setLoading(false); return; }

      const { data: eventData, error: eventError } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventError) {
        setError('Could not find the requested event.');
        setLoading(false);
        return;
      }
      setEvent(eventData);

      const { data: reservations, error: reservationsError, count } = await supabase.from('reservations').select('*', { count: 'exact' }).eq('event_id', eventId);
      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError);
      } else {
        setAttendeeCount(count);
        if (session?.user && reservations) {
          const userReservation = reservations.find(r => r.user_id === session.user.id);
          setIsRsvpd(!!userReservation);
        }
      }

      if (session?.user) {
        const { data: profileData } = await supabase.from('profiles').select('full_name, club').eq('id', session.user.id).single();
        setProfile(profileData);
      }
      setLoading(false);
    };
    fetchAllData();
  }, [eventId]);

  const openRsvpModal = () => {
    if (event.event_type === 'Springer Only') {
      setSelectedReplica('Boltac'); // Default to Boltac for springer-only events
    } else {
      setSelectedReplica('AEG'); // Default to AEG for all other events
    }
    setShowRsvpModal(true);
  };

  const handleRsvpAndPay = async () => {
    if (!profile?.full_name || !profile?.club) {
      alert("Please complete your profile (Name and Club) on your Account page before RSVPing.");
      navigate('/account');
      return;
    }
    
    setRsvpLoading(true);
    setShowRsvpModal(false);

    try {
      const { data, error } = await supabase.functions.invoke('create-transaction', {
        body: { 
          eventId: event.id,
          replicaType: selectedReplica
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      window.snap.pay(data.token, {
        onSuccess: async function(result){
          const { error: insertError } = await supabase.from('reservations').insert({ event_id: eventId, user_id: session.user.id });
          if (insertError) throw insertError;
          alert("Payment success and RSVP confirmed!");
          setIsRsvpd(true);
          setAttendeeCount(prev => prev + 1);
        },
        onPending: function(result){ alert("Waiting for your payment!"); },
        onError: function(result){ alert("Payment failed!"); },
        onClose: function(){ alert('You closed the popup without finishing the payment'); }
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setRsvpLoading(false);
    }
  };
  
  const handleCancelRsvp = async () => {
    if (!session) return;
    if (window.confirm("Are you sure you want to cancel your reservation? This action cannot be undone.")) {
      const { error } = await supabase.from('reservations').delete().eq('event_id', eventId).eq('user_id', session.user.id);
      if (error) {
        alert(error.message);
      } else {
        alert("Your RSVP has been canceled.");
        setIsRsvpd(false);
        setAttendeeCount(prev => prev - 1);
      }
    }
  };

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading...</div>;
  if (error || !event) return <div className="text-center text-red-400 mt-20">{error}</div>;

  return (
    <>
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <img src={event.image_url || 'https://via.placeholder.com/800x300.png?text=Event+Image'} alt={event.title} className="w-full max-h-[80vh] object-contain bg-black" />
        <div className="p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{event.title}</h1>
          <div className="bg-gray-900/50 p-6 rounded-lg border-l-4 border-blue-500 mb-6 space-y-4">
              <p className="text-lg flex items-center gap-3 text-gray-300">
                  <span className="text-2xl">📅</span>
                  <strong>Date:</strong> {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-lg flex items-center gap-3 text-gray-300">
                  <span className="text-2xl">🕒</span>
                  <strong>Time:</strong> {format(new Date(event.event_date), 'h:mm a')}
              </p>
              <p className="text-lg flex items-center gap-3 text-gray-300">
                  <span className="text-2xl">📍</span>
                  <strong>Location:</strong> {event.location} ({event.address})
              </p>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">{event.description}</p>
          <div className="mt-8 bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Are you going?</h3>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <span className="text-xl font-semibold text-white">{attendeeCount} players attending</span>
              {session ? (
                isRsvpd ? (
                  <button onClick={handleCancelRsvp} className="font-bold py-3 px-8 rounded-lg transition-all duration-300 text-lg shadow-lg transform hover:-translate-y-1 bg-red-600 hover:bg-red-700 text-white">Cancel RSVP</button>
                ) : (
                  <button onClick={openRsvpModal} disabled={rsvpLoading} className="font-bold py-3 px-8 rounded-lg transition-all duration-300 text-lg shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white">
                    {rsvpLoading ? 'Processing...' : `RSVP & Pay`}
                  </button>
                )
              ) : ( <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:-translate-y-1">Login to RSVP</Link> )}
            </div>
          </div>
        </div>
      </div>

      {showRsvpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-sm w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Confirm Your RSVP</h2>
            <div className="text-gray-200 mb-6 space-y-2 border-y border-gray-700 py-4">
              <p><strong>Name:</strong> {profile?.full_name || 'Not Set (Please update in Account page)'}</p>
              <p><strong>Club:</strong> {profile?.club || 'Not Set (Please update in Account page)'}</p>
            </div>

            <label htmlFor="replica" className="block text-sm font-medium text-gray-300">Select Your Replica</label>
            <select id="replica" value={selectedReplica} onChange={(e) => setSelectedReplica(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3">
              {event.event_type === 'Springer Only' ? (
                <>
                  <option value="Boltac">Bolt Action (Boltac)</option>
                  <option value="Springer">Springer (Pistol/Shotgun)</option>
                </>
              ) : (
                <>
                  <option value="AEG">AEG / HPA</option>
                  <option value="Boltac">Bolt Action (Boltac)</option>
                  <option value="Springer">Springer (Pistol/Shotgun)</option>
                </>
              )}
            </select>
            
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowRsvpModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 w-full rounded-md transition-colors">Cancel</button>
              <button onClick={handleRsvpAndPay} disabled={rsvpLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 w-full rounded-md transition-colors disabled:opacity-50">
                {rsvpLoading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EventDetail;

