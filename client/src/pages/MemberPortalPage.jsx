import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MemberJobsTab from "../components/MemberPortal/MemberJobsTab";
import MemberForumsTab from "../components/MemberPortal/MemberForumsTab";
import MemberMeetingsTab from "../components/MemberPortal/MemberMeetingsTab";
import MemberProfileTab from "../components/MemberPortal/MemberProfileTab";
import { getCurrentUser, isAuthenticated } from "../utils/auth";
import { apiRequest, apiUrl } from "../api/client";
import { useToast } from "../context/ToastContext";
import "../styles/MemberPortal.css";

const MemberPortalPage = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState("jobs");
  const [activeModal, setActiveModal] = useState(null); // 'callback' | 'chat' | null
  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phone: "",
    topic: "Housing & Shelter Vouchers",
    timeSlot: "Within 15 minutes (Immediate Queue)",
  });
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated()) {
      apiRequest("/api/users/me")
        .then((user) => setCurrentUser(user))
        .catch(() => {});
    }
  }, []);

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl("/api/callbacks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...callbackForm,
          name: callbackForm.name || (currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Member"),
        }),
      });
      if (!response.ok) throw new Error("Your callback request could not be submitted.");
      showToast("Callback request submitted to your navigator!", "success");
      setCallbackSubmitted(true);
      setTimeout(() => {
        setCallbackSubmitted(false);
        setActiveModal(null);
      }, 2500);
    } catch (err) {
      showToast(err.message || "Failed to submit callback request.", "error");
    }
  };

  const openCallbackModal = () => {
    if (currentUser) {
      setCallbackForm((prev) => ({
        ...prev,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        phone: currentUser.phone || "",
      }));
    }
    setActiveModal("callback");
  };

  return (
    <div className="member-portal-wrapper">
      <Navbar />

      <main className="member-portal-container">
        {/* Header Banner */}
        <div className="member-banner-card">
          <div className="banner-left-wrap">
            <div className="member-avatar-box">
              <img
                src={
                  currentUser?.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                }
                alt="Member Avatar"
                className="member-avatar-img"
              />
              <span className="member-status-dot"></span>
            </div>

            <div className="member-banner-info">
              <div className="banner-title-row">
                <h1>
                  Welcome back, {currentUser?.first_name || "Community Member"}!
                </h1>
                <span className="portal-role-badge">Member Portal</span>
              </div>

              <div className="banner-submeta">
                <span className="material-symbols-outlined">location_on</span>
                <span>{currentUser?.location || "Nairobi, Kenya"}</span>
                <span>&bull;</span>
                <span className="material-symbols-outlined">mail</span>
                <span>{currentUser?.email || "member@povertyline.org"}</span>
              </div>

              <div className="case-status-row">
                <span className="active-case-pill">
                  <span className="material-symbols-outlined" style={{ fontSize: "1.05rem" }}>verified</span>
                  Active Case #4892 &bull; Housing & Employment
                </span>
                <span className="navigator-text">
                  Navigator: <strong>Sarah Jenkins, MSW</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="banner-actions-right">
            <button
              className="btn-book-meeting"
              onClick={() => setActiveTab("meetings")}
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Book Meeting
            </button>
            <button
              className="btn-care-chat"
              onClick={() => setActiveModal("chat")}
            >
              <span className="material-symbols-outlined">chat</span>
              24/7 Care Chat
            </button>
            <button
              className="icon-btn-settings"
              onClick={() => setActiveTab("profile")}
              title="Portal Settings & Profile"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="portal-tabs-nav">
          <button
            className={`portal-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            <span className="material-symbols-outlined">work</span>
            Job Opportunities
            <span className="tab-badge-count">New</span>
          </button>
          <button
            className={`portal-tab-btn ${activeTab === "forums" ? "active" : ""}`}
            onClick={() => setActiveTab("forums")}
          >
            <span className="material-symbols-outlined">forum</span>
            Group Forums
            <span className="tab-badge-count">Community</span>
          </button>
          <button
            className={`portal-tab-btn ${activeTab === "meetings" ? "active" : ""}`}
            onClick={() => setActiveTab("meetings")}
          >
            <span className="material-symbols-outlined">event</span>
            Scheduled Meetings
            <span className="tab-badge-count">Upcoming</span>
          </button>
          <button
            className={`portal-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="material-symbols-outlined">account_circle</span>
            My Profile & Case
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === "jobs" && <MemberJobsTab />}
        {activeTab === "forums" && <MemberForumsTab />}
        {activeTab === "meetings" && <MemberMeetingsTab />}
        {activeTab === "profile" && (
          <MemberProfileTab
            user={currentUser}
            onUserUpdated={handleUserUpdated}
            onRequestCallback={openCallbackModal}
          />
        )}
      </main>

      {/* Navigator Callback Request Modal */}
      {activeModal === "callback" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window callback-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">📲</span>
                <h3>Request Navigator Callback</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            <p className="modal-helper-text">
              Request a direct callback from your family navigator (Sarah Jenkins, MSW).
            </p>

            {callbackSubmitted ? (
              <div className="success-banner">
                Callback requested! Sarah will contact you at{" "}
                <strong>{callbackForm.phone}</strong>.
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="callback-form">
                <div className="input-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={callbackForm.name}
                    onChange={(e) =>
                      setCallbackForm({ ...callbackForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={callbackForm.phone}
                    onChange={(e) =>
                      setCallbackForm({ ...callbackForm, phone: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Primary Topic</label>
                  <select
                    value={callbackForm.topic}
                    onChange={(e) =>
                      setCallbackForm({ ...callbackForm, topic: e.target.value })
                    }
                  >
                    <option value="Housing & Shelter Vouchers">
                      Housing & Shelter Vouchers
                    </option>
                    <option value="Emergency Food Support">
                      Emergency Food Support
                    </option>
                    <option value="Employment & Job Readiness">
                      Employment & Job Readiness
                    </option>
                  </select>
                </div>

                <div className="input-group">
                  <label>When Should We Call?</label>
                  <select
                    value={callbackForm.timeSlot}
                    onChange={(e) =>
                      setCallbackForm({ ...callbackForm, timeSlot: e.target.value })
                    }
                  >
                    <option value="Within 15 minutes (Immediate Queue)">
                      Within 15 minutes (Immediate Queue)
                    </option>
                    <option value="Today: Morning (9:00 AM - 12:00 PM)">
                      Today: Morning (9:00 AM - 12:00 PM)
                    </option>
                    <option value="Today: Afternoon (1:00 PM - 5:00 PM)">
                      Today: Afternoon (1:00 PM - 5:00 PM)
                    </option>
                  </select>
                </div>

                <button type="submit" className="btn-confirm-callback">
                  Confirm Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 24/7 Care Chat Modal */}
      {activeModal === "chat" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window chat-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>Member Care Support</h3>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>
            <div className="chat-dialog">
              <div className="chat-bubble">
                👋 Hello {currentUser?.first_name || "Member"}! Welcome to the 24/7 Member Care Chat. How can we support you today?
              </div>
            </div>
            <button className="cancel-btn" onClick={() => setActiveModal(null)}>
              Close Chat
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MemberPortalPage;
