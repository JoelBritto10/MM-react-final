import React, { useState } from 'react';
import { db } from '../firebaseUtils';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

function HostReplySection({ review, hostId, currentUser, onReplyAdded, isHost }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hostReplies, setHostReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Load host replies for this review
  React.useEffect(() => {
    if (review?.id) {
      loadReplies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review?.id]);

  const loadReplies = async () => {
    try {
      setLoadingReplies(true);
      const repliesQuery = query(
        collection(db, 'hostReplies'),
        where('reviewId', '==', review.id)
      );
      const querySnapshot = await getDocs(repliesQuery);
      const replies = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setHostReplies(replies);
    } catch (err) {
      console.error('Error loading host replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      alert('Please write a reply');
      return;
    }

    if (!isHost) {
      alert('Only hosts can reply to reviews');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'hostReplies'), {
        reviewId: review.id,
        hostId: hostId,
        hostName: currentUser?.username || currentUser?.displayName || 'Host',
        hostAvatar: currentUser?.avatar || '',
        text: replyText.trim(),
        timestamp: serverTimestamp()
      });

      // Reset form and reload replies
      setReplyText('');
      setShowReplyForm(false);
      await loadReplies();
      
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="host-reply-section">
      {/* Display Host Replies */}
      {!loadingReplies && hostReplies.length > 0 && (
        <div className="host-replies">
          {hostReplies.map(reply => (
            <div key={reply.id} className="host-reply">
              <div className="reply-header">
                <span className="host-label">🏠 Host Response</span>
                <span className="reply-date">
                  {reply.timestamp ? new Date(reply.timestamp.seconds * 1000).toLocaleDateString() : 'Recently'}
                </span>
              </div>
              <p className="reply-text">{reply.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Host Reply Form */}
      {isHost && (
        <div className="reply-form-container">
          {showReplyForm ? (
            <div className="reply-form">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, 500))}
                placeholder="Write your response to this review..."
                maxLength="500"
                rows="3"
                className="reply-textarea"
              />
              <div className="reply-char-count">{replyText.length}/500</div>
              <div className="reply-actions">
                <button
                  className="btn-reply-submit"
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || submitting}
                >
                  {submitting ? '⏳ Posting...' : '✉️ Post Reply'}
                </button>
                <button
                  className="btn-reply-cancel"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-reply-link"
              onClick={() => setShowReplyForm(true)}
            >
              💬 Reply to Review
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default HostReplySection;
