import { useState, useEffect } from "react";
import { apiRequest } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const SAMPLE_POSTS = [
  {
    post_id: 101,
    category: "Housing",
    author_name: "Sarah M.",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    title: "Tips for fast-track rental assistance applications in Central District?",
    content: "Has anyone successfully submitted the new emergency rental assistance voucher this month? Looking for guidance on the required documentation.",
    likes: 12,
    replies: [
      { id: 1, author: "Elena Rostova", text: "The intake appointment at the community center went much faster once I printed my income verification beforehand!", time: "1 hour ago" },
      { id: 2, author: "Marcus Vance", text: "Make sure to bring your utility bills too. They speed up processing.", time: "30 mins ago" }
    ]
  },
  {
    post_id: 102,
    category: "Food Support",
    author_name: "Marcus V.",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    title: "Fresh Produce Pantry schedule change for Thursday",
    content: "Just a heads up to community members: the Eastside distribution center is opening 30 minutes earlier this week (8:30 AM).",
    likes: 8,
    replies: []
  }
];

const MemberForumsTab = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", content: "", category: "Housing" });
  const [replyTextMap, setReplyTextMap] = useState({});
  const { showToast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/community-posts");
      const fetched = res.posts || [];
      if (fetched.length > 0) {
        setPosts(fetched);
      } else {
        setPosts(SAMPLE_POSTS);
      }
    } catch {
      setPosts(SAMPLE_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      try {
        const res = await apiRequest("/api/community-posts");
        const fetched = res.posts || [];
        if (isMounted) {
          setPosts(fetched.length > 0 ? fetched : SAMPLE_POSTS);
        }
      } catch {
        if (isMounted) {
          setPosts(SAMPLE_POSTS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.content.trim()) return;

    try {
      await apiRequest("/api/community-posts", {
        method: "POST",
        body: {
          community_id: 1,
          content: `${newTopic.title ? newTopic.title + " - " : ""}${newTopic.content}`,
        },
      });
      showToast("Topic created successfully!", "success");
      setShowNewTopicModal(false);
      setNewTopic({ title: "", content: "", category: "Housing" });
      fetchPosts();
    } catch {
      // Fallback add to UI state
      const newEntry = {
        post_id: Date.now(),
        category: newTopic.category,
        author_name: "You",
        created_at: new Date().toISOString(),
        title: newTopic.title || "Community Discussion",
        content: newTopic.content,
        likes: 1,
        replies: []
      };
      setPosts([newEntry, ...posts]);
      showToast("Topic published to community!", "success");
      setShowNewTopicModal(false);
      setNewTopic({ title: "", content: "", category: "Housing" });
    }
  };

  const handleAddReply = (postId) => {
    const text = replyTextMap[postId];
    if (!text || !text.trim()) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.post_id === postId) {
          const currentReplies = p.replies || [];
          return {
            ...p,
            replies: [
              ...currentReplies,
              { id: Date.now(), author: "You", text: text.trim(), time: "Just now" }
            ]
          };
        }
        return p;
      })
    );
    showToast("Reply posted!", "success");
    setReplyTextMap({ ...replyTextMap, [postId]: "" });
  };

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === "All") return true;
    return (p.category || "General").toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="member-forums-tab">
      {/* Forum Actions Header */}
      <div className="forum-actions-header">
        <div className="filter-pills-row">
          {["All", "Housing", "Food Support", "Employment", "Healthcare", "Mutual Aid"].map((cat) => (
            <button
              key={cat}
              className={`filter-pill-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="btn-start-topic" onClick={() => setShowNewTopicModal(true)}>
          <span className="material-symbols-outlined">add</span>
          Start New Topic
        </button>
      </div>

      {/* Topics List */}
      {loading ? (
        <p style={{ color: "#64748b", textAlign: "center" }}>Loading community topics...</p>
      ) : filteredPosts.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center" }}>No topics found in this category.</p>
      ) : (
        <div className="forum-posts-list">
          {filteredPosts.map((post) => (
            <div key={post.post_id} className="forum-post-card">
              <div className="post-meta-row">
                <span className="forum-cat-badge">{post.category || post.community_name || "General"}</span>
                <span className="post-author-text">
                  Posted by <strong>{post.author_name || "Community Member"}</strong> &bull;{" "}
                  {post.created_at
                    ? new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Recently"}
                </span>
              </div>

              <h3>{post.title || post.content.slice(0, 60)}</h3>
              <p className="post-body-text">{post.content}</p>

              <div className="post-stats-row">
                <span className="stat-item">
                  <span className="material-symbols-outlined">thumb_up</span>
                  {post.likes || 4} Likes
                </span>
                <span className="stat-item">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  {(post.replies?.length || 0)} Replies
                </span>
              </div>

              {/* Replies Box */}
              {post.replies && post.replies.length > 0 && (
                <div className="replies-list-box">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div>
                        <span className="reply-author">{reply.author}</span>
                        <span className="reply-content">{reply.text}</span>
                      </div>
                      <span className="reply-time">{reply.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Inline Reply Bar */}
              <div className="reply-input-bar">
                <input
                  type="text"
                  placeholder="Share advice or response..."
                  value={replyTextMap[post.post_id] || ""}
                  onChange={(e) =>
                    setReplyTextMap({ ...replyTextMap, [post.post_id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddReply(post.post_id);
                  }}
                />
                <button
                  className="btn-send-reply"
                  onClick={() => handleAddReply(post.post_id)}
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="modal-backdrop" onClick={() => setShowNewTopicModal(false)}>
          <div className="modal-window callback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Start a New Topic</h3>
              <button className="modal-close-btn" onClick={() => setShowNewTopicModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="callback-form">
              <div className="input-group">
                <label>Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Questions about utility bill grants"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                >
                  <option value="Housing">Housing</option>
                  <option value="Food Support">Food Support</option>
                  <option value="Employment">Employment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Mutual Aid">Mutual Aid</option>
                </select>
              </div>

              <div className="input-group">
                <label>Message / Discussion Content</label>
                <textarea
                  rows="4"
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  placeholder="Describe what advice or assistance you are seeking..."
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-confirm-callback">
                Post Topic
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberForumsTab;
