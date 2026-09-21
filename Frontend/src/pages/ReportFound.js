import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { 
  FaBoxOpen, 
  FaTags, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaAlignLeft, 
  FaCamera, 
  FaPaperPlane,
  FaHandHoldingHeart,
  FaLink,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import "../styles/ReportFound.css";

function ReportFound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryLostItemId = searchParams.get("lostItemId");

  // Mode: "linked" (reporting match for a lost item) or "general" (unlisted found item)
  const [mode, setMode] = useState(queryLostItemId ? "linked" : "general");
  const [lostItemsList, setLostItemsList] = useState([]);
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  // Form Data for Linked Found Report
  const [linkedForm, setLinkedForm] = useState({
    founderContact: "",
    founderLocation: "",
    dateFound: new Date().toISOString().split("T")[0],
    message: "",
    proofImage: null,
  });

  // Form Data for General Found Item
  const [generalForm, setGeneralForm] = useState({
    title: "",
    category: "Bag",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    contact: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  // Fetch active lost items
  useEffect(() => {
    fetchActiveLostItems();
  }, []);

  const fetchActiveLostItems = async () => {
    try {
      setLoadingItems(true);
      const res = await api.get("/items?type=Lost");
      if (res.data.success) {
        // Show items that are Lost or Pending
        const activeList = res.data.items.filter((i) => i.status === "Lost" || i.status === "Pending");
        setLostItemsList(activeList);

        if (queryLostItemId) {
          const found = activeList.find((i) => i._id === queryLostItemId);
          if (found) {
            setSelectedLostItem(found);
            setMode("linked");
          } else {
            // Fetch directly if not in filtered list
            fetchSingleItem(queryLostItemId);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchSingleItem = async (id) => {
    try {
      const res = await api.get(`/items/${id}`);
      if (res.data.success) {
        setSelectedLostItem(res.data.item);
        setMode("linked");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Pre-fill user contact from profile
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.phone) {
          setLinkedForm((prev) => ({ ...prev, founderContact: u.phone }));
          setGeneralForm((prev) => ({ ...prev, contact: u.phone }));
        }
      } catch (e) {}
    }
  }, []);

  const handleLostItemSelect = (e) => {
    const itemId = e.target.value;
    if (!itemId) {
      setSelectedLostItem(null);
      return;
    }
    const item = lostItemsList.find((i) => i._id === itemId);
    setSelectedLostItem(item || null);
  };

  // Handle Linked Submit (Founder reporting they found someone's lost item)
  const handleLinkedSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLostItem) {
      alert("Please select the lost item you found.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("founderContact", linkedForm.founderContact);
      data.append("founderLocation", linkedForm.founderLocation);
      data.append("dateFound", linkedForm.dateFound);
      data.append("message", linkedForm.message);

      if (linkedForm.proofImage) {
        data.append("proofImage", linkedForm.proofImage);
      }

      const response = await api.post(`/reports/found-match/${selectedLostItem._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("🎉 Found report submitted successfully! The owner has been notified and can now review your details and confirm.");
        navigate("/lost-items");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit found report.");
    } finally {
      setLoading(false);
    }
  };

  // Handle General Found Item Submit
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", generalForm.title);
      data.append("description", generalForm.description);
      data.append("category", generalForm.category);
      data.append("type", "Found");
      data.append("location", generalForm.location);
      data.append("date", generalForm.date);
      data.append("contact", generalForm.contact);

      if (generalForm.image) {
        data.append("image", generalForm.image);
      }

      const response = await api.post("/items", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("Found item report posted successfully!");
        navigate("/found-items");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-found-canvas">
      {/* Animated Background Orbs */}
      <div className="report-orb orb-green"></div>
      <div className="report-orb orb-cyan"></div>

      <div className="report-card glass-panel fade-up">
        
        <div className="report-header">
          <h1>
            Report <span className="neon-text-green">Found Item</span>
          </h1>
          <p>
            You found something! <FaHandHoldingHeart className="heart-icon"/> Fill out the details below so the owner receives a notification and can claim it.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="report-mode-toggle">
          <button 
            type="button" 
            className={`mode-btn ${mode === "linked" ? "active" : ""}`}
            onClick={() => setMode("linked")}
          >
            <FaLink className="mode-icon" />
            <span>I Found a Reported Lost Item</span>
          </button>
          <button 
            type="button" 
            className={`mode-btn ${mode === "general" ? "active" : ""}`}
            onClick={() => {
              setMode("general");
              setSelectedLostItem(null);
            }}
          >
            <FaBoxOpen className="mode-icon" />
            <span>Report Other Found Item</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* MODE 1: LINKED TO A REPORTED LOST ITEM                   */}
        {/* ======================================================== */}
        {mode === "linked" && (
          <form onSubmit={handleLinkedSubmit} className="report-form">
            
            {/* Step 1: Select Lost Item */}
            <div className="input-group">
              <label>Select The Lost Item You Found</label>
              <div className="input-wrapper">
                <FaBoxOpen className="input-icon" />
                <select 
                  value={selectedLostItem?._id || ""} 
                  onChange={handleLostItemSelect}
                  required
                >
                  <option value="">-- Choose matching lost item --</option>
                  {lostItemsList.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title} ({item.category}) - Lost at: {item.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Preview Card if selected */}
            {selectedLostItem && (
              <div className="linked-item-preview glass-panel fade-up">
                <div className="preview-img-box">
                  <img 
                    src={selectedLostItem.image ? `http://localhost:5000/uploads/${selectedLostItem.image}` : "/no-image.png"} 
                    alt={selectedLostItem.title} 
                    onError={(e) => (e.target.src = "/no-image.png")}
                  />
                </div>
                <div className="preview-info">
                  <div className="preview-tag-row">
                    <span className="category-pill">{selectedLostItem.category}</span>
                    <span className="owner-tag">Owner: {selectedLostItem.user?.name || "Campus Member"}</span>
                  </div>
                  <h3>{selectedLostItem.title}</h3>
                  <p className="preview-desc">{selectedLostItem.description}</p>
                  <p className="preview-loc">
                    <FaMapMarkerAlt className="mini-icon" /> Last seen: {selectedLostItem.location}
                  </p>
                </div>
              </div>
            )}

            <div className="founder-section-divider">
              <span>Your Founder Details (Owner will see these to verify & claim)</span>
            </div>

            {/* Where you found it */}
            <div className="input-group">
              <label>Where Did You Find It? (Current Handover Location)</label>
              <div className="input-wrapper">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Science Block 2nd Floor, or Handed to Library Reception"
                  value={linkedForm.founderLocation}
                  onChange={(e) => setLinkedForm({ ...linkedForm, founderLocation: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Grid: Contact & Date Found */}
            <div className="form-row">
              <div className="input-group">
                <label>Your Contact Phone Number</label>
                <div className="input-wrapper">
                  <FaPhoneAlt className="input-icon" />
                  <input
                    type="tel"
                    placeholder="e.g. +1 555-0199"
                    value={linkedForm.founderContact}
                    onChange={(e) => setLinkedForm({ ...linkedForm, founderContact: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Date Found</label>
                <div className="input-wrapper">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    value={linkedForm.dateFound}
                    onChange={(e) => setLinkedForm({ ...linkedForm, dateFound: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Message / Instructions for owner */}
            <div className="input-group">
              <label>Founder Message / Handover Notes for Owner</label>
              <div className="input-wrapper textarea-wrapper">
                <FaAlignLeft className="input-icon textarea-icon" />
                <textarea
                  placeholder="Describe where the owner can collect it, or any details about its condition..."
                  rows="3"
                  value={linkedForm.message}
                  onChange={(e) => setLinkedForm({ ...linkedForm, message: e.target.value })}
                  required
                ></textarea>
              </div>
            </div>

            {/* Proof image */}
            <div className="input-group">
              <label>Photo of Found Item (Optional proof for owner)</label>
              <div className="input-wrapper file-wrapper">
                <FaCamera className="input-icon" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLinkedForm({ ...linkedForm, proofImage: e.target.files[0] })}
                  className="file-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn gradient-btn-green" 
              disabled={loading || !selectedLostItem}
            >
              {loading ? (
                <span className="loading-text">Broadcasting to Owner...</span>
              ) : (
                <>
                  <span>Notify Owner & Submit Report</span>
                  <FaPaperPlane className="btn-icon" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* MODE 2: GENERAL FOUND REPORT (Unlisted item)             */}
        {/* ======================================================== */}
        {mode === "general" && (
          <form onSubmit={handleGeneralSubmit} className="report-form">
            
            <div className="input-group">
              <label>Item Name</label>
              <div className="input-wrapper">
                <FaBoxOpen className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Black Leather Wallet"
                  value={generalForm.title}
                  onChange={(e) => setGeneralForm({ ...generalForm, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Category</label>
                <div className="input-wrapper">
                  <FaTags className="input-icon" />
                  <select 
                    value={generalForm.category} 
                    onChange={(e) => setGeneralForm({ ...generalForm, category: e.target.value })}
                    required
                  >
                    <option value="Bag">Bag</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Wallet">Wallet</option>
                    <option value="Keys">Keys</option>
                    <option value="ID Card">ID Card</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Date Found</label>
                <div className="input-wrapper">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    value={generalForm.date}
                    onChange={(e) => setGeneralForm({ ...generalForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Found Location</label>
                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. College Canteen near window"
                    value={generalForm.location}
                    onChange={(e) => setGeneralForm({ ...generalForm, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Founder Contact Number</label>
                <div className="input-wrapper">
                  <FaPhoneAlt className="input-icon" />
                  <input
                    type="tel"
                    placeholder="Enter contact number"
                    value={generalForm.contact}
                    onChange={(e) => setGeneralForm({ ...generalForm, contact: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Item Description & Notes</label>
              <div className="input-wrapper textarea-wrapper">
                <FaAlignLeft className="input-icon textarea-icon" />
                <textarea
                  placeholder="Describe condition, brand, color, or where kept..."
                  rows="3"
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                  required
                ></textarea>
              </div>
            </div>

            <div className="input-group">
              <label>Upload Item Image (Optional)</label>
              <div className="input-wrapper file-wrapper">
                <FaCamera className="input-icon" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGeneralForm({ ...generalForm, image: e.target.files[0] })}
                  className="file-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn gradient-btn-green"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-text">Submitting...</span>
              ) : (
                <>
                  <span>Submit Found Report</span>
                  <FaPaperPlane className="btn-icon" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default ReportFound;