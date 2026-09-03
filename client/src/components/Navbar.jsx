import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import Login from "./Login";
import Signup from "./Signup";
import DonationPopup from "./DonationPopup";
import {
  clearAuthSession,
  getCurrentUser,
  isAuthenticated,
} from "../utils/auth";
import { apiRequest } from "../api/client";
import { usePublicSettings } from "../hooks/usePublicSettings";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

export const Navbar = ({ activeTab, setActiveTab, onOpenDonate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [isDonationPopupOpen, setIsDonationPopupOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { orgName } = usePublicSettings();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handle = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    const syncAuthState = () => setCurrentUser(getCurrentUser());
    window.addEventListener("povertyline-auth-change", syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener("povertyline-auth-change", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const openLogin = () => {
    setOpen(false);
    setIsLoginOpen(true);
  };

  const signOut = () => {
    clearAuthSession();
    navigate("/");
  };

  const openDonationPopup = () => {
    setIsDonationPopupOpen(true);
  };

  useEffect(() => {
    apiRequest("/api/programs?active=true")
      .then((data) => setPrograms(data.programs ?? []))
      .catch(() => setPrograms([]));
  }, []);

  const handleDonationSubmit = async (donationData) => {
    if (donationData.kind === "non_financial") {
      showToast("Your non-financial donation request was submitted successfully.", "success");
      return;
    }
    const response = await apiRequest("/api/donations", {
      method: "POST",
      body: donationData,
    });
    if (response.payment.approval_url) {
      window.location.assign(response.payment.approval_url);
      return;
    }
    if (response.donation?.payment_status === "completed" || response.payment?.status === "completed") {
      showToast("Donation successful. Thank you for your contribution.", "success");
    } else {
      showToast(`Donation recorded. ${response.payment.provider} payment is pending confirmation.`, "info");
    }
  };

  const handleDonateClick = () => {
    // If onOpenDonate is provided (for pages that want custom behavior), use it
    // Otherwise, use the built-in popup
    if (onOpenDonate) {
      onOpenDonate();
    } else {
      openDonationPopup();
    }
  };

  const items = [
    ["/", "home", "Home"],
    ["/get-help", "get-help", "Get Help"],
    ["/donors", "donors", "Donors"],
    ["/organisations", "organisations", "Organisations"],
    ["/contact", "contact", "Contact Us"],
  ];

  const handleSelect = (path, id) => {
    setOpen(false);
    if (setActiveTab) {
      setActiveTab(id);
    }
    if (navigate) {
      navigate(path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isTabActive = (path, id) => {
    if (location && location.pathname === path) return true;
    if (activeTab === id) return true;
    if (id === 'get-help' && (location?.pathname === '/community' || activeTab === 'community')) {
      return true;
    }
    return false;
  };

  return (
    <>
      <nav className={`site-nav ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <button
            className="brand font-heading"
            onClick={() => handleSelect("/", "home")}
          >
            <span className="material-symbols-outlined material-symbols-fill">
              volunteer_activism
            </span>
            {orgName}
          </button>
          <div className="nav-links">
            {items.map(([path, id, label]) => (
              <button
                key={id}
                className={`nav-link ${isTabActive(path, id) ? "active" : ""}`}
                onClick={() => handleSelect(path, id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            <button
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>
            {isAuthenticated() ? (
              <>
                {(() => {
                  const isOrgUser = currentUser?.role === 'partner' || currentUser?.role === 'organisation';
                  const portalPath = isOrgUser ? '/organisations/portal' : '/member-portal';
                  const portalLabel = isOrgUser ? 'Organisation Portal' : 'Member Portal';
                  const portalIcon = isOrgUser ? 'corporate_fare' : 'account_circle';
                  return (
                    <button
                      className="nav-link portal-link-btn"
                      onClick={() => handleSelect(portalPath, isOrgUser ? 'organisation-portal' : 'member-portal')}
                      style={{
                        backgroundColor: "#d1f2ed",
                        color: "#0a574e",
                        fontWeight: "600",
                        borderRadius: "20px",
                        padding: "0.4rem 0.9rem",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                        {portalIcon}
                      </span>
                      {portalLabel}
                    </button>
                  );
                })()}
                {currentUser?.role && (
                  <span className="admin-badge" aria-label="Account type">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </span>
                )}
                <button className="login-button" onClick={signOut}>
                  Log out
                </button>
              </>
            ) : (
              <button className="login-button" onClick={openLogin}>
                Login
              </button>
            )}
            <button className="pill-button nav-donate" onClick={handleDonateClick}>
              <span className="material-symbols-outlined">favorite</span>Donate
              Now
            </button>
          </div>
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined">
              {open ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {items.map(([path, id, label]) => (
          <button
            key={id}
            className={`nav-link ${isTabActive(path, id) ? "active" : ""}`}
            onClick={() => handleSelect(path, id)}
          >
            {label}
          </button>
        ))}
        <div className="nav-actions">
          <button
            className="theme-toggle-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          <button
            className="pill-button"
            onClick={() => {
              setOpen(false);
              handleDonateClick();
            }}
          >
            Donate Now
          </button>
          {isAuthenticated() ? (
            <>
              <button
                className="login-button"
                onClick={() => handleSelect("/member-portal", "member-portal")}
                style={{ backgroundColor: "#0f6258", color: "#ffffff" }}
              >
                Member Portal
              </button>
              <button className="login-button" onClick={signOut}>
                Log out
              </button>
            </>
          ) : (
            <button className="login-button" onClick={openLogin}>
              Login
            </button>
          )}
        </div>
      </div>
      <Login
        key={signupEmail}
        isOpen={isLoginOpen}
        initialEmail={signupEmail}
        onClose={() => setIsLoginOpen(false)}
        onShowSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
        onAuthenticated={(user) => setCurrentUser(user)}
      />
      <Signup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onShowLogin={(email = "") => {
          setIsSignupOpen(false);
          setSignupEmail(email);
          setIsLoginOpen(true);
        }}
      />
      <DonationPopup
        isOpen={isDonationPopupOpen}
        onClose={() => setIsDonationPopupOpen(false)}
        programs={programs}
        onDonate={handleDonationSubmit}
      />
    </>
  );
};

export default Navbar;
