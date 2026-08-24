// client/src/pages/GetHelpPage.jsx
import React from "react";
import HeroHelp from "../components/HeroHelp";
import JobPreview from "../components/JobPreview";
import TalkToSomeone from "../components/TalkToSomeone";
import ForumPreview from "../components/ForumPreview";
import "../styles/GetHelp.css";

const GetHelpPage = () => {
  return (
    <div className="get-help-page-wrapper">
      <HeroHelp />
      <JobPreview />
      <TalkToSomeone />
      <ForumPreview />
    </div>
  );
};

export default GetHelpPage;
