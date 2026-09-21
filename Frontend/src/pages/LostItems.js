import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaArrowRight, 
  FaSearchLocation,
  FaSadTear,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";
import "../styles/LostItems.css";

function LostItems() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLostItems();
  }, []);

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/items?type=Lost");

      if (response.data.success) {
        setLostItems(response.data.items);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = lostItems.filter((item) => {
    // Found items should not show in Lost Items page
    if (item.status === "Found" || item.status === "Claimed" || item.type === "Found") {
      return false;
    }

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === "Pending") {
      return (
        <span className="badge-pending glass-badge">
          <FaClock className="badge-icon" /> Pending Claim
        </span>
      );
    }
    return (
      <span className="badge-lost glass-badge">
        <FaExclamationCircle className="badge-icon" /> Lost
      </span>
    );
  };

  return (
    <div className="lost-canvas">
      {/* Animated Background Orbs */}
      <div className="lost-orb orb-red"></div>
      <div className="lost-orb orb-purple"></div>

      <div className="lost-page-content">
        
        {/* Header Section */}
        <div className="lost-header fade-up">
          <h1>
            <FaSearchLocation className="header-icon" /> 
            Campus <span className="neon-text-red">Lost Items</span>
          </h1>
          <p>
            Browse reported missing items. If you found any of these, click "I Found This Item" to notify the owner!
          </p>
        </div>

        {/* Controls: Search Bar + Status Filter Tabs */}
        <div className="search-container fade-up" style={{ "--delay": "0.1s" }}>
          <div className="search-wrapper glass-panel">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by item name, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                &times;
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="status-filter-pills">
            {["All", "Lost", "Pending"].map((st) => (
              <button
                key={st}
                className={`filter-pill ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "All" ? "All Active Lost" : st === "Pending" ? "Pending Claim" : st}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Item Grid */}
        {loading ? (
          <div className="empty-message glass-panel fade-up">
            <p>Loading items...</p>
          </div>
        ) : (
          <div className="lost-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div 
                  className={`item-card glass-panel fade-up-stagger card-status-${(item.status || "lost").toLowerCase()}`} 
                  key={item._id}
                  style={{ "--delay": `${0.1 + (index * 0.05)}s` }}
                >
                  <div className="card-image">
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
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="card-body">
                    <div className="card-header-row">
                      <span className="category-label">{item.category}</span>
                      <span className={`status-pill pill-${(item.status || "lost").toLowerCase()}`}>
                        {item.status || "Lost"}
                      </span>
                    </div>

                    <h3>{item.title}</h3>

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

                    {item.status === "Lost" ? (
                      <Link 
                        to={`/report-found?lostItemId=${item._id}`} 
                        className="details-btn gradient-btn-red"
                      >
                        <span>I Found This Item</span>
                        <FaArrowRight className="btn-arrow" />
                      </Link>
                    ) : item.status === "Pending" ? (
                      <Link 
                        to={`/item/${item._id}`} 
                        className="details-btn gradient-btn-amber"
                      >
                        <span>Review Claim (Pending)</span>
                        <FaArrowRight className="btn-arrow" />
                      </Link>
                    ) : (
                      <Link 
                        to={`/item/${item._id}`} 
                        className="details-btn gradient-btn-green"
                      >
                        <span>Recovered (View Details)</span>
                        <FaArrowRight className="btn-arrow" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-message glass-panel fade-up" style={{ "--delay": "0.2s" }}>
                <FaSadTear className="empty-icon" />
                <h3>No matching items found</h3>
                <p>We couldn't find any items matching your criteria.</p>
                <button 
                  className="gradient-btn-red clear-btn" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default LostItems;