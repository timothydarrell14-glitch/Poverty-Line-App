import foodForward from '../assets/foodforward.jpg';
import globalCare from '../assets/globalcare.jpg';
import organisationsHero from '../assets/organisations-hero.jpg';

export const Herosection = ({ onExploreImpact, onReadStory, publicDescription }) => (
  <section className="hero-section">
    <div className="hero-collage" aria-hidden="true">
      <img src={foodForward} alt="" />
      <img src={globalCare} alt="" />
      <img src={organisationsHero} alt="" />
    </div>
    <div className="hero-card">
      <h1 className="font-heading">{publicDescription || "# Dignity Through Efficiency"}</h1>
      <p>We bridge the gap between resources and those who need them most. A streamlined, community-built approach to strengthening access to clean water, education, and sustainable livelihoods.</p>
      <div className="button-row">
        <button className="pill-button" onClick={onExploreImpact}>Discover Our Impact <span className="material-symbols-outlined">arrow_forward</span></button>
        <button className="outline-button" onClick={onReadStory}>Read Our Story</button>
      </div>
    </div>
  </section>
);
export default Herosection;
