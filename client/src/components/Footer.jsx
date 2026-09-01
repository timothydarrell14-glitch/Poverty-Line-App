import { useNavigate } from 'react-router-dom';

export const Footer = () => {
  const navigate = useNavigate();
  const goTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="site-footer">
      <div className="content-wrap footer-grid">
        <div className="footer-brand-column">
          <div className="brand font-heading"><span className="material-symbols-outlined material-symbols-fill">volunteer_activism</span>Poverty Line</div>
          <p>&copy; 2026 Poverty Line. All rights reserved. Providing dignity through efficiency.</p>
        </div>
        <div>
          <h5 className="font-heading">Organization</h5>
          <ul><li><button type="button">About Us</button></li><li><button type="button" onClick={() => goTo('/jobs')}>Job Opportunities</button></li><li><button type="button" onClick={() => goTo('/organisations')}>Partner With Us</button></li></ul>
        </div>
        <div>
          <h5 className="font-heading">Resources</h5>
          <ul><li><button type="button" onClick={() => goTo('/community')}>Community Forum</button></li><li><button type="button" onClick={() => goTo('/donors')}>Donor FAQ</button></li><li><button type="button">Privacy Policy &amp; Terms</button></li></ul>
        </div>
        <div className="footer-connect-column">
          <h5 className="font-heading">Connect</h5>
          <button type="button" className="footer-connect-link" onClick={() => goTo('/contact')}>Contact us</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
