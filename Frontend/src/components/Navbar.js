import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; 
import { 
  FaHome, 
  FaSearch, 
  FaBoxOpen, 
  FaPlusCircle, 
  FaUserAlt, 
  FaUserShield, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaMapMarkedAlt,
  FaBell,
  FaCheckDouble,
  FaExternalLinkAlt
} from "react-icons/fa";
import api from "../services/api";
import "../styles/Navbar.css"; 

function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const token = localStorage.getItem("token");

  // Detect scroll to trigger glassmorphism background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      // Ignore silent errors if not logged in or backend booting
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [token]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {
      console.error(e);
    }

    setShowNotifs(false);
    if (notif.item) {
      const itemId = notif.item._id || notif.item;
      navigate(`/item/${itemId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        
        {/* Animated Neon Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          Lost<span className="neon-text">Finder</span>
        </Link>

        {token && (
          <>
            {/* Mobile Menu Toggle */}
            <button 
              className={`menu-btn ${isMobileMenuOpen ? "open" : ""}`} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Navigation Links */}
            <div className={`nav-links-container ${isMobileMenuOpen ? "active" : ""}`}>
              <div className="nav-links">
                <NavLink to="/" onClick={closeMenu} end>
                  <FaHome className="nav-icon" /> <span>Home</span>
                </NavLink>
                <NavLink to="/lost-items" onClick={closeMenu}>
                  <FaSearch className="nav-icon" /> <span>Lost Items</span>
                </NavLink>
                <NavLink to="/found-items" onClick={closeMenu}>
                  <FaBoxOpen className="nav-icon" /> <span>Found Items</span>
                </NavLink>
                <NavLink to="/report-lost" onClick={closeMenu}>
                  <FaMapMarkedAlt className="nav-icon" /> <span>Report Lost</span>
                </NavLink>
                <NavLink to="/report-found" onClick={closeMenu}>
                  <FaPlusCircle className="nav-icon" /> <span>Report Found</span>
                </NavLink>
                <NavLink to="/my-reports" onClick={closeMenu}>
                  <FaBoxOpen className="nav-icon" /> <span>My Reports</span>
                </NavLink>
                <NavLink to="/profile" onClick={closeMenu}>
                  <FaUserAlt className="nav-icon" /> <span>Profile</span>
                </NavLink>
                <NavLink to="/admin-dashboard" onClick={closeMenu}>
                  <FaUserShield className="nav-icon" /> <span>Admin</span>
                </NavLink>
              </div>

              {/* Notification Bell & Dropdown */}
              <div className="notif-wrapper" ref={notifRef}>
                <button 
                  className="notif-btn" 
                  onClick={() => setShowNotifs(!showNotifs)}
                  title="Notifications"
                >
                  <FaBell className="notif-icon" />
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifs && (
                  <div className="notif-dropdown glass-panel fade-up">
                    <div className="notif-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={handleMarkAllRead}>
                          <FaCheckDouble /> Mark read
                        </button>
                      )}
                    </div>

                    <div className="notif-list">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`notif-item ${!n.isRead ? "unread" : ""}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className="notif-item-header">
                              <span className="notif-title">{n.title}</span>
                              <span className="notif-time">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="notif-message">{n.message}</p>
                            <div className="notif-action-hint">
                              <span>Click to inspect founder details & claim</span>
                              <FaExternalLinkAlt className="action-hint-icon" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="notif-empty">
                          <p>No notifications right now.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="auth-buttons">
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt className="logout-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;