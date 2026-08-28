import { useState } from "react";
import { saveAuthSession } from "../utils/auth";
import "../styles/Auth.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function Login({ isOpen, onClose, onShowSignup, onAuthenticated }) {
  const [role, setRole] = useState("individual");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      saveAuthSession(data);
      onAuthenticated?.(data.user);
      onClose();
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="auth-backdrop" onMouseDown={onClose} role="presentation"><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="material-symbols-outlined">account_circle</span><h2 id="login-title">Sign In to Poverty Line</h2></div><button type="button" aria-label="Close login" onClick={onClose}><span className="material-symbols-outlined">close</span></button></header><form onSubmit={handleSubmit}><label>Select Your Portal Role</label><div className="role-grid">{[["individual", "Get Help / Member"], ["donor", "Donor / Benefactor"], ["partner", "Partner Non-profit"], ["volunteer", "Active Volunteer"]].map(([id, label]) => <button type="button" className={role === id ? "selected" : ""} onClick={() => setRole(id)} key={id}>{label}</button>)}</div><label>Email Address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@organization.org" /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Authenticating..." : "Sign In"}</button></form><p className="auth-switch">New to Poverty Line? <button type="button" onClick={onShowSignup}>Create an account</button></p></section></div>;
}
