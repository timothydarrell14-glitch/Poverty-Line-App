import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api/client";
import "../styles/Auth.css";

const Login = ({ isOpen, onClose, onShowSignup, onAuthenticated }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem("povertyLineSavedEmail") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("povertyLineSavedPassword") || "");
  const [savePassword, setSavePassword] = useState(() => localStorage.getItem("povertyLineRememberMe") === "true");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If used as a modal and not open, render nothing
  if (isOpen === false) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl("/api/users/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      if (savePassword) {
        localStorage.setItem("povertyLineSavedEmail", email);
        localStorage.setItem("povertyLineSavedPassword", password);
        localStorage.setItem("povertyLineRememberMe", "true");
      } else {
        localStorage.removeItem("povertyLineSavedEmail");
        localStorage.removeItem("povertyLineSavedPassword");
        localStorage.removeItem("povertyLineRememberMe");
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("povertyLineToken", data.access_token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        onAuthenticated?.(data.user);
      }

      onClose?.();
      navigate(data.user?.role?.trim().toLowerCase() === "admin" ? "/admin" : "/get-help");
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardContent = (
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" onMouseDown={(e) => e.stopPropagation()}>
      <header>
        <div>
          <span className="material-symbols-outlined">lock</span>
          <h2 id="login-title">Sign in to your account</h2>
        </div>
        {onClose && (
          <button type="button" aria-label="Close login" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </header>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">
          Email address
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>

        <label htmlFor="login-password">
          Password
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        <label className="consent-check" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
          <input
            type="checkbox"
            checked={savePassword}
            onChange={(event) => setSavePassword(event.target.checked)}
          />
          Remember me on this device
        </label>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {onShowSignup && (
        <p className="auth-switch">
        Don't have an account? <button type="button" onClick={onShowSignup}>Create an account</button>
        </p>
      )}
    </section>
  );

  if (isOpen !== undefined) {
    return (
      <div className="auth-backdrop" onMouseDown={onClose} role="presentation">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="login-page">
      {cardContent}
    </div>
  );
};

export default Login;
