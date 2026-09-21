import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaTags, 
  FaAlignLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaUserAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaHandHoldingHeart,
  FaClock,
  FaExclamationTriangle,
  FaCamera
} from "react-icons/fa";
import "../styles/ItemDetails.css";
import api from "../services/api";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Claim modal for Found Items
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProofMessage, setClaimProofMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchItem();
    fetchItemClaims();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}`);
      if (response.data.success) {
        setItem(response.data.item);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemClaims = async () => {
    try {
      const res = await api.get(`/reports/item/${id}`);
      if (res.data.success) {
        setClaims(res.data.claims);
      }
    } catch (error) {
      // Non-critical if user doesn't have permissions
    }
  };

  // Find active pending claim or confirmed claim
  const activePendingClaim = claims.find((c) => c.status === "Pending");
  const confirmedClaim = claims.find((c) => c.status === "Confirmed" || c.status === "Approved");

  const isOwner =
    currentUser &&
    item &&
    (item.user?._id === currentUser._id || item.user === currentUser._id);

  // Owner Confirms and Claims their item
  const handleOwnerConfirmClaim = async (claimId) => {
    const confirmAction = window.confirm(
      "Confirm that this is your item and you have verified the founder's details?"
    );
    if (!confirmAction) return;

    try {
      setIsSubmitting(true);
      const res = await api.put(`/reports/confirm/${claimId}`);
      if (res.data.success) {
        alert("🎉 Congratulations! Item marked as Found and claimed successfully!");
        fetchItem();
        fetchItemClaims();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to confirm claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Owner Rejects false found report
  const handleOwnerRejectClaim = async (claimId) => {
    const confirmAction = window.confirm(
      "Are you sure this is NOT your item? The item status will revert back to 'Lost'."
    );
    if (!confirmAction) return;

    try {
      setIsSubmitting(true);
      const res = await api.put(`/reports/reject/${claimId}`);
      if (res.data.success) {
        alert("Report rejected. Item status reverted back to Lost.");
        fetchItem();
        fetchItemClaims();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit General Claim for a Found Item
  const handleGeneralClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimProofMessage.trim()) {
      alert("Please provide proof or details describing why this is your item.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/reports/claim/${item._id}`, {
        message: claimProofMessage,
      });

      if (res.data.success) {
        alert("Claim submitted successfully! The person who found it has been notified.");
        setShowClaimModal(false);
        setClaimProofMessage("");
        fetchItemClaims();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Claim submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="details-canvas center-content">
        <div className="loader-ring"></div>
        <h2 className="loading-text">Loading item data...</h2>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="details-canvas center-content">
        <h2 style={{ color: "white" }}>Item not found in the database.</h2>
        <Link to="/" className="back-btn neon-outline-btn mt-4">Return Home</Link>
      </div>
    );
  }

  const isStatusLost = item.status === "Lost";
  const isStatusPending = item.status === "Pending";
  const isStatusFound = item.status === "Found" || item.status === "Claimed";

  const themeClass = isStatusFound
    ? "theme-found"
    : isStatusPending
    ? "theme-pending"
    : "theme-lost";

  return (
    <div className="details-canvas">
      {/* Animated Background Orbs */}
      <div className="details-orb orb-1"></div>
      <div className="details-orb orb-2"></div>

      <div className="details-wrapper fade-up">
        
        {/* Navigation */}
        <button className="back-btn glass-panel" onClick={() => navigate(-1)}>
          <FaArrowLeft /> <span>Back</span>
        </button>

        {/* Main Details Glass Card */}
        <div className={`details-card glass-panel ${themeClass}`} style={{ "--delay": "0.1s" }}>
          
          <div className="details-grid">
            {/* LEFT: Image Section */}
            <div className="details-image-container">
              <img
                src={
                  item.image
                    ? `http://localhost:5000/uploads/${item.image}`
                    : "/no-image.png"
                }
                alt={item.title}
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
              <div className="status-badge-absolute glass-panel">
                <span className="status-text">{item.status}</span>
              </div>
            </div>

            {/* RIGHT: Info Section */}
            <div className="details-info-container">
              
              <div className="info-header">
                <div className="badge-row">
                  <span className="category-tag"><FaTags /> {item.category}</span>
                  <span className={`type-tag tag-${item.type.toLowerCase()}`}>
                    Type: {item.type}
                  </span>
                  <span className={`status-tag-pill status-${(item.status || "lost").toLowerCase()}`}>
                    Status: {item.status}
                  </span>
                </div>
                <h1>{item.title}</h1>
              </div>

              <div className="info-body">
                <div className="info-row">
                  <div className="icon-box"><FaMapMarkerAlt /></div>
                  <div>
                    <h4>Location</h4>
                    <p>{item.location}</p>
                  </div>
                </div>

                <div className="info-row">
                  <div className="icon-box"><FaCalendarAlt /></div>
                  <div>
                    <h4>Date</h4>
                    <p>
                      {new Date(item.date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="info-row description-row">
                  <div className="icon-box"><FaAlignLeft /></div>
                  <div>
                    <h4>Description</h4>
                    <p>{item.description || "No specific details provided."}</p>
                  </div>
                </div>
              </div>

              <hr className="glass-divider" />

              {/* Poster Contact Info */}
              <div className="contact-info">
                <h3>{item.type === "Lost" ? "Original Poster (Owner)" : "Reported By"}</h3>
                <div className="contact-grid">
                  <p><FaUserAlt className="contact-icon" /> {item.user?.name || "Campus Member"}</p>
                  <p><FaPhoneAlt className="contact-icon" /> {item.contact || "N/A"}</p>
                  <p><FaEnvelope className="contact-icon" /> {item.user?.email || "N/A"}</p>
                </div>
              </div>

              {/* ======================================================= */}
              {/* FOUNDER DETAILS & OWNER CONFIRMATION SECTION            */}
              {/* ======================================================= */}
              {isOwner && activePendingClaim && (
                <div className="founder-card glass-panel fade-up">
                  <div className="founder-card-header">
                    <FaHandHoldingHeart className="founder-icon pulse" />
                    <div>
                      <h3>Someone Reported Finding Your Item!</h3>
                      <p>Review the founder's details below to verify and claim your belonging.</p>
                    </div>
                  </div>

                  <div className="founder-details-grid">
                    <div className="founder-item">
                      <span className="label">Founder Name:</span>
                      <span className="val">{activePendingClaim.founderName || activePendingClaim.user?.name}</span>
                    </div>
                    <div className="founder-item">
                      <span className="label">Founder Contact:</span>
                      <span className="val highlight-phone">
                        <FaPhoneAlt className="mini-icon" /> {activePendingClaim.founderContact || activePendingClaim.user?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="founder-item">
                      <span className="label">Founder Email:</span>
                      <span className="val">{activePendingClaim.user?.email || "N/A"}</span>
                    </div>
                    <div className="founder-item">
                      <span className="label">Found Location:</span>
                      <span className="val">{activePendingClaim.founderLocation || "Campus"}</span>
                    </div>
                    <div className="founder-item full-width">
                      <span className="label">Founder's Message / Notes:</span>
                      <p className="founder-note">{activePendingClaim.message}</p>
                    </div>

                    {activePendingClaim.proofImage && (
                      <div className="founder-item full-width">
                        <span className="label"><FaCamera /> Founder's Photo of Item:</span>
                        <div className="founder-photo-box">
                          <img 
                            src={`http://localhost:5000/uploads/${activePendingClaim.proofImage}`} 
                            alt="Found Item Proof"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Owner Action Buttons */}
                  <div className="founder-actions">
                    <button 
                      className="confirm-claim-btn gradient-btn-green"
                      onClick={() => handleOwnerConfirmClaim(activePendingClaim._id)}
                      disabled={isSubmitting}
                    >
                      <FaCheckCircle />
                      <span>{isSubmitting ? "Confirming..." : "Confirm & Claim My Item"}</span>
                    </button>

                    <button 
                      className="reject-claim-btn"
                      onClick={() => handleOwnerRejectClaim(activePendingClaim._id)}
                      disabled={isSubmitting}
                    >
                      <FaTimesCircle />
                      <span>Not My Item</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Resolved / Found State Banner */}
              {isStatusFound && (
                <div className="found-celebration-banner glass-panel">
                  <FaCheckCircle className="celebration-icon" />
                  <div>
                    <h4>Item Successfully Recovered!</h4>
                    <p>
                      This item has been confirmed as claimed and returned to its rightful owner.
                      {confirmedClaim && ` Verified on ${new Date(confirmedClaim.confirmedAt || confirmedClaim.updatedAt).toLocaleDateString()}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* ACTION SECTION FOR VISITORS (Not owner)                 */}
              {/* ======================================================= */}
              <div className="action-section">
                {!isOwner && item.type === "Lost" && isStatusLost && (
                  <Link 
                    to={`/report-found?lostItemId=${item._id}`}
                    className="claim-trigger-btn gradient-btn-dynamic"
                  >
                    <FaHandHoldingHeart className="btn-icon" />
                    <span>I Found This Item!</span>
                  </Link>
                )}

                {!isOwner && item.type === "Lost" && isStatusPending && (
                  <div className="pending-notice glass-panel">
                    <FaClock className="notice-icon" />
                    <span>A founder has reported finding this item. Verification is pending with the owner.</span>
                  </div>
                )}

                {!isOwner && item.type === "Found" && !isStatusFound && (
                  <button 
                    className="claim-trigger-btn gradient-btn-dynamic"
                    onClick={() => setShowClaimModal(true)}
                  >
                    <FaCheckCircle className="btn-icon" />
                    <span>Claim This Found Item</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal: Claiming a Found Item */}
      {showClaimModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="close-modal" onClick={() => setShowClaimModal(false)}>&times;</button>
            
            <div className="modal-icon">
              <FaCheckCircle style={{ color: "var(--neon-cyan)" }} />
            </div>
            
            <h2>Claim {item.title}</h2>
            <p>Please provide proof or description of ownership so the founder or admin can verify you.</p>

            <form onSubmit={handleGeneralClaimSubmit}>
              <div className="modal-input-box">
                <textarea
                  rows="4"
                  placeholder="e.g. Unique markings, serial numbers, wallpaper on phone, contents inside..."
                  value={claimProofMessage}
                  onChange={(e) => setClaimProofMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowClaimModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="confirm-btn gradient-btn-green" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ItemDetails;