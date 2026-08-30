import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem("povertyLineSavedEmail") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("povertyLineSavedPassword") || "");
  const [savePassword, setSavePassword] = useState(() => localStorage.getItem("povertyLineRememberMe") === "true");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
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
    navigate("/logistics");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Log in to access your logistics dashboard.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <input
              type="checkbox"
              checked={savePassword}
              onChange={(event) => setSavePassword(event.target.checked)}
            />
            Save password on this device
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;