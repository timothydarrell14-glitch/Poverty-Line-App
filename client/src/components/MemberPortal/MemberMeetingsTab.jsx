import { useState } from "react";
import { useToast } from "../../context/ToastContext";

const SAMPLE_MEETINGS = [
  {
    id: 1,
    title: "1-on-1 Emergency Housing Consultation",
    type: "1-on-1 Guidance",
    status: "Confirmed",
    host: {
      name: "Sarah Jenkins, MSW",
      role: "Senior Housing Navigator",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    date: "Tomorrow, Sept 4, 2026",
    time: "10:30 AM - 11:15 AM (EST)",
    location: "Virtual Meeting Room 4",
    notes: "Please have your current lease agreement or proof of income accessible.",
    isVirtual: true,
  },
  {
    id: 2,
    title: "Community Outreach & Job Preparation Interview",
    type: "Job Interview",
    status: "Confirmed",
    host: {
      name: "David Chen",
      role: "Employment Specialist",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    },
    date: "Friday, Sept 6, 2026",
    time: "2:00 PM - 2:45 PM (EST)",
    location: "Center Suite 204 (Central Hub)",
    notes: "In-person interview for the Community Outreach Coordinator position.",
    isVirtual: false,
  },
];

const MemberMeetingsTab = () => {
  const [meetings, setMeetings] = useState(SAMPLE_MEETINGS);
  const [showBookModal, setShowBookModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    type: "1-on-1 Housing Consultation",
    preferredDate: "",
    timeSlot: "Morning (9:00 AM - 12:00 PM)",
    notes: "",
  });
  const { showToast } = useToast();

  const handleCancel = (meetingId) => {
    setMeetings(meetings.filter((m) => m.id !== meetingId));
    showToast("Meeting cancelled successfully.", "info");
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      title: newBooking.type,
      type: "1-on-1 Guidance",
      status: "Confirmed",
      host: {
        name: "Sarah Jenkins, MSW",
        role: "Family Navigator Coordinator",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      },
      date: newBooking.preferredDate || "Upcoming Slot",
      time: newBooking.timeSlot,
      location: "Virtual Meeting Room 1",
      notes: newBooking.notes || "Requested via Member Portal.",
      isVirtual: true,
    };
    setMeetings([created, ...meetings]);
    showToast("New consultation session booked!", "success");
    setShowBookModal(false);
    setNewBooking({
      type: "1-on-1 Housing Consultation",
      preferredDate: "",
      timeSlot: "Morning (9:00 AM - 12:00 PM)",
      notes: "",
    });
  };

  return (
    <div className="member-meetings-tab">
      {/* Header Banner */}
      <div className="meetings-section-title">
        <div className="title-wrap-left">
          <h2>Your Scheduled Consultations & Workshops ({meetings.length})</h2>
          <p>Connect with your assigned family navigator and interviewers.</p>
        </div>
        <button className="btn-book-session" onClick={() => setShowBookModal(true)}>
          <span className="material-symbols-outlined">event</span>
          Book New Session
        </button>
      </div>

      {/* Meetings Grid */}
      {meetings.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center", margin: "2rem 0" }}>
          You have no upcoming meetings scheduled. Click "Book New Session" to schedule a appointment!
        </p>
      ) : (
        <div className="meetings-grid">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header-badges">
                <span className="badge-confirmed">{meeting.status}</span>
                <span className="badge-type">{meeting.type}</span>
              </div>

              <h3>{meeting.title}</h3>

              <div className="host-info-box">
                <img
                  src={meeting.host.avatar}
                  alt={meeting.host.name}
                  className="host-avatar"
                />
                <div className="host-details">
                  <h4>{meeting.host.name}</h4>
                  <p>{meeting.host.role}</p>
                </div>
              </div>

              <div className="meeting-time-location">
                <div className="meta-row">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{meeting.date}</span>
                </div>
                <div className="meta-row">
                  <span className="material-symbols-outlined">schedule</span>
                  <span>{meeting.time}</span>
                </div>
                <div className="meta-row">
                  <span className="material-symbols-outlined">
                    {meeting.isVirtual ? "videocam" : "location_on"}
                  </span>
                  <span>{meeting.location}</span>
                </div>
              </div>

              {meeting.notes && (
                <div className="meeting-notes-box">
                  <strong>Note:</strong> {meeting.notes}
                </div>
              )}

              <div className="meeting-actions-row">
                <button
                  className="btn-primary-action"
                  onClick={() =>
                    showToast(
                      meeting.isVirtual
                        ? "Launching video room connection..."
                        : `Location details: ${meeting.location}`,
                      "info"
                    )
                  }
                >
                  <span className="material-symbols-outlined">
                    {meeting.isVirtual ? "videocam" : "directions"}
                  </span>
                  {meeting.isVirtual ? "Join Video Room" : "Get Directions"}
                </button>
                <button
                  className="btn-cancel-meeting"
                  onClick={() => handleCancel(meeting.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book New Session Modal */}
      {showBookModal && (
        <div className="modal-backdrop" onClick={() => setShowBookModal(false)}>
          <div className="modal-window callback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Book a Consultation Session</h3>
              <button className="modal-close-btn" onClick={() => setShowBookModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleBookSubmit} className="callback-form">
              <div className="input-group">
                <label>Session Type</label>
                <select
                  value={newBooking.type}
                  onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value })}
                >
                  <option value="1-on-1 Housing Consultation">1-on-1 Housing Consultation</option>
                  <option value="Employment & Resume Review">Employment & Resume Review</option>
                  <option value="Utility Grant Assistance Intake">Utility Grant Assistance Intake</option>
                </select>
              </div>

              <div className="input-group">
                <label>Preferred Date</label>
                <input
                  type="date"
                  value={newBooking.preferredDate}
                  onChange={(e) => setNewBooking({ ...newBooking, preferredDate: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Time Slot</label>
                <select
                  value={newBooking.timeSlot}
                  onChange={(e) => setNewBooking({ ...newBooking, timeSlot: e.target.value })}
                >
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Special Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes for your navigator..."
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-confirm-callback">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberMeetingsTab;
