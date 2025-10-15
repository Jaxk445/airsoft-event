import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function EventForm() {
  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [priceAeg, setPriceAeg] = useState(0);
  const [priceBoltac, setPriceBoltac] = useState(0);
  const [eventType, setEventType] = useState('All'); // New state for event type
  const [loading, setLoading] = useState(false);
  
  // State for image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const navigate = useNavigate();
  const { eventId } = useParams();

  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
        if (error) {
          console.error('Error fetching event for edit:', error);
          navigate('/admin');
        } else {
          setTitle(data.title);
          setEventDate(data.event_date.slice(0, 16));
          setLocation(data.location);
          setAddress(data.address);
          setDescription(data.description);
          setPriceAeg(data.price_aeg || 0);
          setPriceBoltac(data.price_boltac || 0);
          setEventType(data.event_type || 'All'); // Set the event type
          setExistingImageUrl(data.image_url);
        }
        setLoading(false);
      };
      fetchEvent();
    }
  }, [eventId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = existingImageUrl;

    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('flyers')
        .upload(fileName, imageFile);

      if (uploadError) {
        setLoading(false);
        alert('Error uploading image: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('flyers')
        .getPublicUrl(fileName);
      
      finalImageUrl = urlData.publicUrl;
    }

    // Prepare event data with event type and both prices
    const eventData = { 
      title, 
      event_date: new Date(eventDate), 
      location, 
      address, 
      description, 
      price_aeg: priceAeg, 
      price_boltac: priceBoltac,
      event_type: eventType, // Add event type here
      image_url: finalImageUrl 
    };
    
    let dbError;
    if (eventId) {
      const { error } = await supabase.from('events').update(eventData).eq('id', eventId);
      dbError = error;
    } else {
      const { error } = await supabase.from('events').insert([eventData]);
      dbError = error;
    }
    
    setLoading(false);
    if (dbError) {
      alert('Error saving event: ' + dbError.message);
    } else {
      alert(`Event ${eventId ? 'updated' : 'created'} successfully!`);
      navigate('/admin');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h1 className="text-3xl font-bold text-white text-center mb-8">{eventId ? 'Edit Event' : 'Create New Event'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Event Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
        </div>
        
        {/* New Event Type Field */}
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-300">Event Type</label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
          >
            <option value="All">All Welcome (AEG, HPA, Springer, etc.)</option>
            <option value="Springer Only">Springer / Boltac Only</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location Name</label>
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300">Full Address</label>
            <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Event Date & Time</label>
            <input id="date" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            {/* Empty div for grid alignment */}
          </div>
          <div>
            <label htmlFor="priceAeg" className="block text-sm font-medium text-gray-300">Price AEG/HPA (Rp)</label>
            <input id="priceAeg" type="number" min="0" value={priceAeg} onChange={(e) => setPriceAeg(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="priceBoltac" className="block text-sm font-medium text-gray-300">Price Boltac/Springer (Rp)</label>
            <input id="priceBoltac" type="number" min="0" value={priceBoltac} onChange={(e) => setPriceBoltac(e.target.value)} className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-300">Event Flyer</label>
          <input
            id="imageFile"
            type="file"
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/webp"
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        {(imagePreview || existingImageUrl) && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Image Preview:</p>
            <img 
              src={imagePreview || existingImageUrl} 
              alt="Flyer preview" 
              className="rounded-lg w-full max-w-sm mx-auto"
            />
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="mt-1 block w-full bg-gray-900 border-gray-700 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        
        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-1 disabled:bg-gray-500 disabled:cursor-not-allowed">
            {loading ? 'Saving...' : (eventId ? 'Save Changes' : 'Create Event')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;

