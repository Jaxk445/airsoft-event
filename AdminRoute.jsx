import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch the user's role from the 'profiles' table
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
        } else if (data) {
          setUserRole(data.role);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400 mt-20">Checking permissions...</div>;
  }

  // If the user's role is 'admin', show the nested admin pages using <Outlet />.
  // Otherwise, redirect them to the homepage.
  return userRole === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}       