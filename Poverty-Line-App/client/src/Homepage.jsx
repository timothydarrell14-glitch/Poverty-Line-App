import { useState } from 'react';
import Navbar from './components/Navbar';
import Herosection from './components/Herosection';
import EcosystemSection from './components/EcosystemSection';
import ProgressSection from './components/ProgressSection';
import Footer from './components/Footer';
import ContactScreen from './components/ContactScreen';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');

  const tabContent = {
    'get-help': {
      title: 'Find the support you need.',
      description: 'Explore practical resources and community programs built to help people move forward with dignity.',
      icon: 'help_outline',
    },
    donors: {
      title: 'Make every contribution count.',
      description: 'Support transparent, sustainable initiatives that direct resources where they create lasting impact.',
      icon: 'favorite',
    },
    organisations: {
      title: 'Build impact together.',
      description: 'Partner with a growing network of organisations working to scale solutions across communities.',
      icon: 'corporate_fare',
    },
  };

  return (
    <div className="site-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDonate={() => alert('Donate modal opened')}
        onOpenLogin={() => alert('Login modal opened')}
      />

      {activeTab === 'home' && (
        <main>
          <Herosection
            onExploreImpact={() => setActiveTab('donors')}
            onReadStory={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
          />
          <EcosystemSection onSelectTab={(tab) => setActiveTab(tab)} />
          <ProgressSection />
        </main>
      )}

      {activeTab === 'contact' && <ContactScreen />}

      {tabContent[activeTab] && (
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-20 pt-28">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#e0e3e8] p-8 md:p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-[#005f6a] mb-5">
              {tabContent[activeTab].icon}
            </span>
            <h1 className="text-4xl font-bold text-[#181c20] mb-4 font-heading">
              {tabContent[activeTab].title}
            </h1>
            <p className="text-[#3e494a] leading-relaxed">
              {tabContent[activeTab].description}
            </p>
          </div>
        </main>
      )}

      <Footer onSelectTab={(tab) => setActiveTab(tab)} />
    </div>
  );
}