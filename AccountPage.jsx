import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [fullName, setFullName] = useState('');
  const [club, setClub] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, club')
          .eq('id', session.user.id)
          .single();

        if (error) console.error('Error fetching profile', error);
        if (data) {
          setFullName(data.full_name || '');
          setClub(data.club || '');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { user } = session;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, club: club })
      .eq('id', user.id);
    
    if (error) {
      alert(error.message);
    } else {
      alert('Profile updated successfully!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  if (loading) return <div className="text-center text-gray-400 mt-20">Loading account...</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h1 className="text-3xl font-bold text-white text-center mb-4">Your Account</h1>
      <p className="text-center text-gray-400 mb-8">Welcome, {session?.user.email}</p>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">Full Name</label>
          <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="club" className="block text-sm font-medium text-gray-300">Club / Team Name</label>
          <input id="club" type="text" value={club} onChange={(e) => setClub(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-1">
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>

      <div className="border-t border-gray-700 mt-8 pt-6">
        <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-1">
          Sign Out
        </button>
      </div>
    </div>
  )
}