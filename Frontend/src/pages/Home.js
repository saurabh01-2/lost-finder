import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  FaSearch,
  FaLaptop,
  FaKey,
  FaWallet,
  FaBook,
  FaShoppingBag,
  FaIdCard,
  FaWineBottle,
  FaBoxOpen,
  FaArrowRight,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCompass,
  FaTimes,
  FaBell
} from "react-icons/fa";
import "../styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const categories = [
    "All", "Watch", "Laptop", "Bag", "Books", "ID Cards",
    "Keys", "Wallet", "Electronics", "Clothes", "Bottle", "Others",
  ];

  const categoryIcons = {
    Watch: "⌚", Laptop: <FaLaptop />, Bag: <FaShoppingBag />,
    Books: <FaBook />, "ID Cards": <FaIdCard />, Keys: <FaKey />,
    Wallet: <FaWallet />, Electronics: "💻", Clothes: "👕",
    Bottle: <FaWineBottle />, Others: <FaBoxOpen />,
  };

  const [recentItems, setRecentItems] = useState([]);

  const [stats, setStats] = useState({
    found: 0,
    lost: 0,
  });

  useEffect(() => {
    setIsLoaded(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHomeData();
    // Trigger the popup shortly after loading
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await api.get("/items");

      if (response.data.success) {
        const items = response.data.items;

        setRecentItems(items.slice(0, 6));

        setStats({
          found: items.filter((item) => item.type === "Found").length,
          lost: items.filter((item) => item.type === "Lost").length,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredItems = recentItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const dashboardStats = [
    {
      title: "Found Items",
      value: stats.found,
      icon: "📦",
    },
    {
      title: "Lost Items",
      value: stats.lost,
      icon: "🔍",
    },
    {
      title: "Welcome",
      value: user ? user.name : "Guest",
      icon: "👋",
    },
  ];

  return (
    <div className="app-canvas">
      {/* --- ANIMATED BACKGROUND ORBS --- */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      {/* --- WELCOME POPUP MODAL --- */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content glass-panel">
            <button className="close-popup" onClick={() => setShowPopup(false)}>
              <FaTimes />
            </button>
            <div className="popup-icon"><FaBell /></div>
            <h2>Welcome to Lost Finder! 🎉</h2>
            <p>Your immersive, fully animated dashboard is ready. Find lost items instantly with smart tracking.</p>
            <button className="popup-btn gradient-btn" onClick={() => setShowPopup(false)}>
              Let's Explore
            </button>
          </div>
        </div>
      )}

      <div className={`home-page ${isLoaded ? "loaded" : ""}`}>

        {/* --- HERO SECTION --- */}
        <section className="dashboard-hero slide-down glass-panel">
          <div className="hero-left">
            <span className="welcome-badge">
              <span className="pulsing-dot"></span>
              {greeting}
            </span>
            <h1>
              {user ? user.name : "Guest"} <span className="wave-emoji">👋</span>
            </h1>
            <p className="hero-subtitle">
              Search and recover lost belongings across your campus in seconds.
            </p>

            <div className="search-bar-container">
              <FaSearch className="search-icon" />
              <input
                className="search-input"
                placeholder="Search items or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="hero-right">
            {dashboardStats.map((stat, index) => (
              <div
                className="stat-card glass-panel"
                key={stat.title}
                style={{ "--delay": `${index * 0.15}s` }}
              >
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-text">
                  <h2>{stat.value}</h2>
                  <p>{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- CATEGORIES SECTION --- */}
        <section className="category-section fade-up">
          <div className="section-header">
            <h2><FaCompass className="header-icon" /> Browse Categories</h2>
          </div>

          <div className="category-pills">
            {categories.map((cat, index) => (
              <button
                key={cat}
                style={{ "--delay": `${index * 0.05}s` }}
                className={`category-pill glass-panel ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span className="category-icon">
                  {cat === "All" ? "✨" : categoryIcons[cat]}
                </span>
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* --- RECENT ITEMS SECTION --- */}
        <section className="recent-items-section">
          <div className="section-header fade-up">
            <h2><span className="neon-text">Recent Items</span></h2>
            <span className="results-count glass-panel">{filteredItems.length} Results</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-message glass-panel fade-up">
              <div className="empty-icon">🔍</div>
              <h3>No items found</h3>
              <p>We couldn't find anything matching your search criteria.</p>
              <button className="gradient-btn" onClick={() => {
                setSearchQuery(""); setActiveCategory("All");
              }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {filteredItems.map((item, index) => (
                <div
                  className="item-card glass-panel fade-up-stagger"
                  key={item._id}
                  style={{ "--delay": `${index * 0.1}s` }}
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
                    <span className={`badge glass-badge ${item.type === 'Lost' ? 'lost-badge' : 'found-badge'}`}>{item.type}</span>
                  </div>

                  <div className="card-body">
                    <span className="category-label">{item.category}</span>
                    <h3>{item.title}</h3>

                    <div className="card-info">
                      <p><span className="info-icon-box"><FaMapMarkerAlt /></span> {item.location}</p>
                      <p><span className="info-icon-box"><FaCalendarAlt /></span> {new Date(item.date).toLocaleDateString()}</p>
                    </div>

                    <Link to={`/item/${item._id}`} className="details-btn gradient-btn">
                      <span>View Details</span>
                      <FaArrowRight className="btn-arrow" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;