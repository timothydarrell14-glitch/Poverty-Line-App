import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Herosection from '../components/Herosection';
import EcosystemSection from '../components/EcosystemSection';
import ProgressSection from '../components/ProgressSection';
import Footer from '../components/Footer';
import '../styles/Homepage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="site-shell">
      <Navbar activeTab="home" onOpenDonate={() => alert('Donate modal opened')} />
      <main>
        <Herosection
          onExploreImpact={() => navigate('/donors')}
          onReadStory={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
        />
        <EcosystemSection onSelectTab={(tab) => navigate(`/${tab}`)} />
        <ProgressSection />
      </main>
      <Footer />
    </div>
  );
}
