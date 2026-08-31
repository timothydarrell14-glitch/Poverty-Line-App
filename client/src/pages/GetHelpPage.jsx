import Navbar from "../components/Navbar";
import HeroHelp from "../components/HeroHelp";
import JobPreview from "../components/JobPreview";
import TalkToSomeone from "../components/TalkToSomeone";
import ForumPreview from "../components/ForumPreview";
import Footer from "../components/Footer";
import "../styles/GetHelp.css";

const GetHelpPage = () => {
  return (
    <div className="get-help-page-wrapper">
      <Navbar />
      <main className="get-help-main-content">
        <HeroHelp />
        <JobPreview />
        <TalkToSomeone />
        <ForumPreview />
      </main>
      <Footer />
    </div>
  );
};

export default GetHelpPage;
