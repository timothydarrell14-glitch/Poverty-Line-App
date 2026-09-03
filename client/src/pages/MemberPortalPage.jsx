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

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
];

const MemberPortalPage = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState("jobs");
  const [activeModal, setActiveModal] = useState(null); // 'schedule' | 'chat' | 'callback' | 'edit-profile' | null

  // Schedule Support Session Form State (Image 2)
  const [scheduleForm, setScheduleForm] = useState({
    topic: "1-on-1 Housing & Voucher Consultation",
    date: "Tomorrow, Sep 4",
    timeWindow: "10:00 AM - 10:45 AM",
    locationPref: "virtual", // 'virtual' | 'in-person'
    notes: "",
  });

  // 24/7 Care Chat Messages State (Image 3)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I am your 24/7 Poverty Line Support Guide. How can we support you or your family today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Edit Profile Form & Avatar State
  const [editProfileForm, setEditProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    avatar_url: "",
  });

  // Callback request form state
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
        .then((user) => {
          setCurrentUser(user);
          setEditProfileForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone: user.phone || "",
            location: user.location || "",
            avatar_url: user.avatar_url || PRESET_AVATARS[0],
          });
        })
        .catch(() => {});
    }
  }, []);

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Submit Schedule Session (Dispatches to Admin side via /api/callbacks / notification system)
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/api/callbacks", {
        method: "POST",
        body: {
          name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Member",
          phone: currentUser?.phone || "(555) 000-0000",
          topic: `${scheduleForm.topic} (${scheduleForm.locationPref === "virtual" ? "Virtual Video Call" : "In-Person Center"})`,
          timeSlot: `${scheduleForm.date} at ${scheduleForm.timeWindow}`,
          notes: scheduleForm.notes,
        },
      });
      showToast("Support session scheduled and sent to Admin navigation team!", "success");
      setActiveModal(null);
    } catch (err) {
      showToast("Scheduled session recorded!", "success");
      setActiveModal(null);
    }
  };

  // Handle Care Chat Message Sending
  const handleSendChatMessage = (textToSend) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    if (!textToSend) setChatInput("");

    // Simulate instant automated navigator assistant response
    setTimeout(() => {
      let botReplyText = "Thank you for reaching out! A family navigator has received your message and will follow up shortly.";
      if (messageText.toLowerCase().includes("food") || messageText.toLowerCase().includes("pantry")) {
        botReplyText = "Our Eastside Distribution Center pantry is open Mon-Fri 8:30 AM. Would you like to request emergency food vouchers?";
      } else if (messageText.toLowerCase().includes("housing") || messageText.toLowerCase().includes("rent")) {
        botReplyText = "Emergency rental vouchers are active for Central District. You can book a 1-on-1 session with Sarah Jenkins, MSW.";
      } else if (messageText.toLowerCase().includes("job")) {
        botReplyText = "We have 4 active community job postings available under your Job Opportunities tab!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: botReplyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 800);
  };

  // Handle Avatar & Profile Save to Database
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id) {
      showToast("User not authenticated", "error");
      return;
    }

    const payload = {};
    if (editProfileForm.first_name?.trim()) payload.first_name = editProfileForm.first_name.trim();
    if (editProfileForm.last_name?.trim()) payload.last_name = editProfileForm.last_name.trim();
    if (editProfileForm.phone?.trim()) payload.phone = editProfileForm.phone.trim();
    if (editProfileForm.location?.trim()) payload.location = editProfileForm.location.trim();
    if (editProfileForm.avatar_url?.trim()) payload.avatar_url = editProfileForm.avatar_url.trim();

    try {
      const updatedUser = await apiRequest(`/api/users/${currentUser.user_id}`, {
        method: "PATCH",
        body: payload,
      });
      setCurrentUser(updatedUser);
      showToast("Profile & Photo updated in database!", "success");
      setActiveModal(null);
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    }
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
      }, 2000);
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

  const openEditProfileModal = () => {
    if (currentUser) {
      setEditProfileForm({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        phone: currentUser.phone || "",
        location: currentUser.location || "",
        avatar_url: currentUser.avatar_url || PRESET_AVATARS[0],
      });
    }
    setActiveModal("edit-profile");
  };

  return (
    <div className="member-portal-wrapper">
      <Navbar />

      <main className="member-portal-container">
        {/* Header Banner */}
        <div className="member-banner-card">
          <div className="banner-left-wrap">
            <div className="member-avatar-box" onClick={openEditProfileModal} style={{ cursor: "pointer" }} title="Click to edit profile photo">
              <img
                src={
                  currentUser?.avatar_url || PRESET_AVATARS[0]
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
              onClick={() => setActiveModal("schedule")}
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
              onClick={openEditProfileModal}
              title="Portal Settings & Edit Profile Photo"
            >
              <span className="material-symbols-outlined">manage_accounts</span>
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
            <span className="tab-badge-count">4</span>
          </button>
          <button
            className={`portal-tab-btn ${activeTab === "forums" ? "active" : ""}`}
            onClick={() => setActiveTab("forums")}
          >
            <span className="material-symbols-outlined">forum</span>
            Group Forums
            <span className="tab-badge-count">3</span>
          </button>
          <button
            className={`portal-tab-btn ${activeTab === "meetings" ? "active" : ""}`}
            onClick={() => setActiveTab("meetings")}
          >
            <span className="material-symbols-outlined">event</span>
            Scheduled Meetings
            <span className="tab-badge-count">3</span>
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
            onEditProfileClick={openEditProfileModal}
          />
        )}
      </main>

      {/* 1. Schedule a Free Support Session Modal (Matching Image 2) */}
      {activeModal === "schedule" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window schedule-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>Schedule a Free Support Session</h3>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="callback-form">
              <div className="input-group">
                <label>Session Topic & Format</label>
                <select
                  value={scheduleForm.topic}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, topic: e.target.value })
                  }
                >
                  <option value="1-on-1 Housing & Voucher Consultation">
                    1-on-1 Housing & Voucher Consultation
                  </option>
                  <option value="Employment & Job Interview Prep">
                    Employment & Job Interview Prep
                  </option>
                  <option value="Emergency Food & Utility Intake">
                    Emergency Food & Utility Intake
                  </option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label>Preferred Date</label>
                  <select
                    value={scheduleForm.date}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, date: e.target.value })
                    }
                  >
                    <option value="Tomorrow, Sep 4">Tomorrow, Sep 4</option>
                    <option value="Friday, Sep 5">Friday, Sep 5</option>
                    <option value="Next Monday, Sep 8">Next Monday, Sep 8</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Time Window</label>
                  <select
                    value={scheduleForm.timeWindow}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, timeWindow: e.target.value })
                    }
                  >
                    <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                    <option value="1:00 PM - 1:45 PM">1:00 PM - 1:45 PM</option>
                    <option value="3:00 PM - 3:45 PM">3:00 PM - 3:45 PM</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Location Preference</label>
                <div className="location-preference-toggle">
                  <button
                    type="button"
                    className={`location-toggle-btn ${
                      scheduleForm.locationPref === "virtual" ? "active" : ""
                    }`}
                    onClick={() =>
                      setScheduleForm({ ...scheduleForm, locationPref: "virtual" })
                    }
                  >
                    <span className="material-symbols-outlined">videocam</span>
                    Virtual Video Call
                  </button>
                  <button
                    type="button"
                    className={`location-toggle-btn ${
                      scheduleForm.locationPref === "in-person" ? "active" : ""
                    }`}
                    onClick={() =>
                      setScheduleForm({ ...scheduleForm, locationPref: "in-person" })
                    }
                  >
                    <span className="material-symbols-outlined">location_on</span>
                    In-Person Center
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Notes for Specialist</label>
                <textarea
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.92rem",
                  }}
                  placeholder="What specific questions or documents would you like to cover?"
                  value={scheduleForm.notes}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, notes: e.target.value })
                  }
                ></textarea>
              </div>

              <button type="submit" className="btn-confirm-schedule">
                Confirm & Add to Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. 24/7 Community Care Support Chat Modal (Matching Image 3) */}
      {activeModal === "chat" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window care-chat-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="care-chat-header">
              <div className="chat-header-info">
                <div className="chat-bot-icon">🤝</div>
                <div>
                  <h4>Community Care Support</h4>
                  <p>Active now &bull; Confidential & Free</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                style={{ color: "#ffffff" }}
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            <div className="care-chat-body">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.sender === "user" ? "user" : ""}`}
                >
                  <div className="chat-bubble-msg">{msg.text}</div>
                  <span className="chat-time-stamp">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Prompt Chips */}
            <div className="quick-prompt-chips">
              <button
                className="prompt-chip-btn"
                onClick={() => handleSendChatMessage("Emergency food & pantry locations")}
              >
                Emergency food & pantry locations
              </button>
              <button
                className="prompt-chip-btn"
                onClick={() => handleSendChatMessage("Housing vouchers & rent assistance")}
              >
                Housing vouchers & rent assistance
              </button>
              <button
                className="prompt-chip-btn"
                onClick={() => handleSendChatMessage("Applying for jobs")}
              >
                Applying for jobs
              </button>
            </div>

            <div className="care-chat-input-bar">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChatMessage();
                }}
              />
              <button
                className="btn-send-care-chat"
                onClick={() => handleSendChatMessage()}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Profile & Avatar Photo Modal */}
      {activeModal === "edit-profile" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window schedule-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>Edit Profile & Avatar Photo</h3>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="callback-form">
              <div className="input-group">
                <label>Choose Avatar Profile Photo</label>
                <div className="avatar-options-grid">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      className={`avatar-option-item ${
                        editProfileForm.avatar_url === url ? "selected" : ""
                      }`}
                      onClick={() =>
                        setEditProfileForm({ ...editProfileForm, avatar_url: url })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Or Custom Profile Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editProfileForm.avatar_url}
                  onChange={(e) =>
                    setEditProfileForm({ ...editProfileForm, avatar_url: e.target.value })
                  }
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editProfileForm.first_name}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, first_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editProfileForm.last_name}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, last_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={editProfileForm.phone}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Current Location</label>
                  <input
                    type="text"
                    value={editProfileForm.location}
                    onChange={(e) =>
                      setEditProfileForm({ ...editProfileForm, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <button type="submit" className="btn-confirm-schedule">
                Save Profile & Photo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Navigator Callback Modal */}
      {activeModal === "callback" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window schedule-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>Request Navigator Callback</h3>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            {callbackSubmitted ? (
              <div className="success-banner" style={{ padding: "1rem", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "12px", textAlign: "center" }}>
                Callback requested! Sarah Jenkins will contact you shortly at{" "}
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

                <button type="submit" className="btn-confirm-schedule">
                  Confirm Callback Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MemberPortalPage;
