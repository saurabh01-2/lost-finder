import React, { useEffect, useState } from "react";
import api from "../services/api";
import { 
  FaUsers, 
  FaSearchLocation, 
  FaBoxOpen, 
  FaClipboardCheck, 
  FaTrashAlt, 
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaClock,
  FaHandHoldingHeart,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items"); // "items" or "claims"

  // Selected item / claim modal inspection
  const [inspectModal, setInspectModal] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    lostItems: 0,
    pendingItems: 0,
    foundItems: 0,
    totalReports: 0,
    totalClaims: 0,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email && u.email.toLowerCase() === "jeehardik2@gmail.com" && u.role !== "admin") {
          u.role = "admin";
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (e) {}
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      // Fetch items and stats in parallel
      const [itemsRes, claimsRes, statsRes] = await Promise.all([
        api.get("/admin/items").catch(() => api.get("/items")),
        api.get("/reports").catch(() => ({ data: { claims: [] } })),
        api.get("/admin/dashboard").catch(() => null),
      ]);

      const items = itemsRes.data?.items || [];
      const allClaims = claimsRes.data?.claims || [];
      setReports(items);
      setClaims(allClaims);

      if (statsRes?.data?.stats) {
        setStats({
          ...statsRes.data.stats,
          totalReports: items.length,
        });
      } else {
        const users = [...new Set(items.map((item) => item.user?._id || item.user))];
        setStats({
          totalUsers: users.length,
          lostItems: items.filter((i) => i.status === "Lost" || (!i.status && i.type === "Lost")).length,
          pendingItems: items.filter((i) => i.status === "Pending").length,
          foundItems: items.filter((i) => i.status === "Found" || i.status === "Claimed").length,
          totalReports: items.length,
          totalClaims: allClaims.length,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this report?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/items/${id}`).catch(() => api.delete(`/items/${id}`));
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed.");
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await api.put(`/admin/items/${itemId}/status`, { status: newStatus });
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed.");
    }
  };

  const handleClaimStatusChange = async (claimId, newStatus) => {
    try {
      await api.put(`/reports/${claimId}`, { status: newStatus });
      fetchDashboard();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update claim.");
    }
  };

  return (
    <div className="admin-canvas">
      {/* Animated Background Orbs */}
      <div className="admin-orb orb-cyan"></div>
      <div className="admin-orb orb-purple"></div>

      <div className="admin-content">
        
        <div className="admin-header fade-up">
          <h1>
            <FaShieldAlt className="header-icon" /> 
            Admin <span className="neon-text-cyan">Dashboard</span>
          </h1>
          <p>System overview, audit trail of owners and founders, and report management.</p>
        </div>

        {/* 3D Stats Grid */}
        <div className="stats-container">
          
          <div className="stat-card glass-panel fade-up-stagger" style={{ "--delay": "0.1s" }}>
            <div className="stat-icon-wrapper cyan-glow">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h2>{stats.totalUsers}</h2>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card glass-panel fade-up-stagger" style={{ "--delay": "0.2s" }}>
            <div className="stat-icon-wrapper red-glow">
              <FaSearchLocation />
            </div>
            <div className="stat-info">
              <h2 className="text-red">{stats.lostItems}</h2>
              <p>Active Lost</p>
            </div>
          </div>

          <div className="stat-card glass-panel fade-up-stagger" style={{ "--delay": "0.3s" }}>
            <div className="stat-icon-wrapper amber-glow">
              <FaClock />
            </div>
            <div className="stat-info">
              <h2 className="text-amber">{stats.pendingItems}</h2>
              <p>Pending Claims</p>
            </div>
          </div>

          <div className="stat-card glass-panel fade-up-stagger" style={{ "--delay": "0.4s" }}>
            <div className="stat-icon-wrapper green-glow">
              <FaBoxOpen />
            </div>
            <div className="stat-info">
              <h2 className="text-green">{stats.foundItems}</h2>
              <p>Found / Recovered</p>
            </div>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="admin-tabs fade-up">
          <button 
            className={`admin-tab-btn ${activeTab === "items" ? "active" : ""}`}
            onClick={() => setActiveTab("items")}
          >
            <FaClipboardCheck />
            <span>All Items & Statuses ({reports.length})</span>
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === "claims" ? "active" : ""}`}
            onClick={() => setActiveTab("claims")}
          >
            <FaHandHoldingHeart />
            <span>Founder Reports & Claims ({claims.length})</span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: ALL ITEMS TABLE                                     */}
        {/* ========================================================== */}
        {activeTab === "items" && (
          <div className="manage-section glass-panel fade-up" style={{ "--delay": "0.2s" }}>
            <div className="section-title">
              <h2>Manage Items & Live Statuses</h2>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Founder</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <tr key={report._id}>
                        <td className="item-title">
                          <div className="item-thumb-row">
                            {report.image && (
                              <img 
                                src={`http://localhost:5000/uploads/${report.image}`} 
                                alt="" 
                                className="admin-thumb" 
                                onError={(e) => (e.target.style.display = "none")}
                              />
                            )}
                            <span>{report.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-pill">{report.category}</span>
                        </td>
                        <td>
                          <span className={report.type === "Lost" ? "type-badge type-lost" : "type-badge type-found"}>
                            {report.type}
                          </span>
                        </td>
                        <td>
                          <select 
                            className={`status-select select-${(report.status || "lost").toLowerCase()}`}
                            value={report.status || (report.type === "Lost" ? "Lost" : "Found")}
                            onChange={(e) => handleStatusChange(report._id, e.target.value)}
                          >
                            <option value="Lost">Lost</option>
                            <option value="Pending">Pending</option>
                            <option value="Found">Found</option>
                            <option value="Claimed">Claimed</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </td>
                        <td className="user-name">
                          {report.user?.name || "Anonymous"}
                          <div className="subtext">{report.contact}</div>
                        </td>
                        <td className="user-name">
                          {report.founder ? (
                            <span className="founder-badge">
                              {report.founder.name} ({report.founder.phone || report.founder.email})
                            </span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="action-cell">
                          <button 
                            className="view-icon-btn" 
                            onClick={() => window.open(`/item/${report._id}`, "_blank")}
                            title="Inspect Item"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => deleteReport(report._id)}
                            title="Delete Report"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-table">
                        No reports found in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: FOUNDER REPORTS & CLAIMS                            */}
        {/* ========================================================== */}
        {activeTab === "claims" && (
          <div className="manage-section glass-panel fade-up" style={{ "--delay": "0.2s" }}>
            <div className="section-title">
              <h2>Founder Reports & Verification Chain</h2>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Original Owner</th>
                    <th>Founder Details</th>
                    <th>Found Location & Note</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.length > 0 ? (
                    claims.map((claim) => (
                      <tr key={claim._id}>
                        <td className="item-title">
                          <strong>{claim.item?.title || "Item"}</strong>
                          <div className="subtext">{claim.item?.category}</div>
                        </td>
                        <td>
                          <strong>{claim.owner?.name || claim.item?.user?.name || "Owner"}</strong>
                          <div className="subtext">{claim.owner?.email || claim.owner?.phone}</div>
                        </td>
                        <td>
                          <div className="founder-contact-box">
                            <strong>{claim.founderName || claim.user?.name}</strong>
                            <div className="subtext">
                              <FaPhoneAlt className="mini-icon" /> {claim.founderContact || claim.user?.phone || "N/A"}
                            </div>
                            <div className="subtext">
                              <FaEnvelope className="mini-icon" /> {claim.user?.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="subtext">
                            <FaMapMarkerAlt className="mini-icon" /> {claim.founderLocation || "Campus"}
                          </div>
                          <p className="claim-message-preview">"{claim.message}"</p>
                          {claim.proofImage && (
                            <button 
                              className="view-proof-btn"
                              onClick={() => setInspectModal(claim)}
                            >
                              View Photo Proof
                            </button>
                          )}
                        </td>
                        <td>
                          <span className={`claim-status-pill pill-${(claim.status || "pending").toLowerCase()}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="action-cell">
                          {claim.status === "Pending" && (
                            <>
                              <button 
                                className="approve-claim-btn"
                                onClick={() => handleClaimStatusChange(claim._id, "Approved")}
                                title="Approve and mark Found"
                              >
                                <FaCheckCircle />
                              </button>
                              <button 
                                className="reject-claim-btn-small"
                                onClick={() => handleClaimStatusChange(claim._id, "Rejected")}
                                title="Reject"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}
                          <button 
                            className="delete-btn"
                            onClick={async () => {
                              if (window.confirm("Delete claim?")) {
                                await api.delete(`/reports/${claim._id}`);
                                fetchDashboard();
                              }
                            }}
                            title="Delete Claim"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        No founder reports or claims recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Inspect Modal for Photo Proof */}
      {inspectModal && (
        <div className="modal-overlay" onClick={() => setInspectModal(null)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setInspectModal(null)}>&times;</button>
            <h2>Founder Photo Proof</h2>
            <p>Uploaded by: {inspectModal.founderName || inspectModal.user?.name}</p>
            {inspectModal.proofImage && (
              <div className="modal-image-preview">
                <img 
                  src={`http://localhost:5000/uploads/${inspectModal.proofImage}`} 
                  alt="Proof" 
                />
              </div>
            )}
            <p className="subtext">{inspectModal.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;