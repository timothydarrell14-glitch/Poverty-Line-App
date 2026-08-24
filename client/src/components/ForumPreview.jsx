import React from "react";
import { useNavigate } from "react-router-dom";

const ForumPreview = () => {
  const navigate = useNavigate();

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
        "The West Side pantry just extended their hours for working families. They now stay open until 8 PM on Tuesdays and provide fresh produce hampers.",
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
          ✏️ New Topic
        </button>
      </div>

      <div className="search-input-box">
        <input
          type="text"
          placeholder="Search discussions by topic, keyword, or category (e.g. food pantry, housing, resume)..."
        />
      </div>

      <div className="topics-grid">
        {mockTopics.map((topic) => (
          <div key={topic.id} className="preview-inner-card">
            <div className="card-title-badge">
              <span className="category-tag">{topic.category}</span>
              <span className="stat-text">❤️ {topic.likes}</span>
            </div>
            <h4>{topic.title}</h4>
            <p className="card-body-text">{topic.snippet}</p>
            <div className="card-footer-flex">
              <span className="author-text">
                {topic.author} • {topic.timeAgo}
              </span>
              <span className="stat-text">💬 {topic.replies} replies</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ForumPreview;
