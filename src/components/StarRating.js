import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import './StarRating.css';

function StarRating({ value, onChange, readOnly = false, size = 'medium' }) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value || 0;
  const sizeClass = size === 'large' ? 'star-large' : size === 'small' ? 'star-small' : 'star-medium';

  return (
    <div className="star-rating-container">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <FaStar
            key={star}
            className={`star ${sizeClass} ${star <= displayValue ? 'filled' : 'empty'}`}
            onClick={() => !readOnly && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          />
        ))}
      </div>
      {value > 0 && (
        <span className="star-value">
          {value}/5 {value === 5 ? '🌟' : value >= 4 ? '⭐' : value >= 3 ? '✨' : '👍'}
        </span>
      )}
    </div>
  );
}

export default StarRating;
