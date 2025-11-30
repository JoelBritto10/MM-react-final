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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load trip from localStorage using correct key
    const trips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
    const trip = trips.find(t => t.id === id);
    if (trip) {
      setFormData(trip);
    } else {
      alert('Trip not found');
      navigate('/home');
    }
    setLoading(false);
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update trip in localStorage
      const trips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
      const tripIndex = trips.findIndex(t => t.id === id);
      
      if (tripIndex !== -1) {
        trips[tripIndex] = { ...formData, id };
        localStorage.setItem('mapmates_trips', JSON.stringify(trips));
        alert('✅ Trip updated successfully!');
        navigate('/home');
      } else {
        alert('Trip not found');
      }
    } catch (error) {
      console.error('Update trip error:', error);
      alert('Error updating trip. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        // Delete trip from localStorage
        const trips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
        const filteredTrips = trips.filter(t => t.id !== id);
        localStorage.setItem('mapmates_trips', JSON.stringify(filteredTrips));
        alert('✅ Trip deleted successfully!');
        navigate('/home');
      } catch (error) {
        console.error('Delete trip error:', error);
        alert('Error deleting trip. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

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
