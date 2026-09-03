import { useState } from "react";
import { apiUrl } from "../api/client";
import { useToast } from "../context/ToastContext";

const TalkToSomeone = () => {
  const [activeModal, setActiveModal] = useState(null); // 'callback' | 'chat' | null
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    topic: "Housing & Shelter Vouchers",
    timeSlot: "Within 15 minutes (Immediate Queue)",
  });
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmitCallback = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(apiUrl("/api/callbacks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Your callback request could not be submitted.");
      showToast("Callback request submitted successfully.", "success");
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setActiveModal(null);
        setFormData({
          name: "",
          phone: "",
          topic: "Housing & Shelter Vouchers",
          timeSlot: "Within 15 minutes (Immediate Queue)",
        });
      }, 2500);
    } catch (err) {
      showToast(err.message || "Your callback request could not be submitted.", "error");
    }
  };

  return (
    <section className="help-section-card">
      <div className="section-intro">
        <h2>Talk to Someone</h2>
        <p>
          Our team is here to listen and provide guidance. 24/7 confidential
          support is just a click or call away.
        </p>
      </div>

      <div className="support-cards-grid">
        {/* Helpline */}
        <div className="support-box">
          <div className="icon-circle">
            <svg className="support-icon" viewBox="0 0 24 24" fill="none" stroke="#0f6258" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h3>Call our Helpline</h3>
          <a href="tel:18005550199" className="support-link">
            1-800-555-0199
          </a>
          <span className="sub-caption">
            Toll-free • Available 24/7 in 14 languages
          </span>
        </div>

        {/* Live Chat */}
        <div className="support-box">
          <div className="icon-circle">
            <svg className="support-icon" viewBox="0 0 24 24" fill="none" stroke="#0f6258" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>Live Chat</h3>
          <button
            className="pill-btn-green"
            onClick={() => setActiveModal("chat")}
          >
            <span className="pulse-dot"></span> Start Chat
          </button>
        </div>

        {/* Callback */}
        <div className="support-box">
          <div className="icon-circle">
            <svg className="support-icon" viewBox="0 0 24 24" fill="none" stroke="#0f6258" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
          <h3>Request a Callback</h3>
          <span className="sub-caption">We'll call you within 15 mins</span>
          <button
            className="link-arrow-btn"
            onClick={() => setActiveModal("callback")}
          >
            Book slot &rarr;
          </button>
        </div>
      </div>

      {/* Request a Confidential Callback Modal */}
      {activeModal === "callback" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-window callback-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">📲</span>
                <h3>Request a Confidential Callback</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>

            <p className="modal-helper-text">
              Our specialized coordinators provide free, non-judgmental
              assistance for urgent shelter, food support, utilities, or
              employment.
            </p>

            {submitted ? (
              <div className="success-banner">
                Callback requested! Our team will reach out at{" "}
                <strong>{formData.phone}</strong>.
              </div>
            ) : (
              <form onSubmit={handleSubmitCallback} className="callback-form">
                <div className="input-group">
                  <label>Your Preferred Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Primary Assistance Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                  >
                    <option value="Housing & Shelter Vouchers">
                      Housing & Shelter Vouchers
                    </option>
                    <option value="Emergency Food Support">
                      Emergency Food Support
                    </option>
                    <option value="Utility & Bill Assistance">
                      Utility & Bill Assistance
                    </option>
                    <option value="Employment & Job Readiness">
                      Employment & Job Readiness
                    </option>
                    <option value="Healthcare & Family Support">
                      Healthcare & Family Support
                    </option>
                  </select>
                </div>

                <div className="input-group">
                  <label>When Should We Call?</label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) =>
                      setFormData({ ...formData, timeSlot: e.target.value })
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
                    <option value="Tomorrow: Morning (9:00 AM - 12:00 PM)">
                      Tomorrow: Morning (9:00 AM - 12:00 PM)
                    </option>
                  </select>
                </div>

                <button type="submit" className="btn-confirm-callback">
                  Confirm Callback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {activeModal === "chat" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-window chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Support Assistant</h3>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModal(null)}
              >
                &times;
              </button>
            </div>
            <div className="chat-dialog">
              <div className="chat-bubble">
                👋 Hello! Welcome to Poverty Line Support. How can we assist you
                today?
              </div>
            </div>
            <button className="cancel-btn" onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TalkToSomeone;
