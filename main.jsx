import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EventForm from './pages/EventForm.jsx';
import EventsListPage from './pages/EventsListPage.jsx';
import EventDetail from './pages/EventDetail.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AttendeesPage from './pages/AttendeesPage.jsx';
import AdminRoute from './pages/AdminRoute.jsx';
import AboutPage from './pages/AboutPage.jsx'; // 👈 Import the new page
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <EventsListPage /> },
      { path: "about", element: <AboutPage /> }, // 👈 Add the new route
      { path: "event/:eventId", element: <EventDetail /> },
      { path: "auth", element: <AuthPage /> },
      { path: "account", element: <AccountPage /> },
      
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "new", element: <EventForm /> },
          { path: "edit/:eventId", element: <EventForm /> },
          { path: "attendees/:eventId", element: <AttendeesPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
