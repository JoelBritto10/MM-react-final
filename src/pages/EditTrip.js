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
    time: '',
    mapsUrl: '',
    category: 'all',
    maxCount: '',
    tripType: 'group'
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let tripImageURL = formData.image;

    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const updatedTrips = trips.map(t =>
      t.id === id ? { ...t, ...formData, image: tripImageURL } : t
    );
    localStorage.setItem('trips', JSON.stringify(updatedTrips));
    alert('✅ Trip updated successfully!');
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
          <div className="form-group-row">
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
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Trip Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="category-select"
            >
              <option value="all">🌍 All</option>
              <option value="beach">🏖️ Beach</option>
              <option value="mountain">⛰️ Mountain</option>
              <option value="city">🏙️ City</option>
              <option value="adventure">🎯 Adventure</option>
              <option value="culture">🎭 Culture</option>
              <option value="sports">⚽ Sports</option>
            </select>
          </div>

          <div className="form-group">
            <label>👥 Max Participants (Optional)</label>
            <input
              type="number"
              name="maxCount"
              value={formData.maxCount}
              onChange={handleChange}
              placeholder="Maximum number of members allowed (leave blank for unlimited)"
              min="1"
              max="999"
            />
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              Leave blank for unlimited participants
            </p>
          </div>

          <div className="form-group">
            <label>👫 Trip Type</label>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={handleChange}
              className="category-select"
            >
              <option value="group">👥 Group Trip (Friends & Singles)</option>
              <option value="couples">👫 Couples Only</option>
            </select>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              Choose who can join this trip
            </p>
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
