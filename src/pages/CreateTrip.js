import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTrip.css';

// Utility function to compress image
const compressImage = (base64String, maxWidth = 400, maxHeight = 400, quality = 0.65) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64String);
  });
};

function CreateTrip({ currentUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    mapsUrl: '',
    image: null,
    category: 'all',
    maxCount: '',
    tripType: 'group'
  });

  const categories = ['all', 'beach', 'mountain', 'city', 'adventure', 'culture', 'sports'];

  const [userLocation, setUserLocation] = useState({ lat: 37.7749, lng: -122.4194 });
  const [urlInput, setUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => console.log('Geolocation error:', error)
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        alert('Image is too large. Please choose an image under 3MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Compress the image
          const compressedImage = await compressImage(reader.result, 400, 400, 0.65);
          setFormData(prev => ({
            ...prev,
            image: compressedImage
          }));
          setImagePreview(compressedImage);
        } catch (error) {
          console.error('Error compressing image:', error);
          alert('Error processing image. Please try another image.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL input for direct coordinates
  const handleUrlInput = (e) => {
    e?.preventDefault?.();
    if (!urlInput.trim()) {
      alert('Please enter a Google Maps URL');
      return;
    }

    const urlMatch = urlInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    if (urlMatch) {
      const lat = parseFloat(urlMatch[1]);
      const lng = parseFloat(urlMatch[2]);
      const mapsUrl = `https://www.google.com/maps/@${lat},${lng},15z`;

      setUserLocation({ lat, lng });
      setFormData(prev => ({
        ...prev,
        mapsUrl: mapsUrl
      }));
      setUrlInput('');
      alert('✅ Location added!');
    } else {
      alert('Invalid Google Maps URL. Please copy the URL from Google Maps.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a trip title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a trip description');
      return;
    }

    if (!formData.location.trim()) {
      alert('Please enter a location');
      return;
    }

    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    if (!formData.time) {
      alert('Please select a time');
      return;
    }

    if (!formData.mapsUrl) {
      alert('Please add a location using the Google Maps URL');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing trips from localStorage
      const existingTrips = JSON.parse(localStorage.getItem('mapmates_trips')) || [];
      
      const newTrip = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: formData.date,
        time: formData.time,
        mapsUrl: formData.mapsUrl,
        hostId: currentUser?.uid || 'demo-user',
        hostName: currentUser?.displayName || 'User',
        participants: [currentUser?.uid || 'demo-user'],
        image: formData.image || null,
        category: formData.category,
        maxCount: formData.maxCount ? parseInt(formData.maxCount) : null,
        tripType: formData.tripType,
        createdAt: new Date().toISOString()
      };

      // Add to existing trips
      existingTrips.push(newTrip);
      localStorage.setItem('mapmates_trips', JSON.stringify(existingTrips));

      alert('✅ Trip created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        mapsUrl: '',
        image: null,
        category: 'all',
        maxCount: '',
        tripType: 'group'
      });
      setImagePreview(null);
      
      navigate('/home');
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Error creating trip: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card card">
        <h1>➕ Create New Trip</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trip Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mountain Adventure"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your trip..."
              required
            />
          </div>

          <div className="form-group">
            <label>Location (Plain Text) *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA or Times Square, New York"
              required
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
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

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Trip Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="image-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="image-upload-label">
                📸 Choose Image
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Trip preview" className="preview-img" />
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                      document.getElementById('image-upload').value = '';
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="location-picker-section">
            <h3>📍 Trip Location</h3>
            <p className="helper-text">Paste a Google Maps URL to set your trip location:</p>

            {/* URL Input - Simple */}
            <div className="picker-method">
              <div className="url-input-form">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste Google Maps URL here"
                  className="url-input"
                />
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleUrlInput}
                >
                  Add Location
                </button>
              </div>
              <p className="helper-text" style={{ marginTop: '8px', fontSize: '12px' }}>
                💡 How to get URL: Open Google Maps, find your location, and copy the URL from the address bar
              </p>
            </div>
          </div>

          {/* Display Selected Location */}
          {formData.mapsUrl && (
            <div className="coordinates-display card">
              <h4>✅ Location Set</h4>
              <p><strong>Location Name:</strong> {formData.location || 'Trip location'}</p>
              <p className="url-display">
                <strong>Google Maps:</strong>
                <br />
                <a href={formData.mapsUrl} target="_blank" rel="noopener noreferrer" className="maps-url">
                  View on Maps →
                </a>
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '20px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Creating Trip...' : '✅ Create Trip'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTrip;
