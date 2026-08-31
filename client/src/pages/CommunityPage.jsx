import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { apiUrl } from "../api/client";
import "../styles/Community.css";

const CATEGORY_ICONS = {
  "General Support": "chat",
  "Housing Advice": "roofing",
  "Food Sharing": "restaurant",
  "Job Seekers": "work",
  "Mental Wellbeing": "health_and_safety",
  "Agriculture": "agriculture",
  "Livelihood": "storefront",
};

export default function CommunityPage() {
  const [channels, setChannels] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Channel Form State
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelCategory, setNewChannelCategory] = useState("General Support");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [newChannelLocation, setNewChannelLocation] = useState("Nairobi");

  // Current logged in user details (Defaulting to Sarah Jenkins)
  const currentUser = {
    user_id: 1,
    first_name: "Sarah",
    last_name: "Jenkins",
    display_name: "Sarah Jenkins",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  };

  const chatFeedEndRef = useRef(null);

  // Auto-scroll chat feed to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatFeedEndRef.current?.scrollIntoView) {
      chatFeedEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  };

  // Fetch all available channels
  const refreshChannels = async () => {
    try {
      const res = await fetch(apiUrl("/api/communities"));
      if (res.ok) {
        const data = await res.json();
        setChannels(data.communities || []);
      }
    } catch (err) {
      console.error("Error refreshing channels:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialChannels = async () => {
      try {
        const res = await fetch(apiUrl("/api/communities"));
        if (!res.ok) throw new Error("Failed to fetch communities");
        const data = await res.json();
        const list = data.communities || [];
        if (isMounted) {
          setChannels(list);
          if (list.length > 0) {
            setActiveChannelId((prev) => prev ?? list[0].community_id);
          }
        }
      } catch (err) {
        console.error("Error loading communities:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialChannels();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeChannelId) return;

    const fetchChannelData = async () => {
      setPostsLoading(true);
      try {
        // Fetch specific channel metadata
        const metaRes = await fetch(apiUrl(`/api/communities/${activeChannelId}`));
        if (metaRes.ok) {
          const meta = await metaRes.json();
          setActiveChannel(meta);
        }

        // Fetch posts
        const postsRes = await fetch(apiUrl(`/api/communities/${activeChannelId}/posts`));
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
          setTimeout(() => scrollToBottom(false), 50);
        }
      } catch (err) {
        console.error("Error fetching channel posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchChannelData();
  }, [activeChannelId]);

  // Handle Optimistic Message Send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeChannelId) return;

    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const optimisticPost = {
      post_id: tempId,
      community_id: activeChannelId,
      user_id: currentUser.user_id,
      content: text,
      created_at: timestamp,
      user: currentUser,
      sending: true,
    };

    // 1. Optimistically append message to feed
    setPosts((prev) => [...prev, optimisticPost]);
    setInputMessage("");
    setTimeout(() => scrollToBottom(true), 50);

    try {
      // 2. Perform API POST request
      const res = await fetch(apiUrl(`/api/communities/${activeChannelId}/posts`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) throw new Error("Failed to send post");
      const savedPost = await res.json();

      // 3. Replace optimistic message with actual DB post
      setPosts((prev) =>
        prev.map((p) => (p.post_id === tempId ? savedPost : p))
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // Mark as error if failed
      setPosts((prev) =>
        prev.map((p) =>
          p.post_id === tempId ? { ...p, sending: false, error: true } : p
        )
      );
    }
  };

  // Handle Channel Creation
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch(apiUrl("/api/communities"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChannelName.trim(),
          category: newChannelCategory,
          description: newChannelDescription.trim(),
          location: newChannelLocation.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create community");
      const created = await res.json();

      // Refresh channels and set active
      await refreshChannels();
      setActiveChannelId(created.community_id);

      // Reset Form & Close Modal
      setNewChannelName("");
      setNewChannelDescription("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating channel:", err);
      alert("Failed to create channel. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Filter channels by search query
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Default avatars for member previews
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
  ];

  return (
    <div className="community-page-wrapper">
      {/* Site Navbar */}
      <Navbar activeTab="get-help" />

      {/* Main Grid Container */}
      <div className="community-grid-container">
        
        {/* SIDEBAR - 3 Columns */}
        <aside className="community-sidebar">
          
          {/* User Profile Card */}
          <div className="user-profile-card">
            <div className="user-profile-left">
              <div className="user-avatar-wrapper">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.display_name}
                  className="user-avatar-img"
                />
                <span className="online-status-dot"></span>
              </div>
              <div className="user-profile-info">
                <span className="user-profile-name">
                  {currentUser.display_name}
                </span>
                <span className="user-profile-status">
                  <span className="status-mini-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button
              className="icon-btn-ghost"
              title="Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>

          {/* Channel Search Input */}
          <div className="channel-search-box">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="channel-search-input"
            />
          </div>

          {/* Section Header */}
          <div className="channels-section-header">
            <span className="channels-section-title">
              COMMUNITY CHANNELS
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-add-channel"
              title="Create Channel"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          {/* Channel Navigation List */}
          <div className="channels-nav-list custom-scrollbar">
            {loading ? (
              <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", padding: "1rem" }}>
                Loading channels...
              </div>
            ) : filteredChannels.length === 0 ? (
              <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", padding: "1rem" }}>
                No channels found.
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isActive = channel.community_id === activeChannelId;
                const iconName = CATEGORY_ICONS[channel.category] || "chat";
                const showBadge = channel.name === "Housing Advice";

                return (
                  <button
                    key={channel.community_id}
                    onClick={() => setActiveChannelId(channel.community_id)}
                    className={`channel-item-btn ${isActive ? "active" : ""}`}
                  >
                    <div className="channel-info-left">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: isActive ? "#0d6e6e" : "#94a3b8", fontSize: "1.25rem" }}
                      >
                        {iconName}
                      </span>
                      <span>{channel.name}</span>
                    </div>

                    {showBadge && (
                      <span className="channel-unread-badge">
                        3
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

        </aside>

        {/* CHAT CONTAINER - 9 Columns */}
        <main className="community-main">
          
          {activeChannel ? (
            <>
              {/* Chat Header */}
              <header className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-category-icon-box">
                    <span className="material-symbols-outlined">
                      {CATEGORY_ICONS[activeChannel.category] || "chat"}
                    </span>
                  </div>
                  <div>
                    <h1 className="chat-header-title">
                      {activeChannel.name}
                    </h1>
                    <p className="chat-header-subtitle">
                      {activeChannel.description || "A safe space for open discussion and mutual help."}
                    </p>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="chat-header-right">
                  {/* Overlapping Member Avatars */}
                  <div className="avatar-stack">
                    <div className="avatar-stack-imgs">
                      {defaultAvatars.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Member avatar"
                          className="avatar-stack-img"
                        />
                      ))}
                    </div>
                    <span className="avatar-count-badge">
                      +24
                    </span>
                  </div>

                  {/* Flag / Moderation icon */}
                  <button
                    className="btn-flag"
                    title="Report / Flag Channel"
                  >
                    <span className="material-symbols-outlined">flag</span>
                  </button>
                </div>
              </header>

              {/* Message Feed */}
              <div className="chat-feed-container custom-scrollbar">
                
                {/* Today Date Divider */}
                <div className="date-divider">
                  <span className="date-divider-pill">
                    Today
                  </span>
                </div>

                {postsLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                    Loading conversation stream...
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                    No messages yet in #{activeChannel.name}. Start the conversation below!
                  </div>
                ) : (
                  posts.map((post) => {
                    const isOutgoing = post.user_id === currentUser.user_id;
                    const senderName = isOutgoing
                      ? `${currentUser.display_name} (You)`
                      : post.user?.display_name || post.user?.first_name || "Community Member";
                    const avatarUrl =
                      post.user?.avatar_url ||
                      (isOutgoing
                        ? currentUser.avatar_url
                        : `https://i.pravatar.cc/150?u=${post.user_id}`);

                    return (
                      <div
                        key={post.post_id}
                        className={`message-row ${isOutgoing ? "outgoing" : "incoming"}`}
                      >
                        {/* Avatar */}
                        <img
                          src={avatarUrl}
                          alt={senderName}
                          className="message-avatar"
                        />

                        {/* Message Content & Header */}
                        <div className="message-body-col">
                          <div className="message-meta">
                            {!isOutgoing && (
                              <span className="message-sender-name">
                                {senderName}
                              </span>
                            )}
                            <span className="message-time">
                              {formatTime(post.created_at)}
                            </span>
                            {isOutgoing && (
                              <span className="message-sender-name">
                                {senderName}
                              </span>
                            )}
                          </div>

                          <div className="message-bubble">
                            {post.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={chatFeedEndRef} />
              </div>

              {/* Message Input Bar */}
              <div className="chat-input-bar">
                <form
                  onSubmit={handleSendMessage}
                  className="chat-input-form"
                >
                  <button
                    type="button"
                    className="btn-attach"
                    title="Attach File"
                  >
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>

                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="chat-text-input"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="btn-send-msg"
                    title="Send Message"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>

                <p className="input-notice-text">
                  Remember to follow our community guidelines. Stay respectful and supportive.
                </p>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              Select a community channel to start chatting.
            </div>
          )}

        </main>

      </div>

      {/* CREATE CHANNEL MODAL OVERLAY */}
      {isModalOpen && (
        <div className="community-modal-backdrop">
          <div className="community-modal-card">
            
            {/* Modal Header */}
            <div className="modal-header-row">
              <div>
                <h3 className="modal-title">Create New Channel</h3>
                <p className="modal-subtitle">Build a community group for mutual support</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="icon-btn-ghost"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateChannel} className="modal-form">
              <div className="form-group">
                <label className="form-label">
                  Channel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Childcare Support"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Category
                </label>
                <select
                  value={newChannelCategory}
                  onChange={(e) => setNewChannelCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="General Support">General Support</option>
                  <option value="Housing Advice">Housing Advice</option>
                  <option value="Food Sharing">Food Sharing</option>
                  <option value="Job Seekers">Job Seekers</option>
                  <option value="Mental Wellbeing">Mental Wellbeing</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Livelihood">Livelihood</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the purpose of this channel..."
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Nairobi"
                  value={newChannelLocation}
                  onChange={(e) => setNewChannelLocation(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Form Buttons */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newChannelName.trim()}
                  className="btn-submit"
                >
                  {creating ? "Creating..." : "Create Channel"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
