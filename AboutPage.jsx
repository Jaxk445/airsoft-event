import React from 'react';

// --- Import your static images from the assets folder ---
import photo1 from '../assets/photo1.jpg';
import photo2 from '../assets/photo2.jpg';
import photo3 from '../assets/photo3.jpg';
import photo4 from '../assets/photo4.jpg';
import photo5 from '../assets/photo5.jpg';
import photo6 from '../assets/photo6.jpg';


// --- Use the imported variables in your gallery array ---
const galleryImages = [
  photo1,
  photo2,
  photo3,
  photo4,
  photo5,
  photo6,
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto text-gray-200">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-4">About Airsoft Spring Bekasi (ASB)</h1>
        <p className="text-xl text-gray-400">Honesty, Solidarity, and Brotherhood.</p>
      </div>

      <div className="bg-gray-800/50 p-8 rounded-xl shadow-lg border border-gray-700 mb-12 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-lg leading-relaxed text-gray-300">
          Airsoft Spring Bekasi (ASB) is a community dedicated to the sport of airsoft, with a focus on spring-powered replicas and bolt-action rifles. We are a brotherhood of players who value sportsmanship, tactical gameplay, and mutual respect. Our mission is to provide a fun, safe, and challenging environment for airsoft enthusiasts in the Bekasi area and beyond.
        </p>
        <p className="text-lg leading-relaxed text-gray-300 mt-4">
          Whether you are a seasoned veteran or a newcomer to the sport, ASB welcomes you. We regularly organize events, from casual skirmishes to more structured MILSIM scenarios, always emphasizing fair play and a strong sense of community.
        </p>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white">Gallery</h2>
      </div>

      {/* The rest of the component remains the same, it will now use the imported images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryImages.map((src, index) => (
          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 group">
            <img src={src} alt={`ASB Gallery Image ${index + 1}`} className="w-full h-64 object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

