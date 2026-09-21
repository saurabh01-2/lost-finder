import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaArrowRight, 
  FaBoxOpen,
  FaSmileBeam
} from "react-icons/fa";
import "../styles/FoundItems.css";

function FoundItems() {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  fetchFoundItems();
}, []);

const fetchFoundItems = async () => {
  try {
    const response = await api.get("/items?type=Found");

    if (response.data.success) {
      setFoundItems(response.data.items);
    }
  } catch (error) {
    console.log(error);
  }
};

  // Upgraded with premium placeholder images

  const [foundItems, setFoundItems] = useState([]);

  const filteredItems = foundItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="found-canvas">
      {/* Animated Background Orbs (Green & Cyan for Success/Found) */}
      <div className="found-orb orb-green"></div>
      <div className="found-orb orb-cyan"></div>

      <div className="found-page-content">
        
        {/* Header Section */}
        <div className="found-header fade-up">
          <h1>
            <FaBoxOpen className="header-icon" /> 
            Recovered <span className="neon-text-green">Found Items</span>
          </h1>
          <p>Browse items that have been safely recovered around campus. See yours? Claim it today!</p>
        </div>

        {/* Glassmorphism Search Bar */}
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
        </div>

        {/* 3D Item Grid */}
        <div className="found-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div 
                className="item-card glass-panel fade-up-stagger" 
                key={item._id}
                style={{ "--delay": `${0.2 + (index * 0.1)}s` }}
              >
                <div className="card-image">
                  <img
                    src={
                      item.image
                        ? `http://localhost:5000/uploads/${item.image}`
                        : "/no-image.png"
                    }
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                  <span className={`badge-found glass-badge ${item.status === 'Claimed' ? 'badge-claimed' : ''}`}>
                    {item.status === "Claimed" ? "Claimed" : "Found"}
                  </span>
                </div>

                <div className="card-body">
                  <span className="category-label">{item.category}</span>
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

                  <Link to={`/item/${item._id}`} className="details-btn gradient-btn-green">
                    <span>{item.status === "Claimed" ? "View Details" : "Claim Item"}</span>
                    <FaArrowRight className="btn-arrow" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-message glass-panel fade-up" style={{ "--delay": "0.2s" }}>
              <FaSmileBeam className="empty-icon" />
              <h3>No matching items found</h3>
              <p>We couldn't find any found items matching "{searchTerm}".</p>
              <button 
                className="gradient-btn-green clear-btn" 
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default FoundItems;