import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditTrip.css';

function EditTrip({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    mapsUrl: ''
  });

  useEffect(() => {
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const trip = trips.find(t => t.id === id);
    if (trip) {
      setFormData(trip);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const updatedTrips = trips.map(t =>
      t.id === id ? { ...t, ...formData } : t
    );
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    navigate('/home');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      const trips = JSON.parse(localStorage.getItem('trips')) || [];
      const filteredTrips = trips.filter(t => t.id !== id);
      localStorage.setItem('trips', JSON.stringify(filteredTrips));
      navigate('/home');
    }
  };

  return (
    <div className="container">
      <div className="form-card card">
        <h1>✏️ Edit Trip</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trip Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Google Maps URL</label>
            <input
              type="text"
              name="mapsUrl"
              value={formData.mapsUrl}
              onChange={handleChange}
              placeholder="Paste Google Maps URL here"
              required
            />
            <p className="helper-text">💡 How to get URL: Open Google Maps, find your location, and copy the URL from the address bar</p>
          </div>
          <div className="button-group">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" onClick={handleDelete} className="btn btn-danger">Delete Trip</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTrip;
