import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaClipboardList, 
  FaTrashAlt, 
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSpinner,
  FaFolderOpen,
  FaEdit
} from "react-icons/fa";
import "../styles/MyReports.css";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/items/my-items");
      if (response.data.success) {
        setReports(response.data.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerDelete = (id) => {
    setReportToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await api.delete(`/items/${reportToDelete}`);

      if (response.data.success) {
        setShowDeleteModal(false);
        setReportToDelete(null);
        fetchReports(); // Refresh reports from database
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="reports-canvas">
      {/* Animated Background Orbs */}
      <div className="reports-orb orb-purple"></div>
      <div className="reports-orb orb-cyan"></div>

      <div className="reports-content">
        
        {/* Header */}
        <div className="reports-header fade-up">
          <h1>
            <FaClipboardList className="header-icon" /> 
            My <span className="neon-text-purple">Reports</span>
          </h1>
          <p>Manage and track the status of the lost and found items you have posted.</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="reports-loading fade-up">
            <FaSpinner className="spinner-icon" />
            <h2>Syncing your reports...</h2>
          </div>
        ) : (
          /* 3D Grid */
          <div className="reports-grid">
            {reports.length > 0 ? (
              reports.map((item, index) => (
                <div 
                  className="item-card glass-panel fade-up-stagger" 
                  key={item._id}
                  style={{ "--delay": `${0.1 + (index * 0.1)}s` }}
                >
                  <div className="card-image">
                    <img 
                      src={item.image ? `http://localhost:5000/uploads/${item.image}` : "/no-image.png"} 
                      alt={item.title} 
                      onError={(e) => e.target.src = "/no-image.png"} 
                    />
                    <span
                      className={`status-badge-top ${
                        item.status === "Lost" 
                          ? "badge-lost" 
                          : item.status === "Pending" 
                          ? "badge-pending-pill" 
                          : "badge-found"
                      }`}
                    >
                      {item.status || item.type}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="category-and-type">
                      <span className="category-label">{item.category}</span>
                      <span className="type-subtag">Type: {item.type}</span>
                    </div>

                    <h3>{item.title}</h3>

                    {/* Pending Founder Notification Banner */}
                    {item.status === "Pending" && (
                      <div 
                        className="pending-founder-banner"
                        onClick={() => navigate(`/item/${item._id}`)}
                      >
                        <span>🔔 Founder reported finding this! Click to review details & claim.</span>
                      </div>
                    )}

                    <div className="card-info">
                      <p>
                        <span className="info-icon-box"><FaMapMarkerAlt /></span> 
                        {item.location}
                      </p>
                      <p>
                        <span className="info-icon-box"><FaCalendarAlt /></span> 
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Fixed Action Buttons Container */}
                    <div className="report-actions">
                      <button
                        className="view-report-btn"
                        onClick={() => navigate(`/item/${item._id}`)}
                      >
                        <span>View Details</span>
                      </button>

                      <button
                        className="edit-report-btn"
                        onClick={() => navigate(`/edit-report/${item._id}`)}
                      >
                        <FaEdit className="btn-icon" />
                        <span>Edit</span>
                      </button>

                      <button
                        className="delete-report-btn"
                        onClick={() => triggerDelete(item._id)}
                      >
                        <FaTrashAlt className="btn-icon" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="empty-message glass-panel fade-up" style={{ "--delay": "0.2s" }}>
                <FaFolderOpen className="empty-icon" />
                <h3>No Reports Found</h3>
                <p>You haven't posted any lost or found items yet.</p>
                <Link to="/report-lost" className="gradient-btn-purple empty-action-btn">
                  Report an Item
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3D Glassmorphism Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel theme-danger">
            <button 
              className="close-modal" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              &times;
            </button>
            
            <div className="modal-icon danger-glow">
              <FaExclamationTriangle />
            </div>
            
            <h2>Delete Report?</h2>
            <p>Are you entirely sure you want to delete this report? This action is permanent and cannot be undone.</p>

            <div className="modal-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn gradient-btn-red" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyReports;