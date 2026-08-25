import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForumPreview = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const mockTopics = [
    {
      id: 1,
      category: "HOUSING",
      title: "Navigating Housing Assistance",
      snippet:
        "Has anyone had experience with the new city voucher program? Looking for tips on the application process and how long the document verification takes.",
      author: "Sarah M.",
      timeAgo: "2 hours ago",
      likes: 12,
      replies: 4,
    },
    {
      id: 2,
      category: "FOOD",
      title: "Local Food Pantry Updates",
      snippet:
        "The West Side pantry just extended their hours for working families. They now stay open until 8 PM on Tuesdays and provide fresh produce hampers from community gardens.",
      author: "David K.",
      timeAgo: "5 hours ago",
      likes: 28,
      replies: 7,
    },
    {
      id: 3,
      category: "EMPLOYMENT",
      title: "Free Digital Literacy & Computer Classes",
      snippet:
        "Starting next Monday at the Community Hub: evening classes on resume writing, spreadsheet fundamentals, and applying for remote job positions.",
      author: "Tasha B.",
      timeAgo: "1 day ago",
      likes: 34,
      replies: 9,
    },
  ];

  const filteredTopics = mockTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="help-section-card">
      <div className="card-header-flex">
        <div>
          <h2>Community Forum</h2>
          <p>
            Share experiences, find local tips, and exchange mutual
            encouragement with neighbors.
          </p>
        </div>
        <button
          className="primary-dark-btn btn-small"
          onClick={() => navigate("/community")}
        >
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          New Topic
        </button>
      </div>

      <div className="search-input-box">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search discussions by topic, keyword, or category (e.g. food pantry, housing, resume)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="topics-grid">
        {filteredTopics.map((topic) => (
          <div key={topic.id} className="preview-inner-card forum-card">
            <div className="card-title-badge">
              <span className="category-tag">{topic.category}</span>
              <span className="stat-text likes-count">
                <svg className="heart-icon" viewBox="0 0 24 24" fill="none" stroke="#0f6258" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {topic.likes}
              </span>
            </div>
            <h4>{topic.title}</h4>
            <p className="card-body-text">{topic.snippet}</p>
            <div className="card-footer-flex">
              <span className="author-text">
                {topic.author} • {topic.timeAgo}
              </span>
              <span className="stat-text replies-count">
                <svg className="reply-icon" viewBox="0 0 24 24" fill="none" stroke="#0f6258" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {topic.replies} replies
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ForumPreview;
