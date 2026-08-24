import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero-support.jpg";

const HeroHelp = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-grid-container">
      <div className="hero-text-block">
        <h1>
          Find Support, <br />
          <span className="teal-text">Build Stability.</span>
        </h1>
        <p>
          We provide dignified access to resources, opportunities, and a
          supportive community. You don't have to navigate this alone.
        </p>
        <div className="hero-actions">
          <button
            className="primary-dark-btn"
            onClick={() => navigate("/jobs")}
          >
            Explore Jobs &rarr;
          </button>
          <button
            className="outline-btn"
            onClick={() => navigate("/community")}
          >
            Join Forum
          </button>
        </div>
      </div>
      <div className="hero-visual">
        <img
          src={heroImage}
          alt="Supportive Community Group"
          className="hero-img-rounded"
        />
      </div>
    </div>
  );
};

export default HeroHelp;
