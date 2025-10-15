import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      navigate('/account'); // Redirect to account page after login
    }
    setLoading(false);
  };
  
  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the confirmation link!')
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h1 className="text-3xl font-bold text-white text-center mb-8">Sign In or Create Account</h1>
      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
          <input
            id="email"
            className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            type="email"
            placeholder="Your email address"
            value={email}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            type="password"
            placeholder="Your password"
            value={password}
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-1 disabled:bg-gray-500" disabled={loading}>
            {loading ? <span>Loading...</span> : <span>Login</span>}
          </button>
          <button onClick={handleSignUp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-1 disabled:bg-gray-500" disabled={loading}>
            {loading ? <span>Loading...</span> : <span>Sign Up</span>}
          </button>
        </div>
      </form>
    </div>
  )
}