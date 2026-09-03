import { FiArrowRight, FiClock } from "react-icons/fi";
import SideBar from "./SideBar";
import "../../styles/Admin/ComingSoon.css";
import "../../styles/Admin/ComingSoon.dark.css";

function ComingSoon({ feature, onPreview }) {
  return (
    <div className="coming-soon-page">
      <SideBar />
      <main className="coming-soon" aria-labelledby="coming-soon-title">
        <div className="coming-soon__panel">
          <span className="coming-soon__eyebrow">
            <FiClock aria-hidden="true" />
            In development
          </span>
          <h1 id="coming-soon-title">{feature} are coming soon</h1>
          <p>
            We’re putting the finishing touches on this workspace. You can explore
            the current design in preview mode while we complete it.
          </p>
          <button className="coming-soon__preview" type="button" onClick={onPreview}>
            See preview
            <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}

export default ComingSoon;
