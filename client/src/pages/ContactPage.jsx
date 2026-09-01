import Navbar from '../components/Navbar';
import ContactScreen from '../components/ContactScreen';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <div className="site-shell">
      <Navbar activeTab="contact" />
      <ContactScreen />
      <Footer />
    </div>
  );
}
