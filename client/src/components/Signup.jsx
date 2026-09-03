import { useState } from "react";
import { apiUrl } from "../api/client";
import { useToast } from "../context/ToastContext";
import "../styles/Auth.css";
import "../styles/Auth.dark.css";

export default function Signup({ isOpen, onClose, onShowLogin }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  if (!isOpen) return null;

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setMessage(""); setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl("/api/users/register"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || Object.values(data).flat().join(" ") || "Unable to create your account.");
      setMessage("Account created. You can now sign in.");
      showToast("Account created successfully. You can now sign in.", "success");
    } catch (requestError) { setError(requestError.message || "Unable to create your account."); showToast(requestError.message || "Unable to create your account.", "error"); } finally { setIsSubmitting(false); }
  };

  return <div className="auth-backdrop" onMouseDown={onClose} role="presentation"><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="signup-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="material-symbols-outlined">person_add</span><h2 id="signup-title">Create your account</h2></div><button type="button" aria-label="Close sign up" onClick={onClose}><span className="material-symbols-outlined">close</span></button></header><form onSubmit={handleSubmit}><div className="auth-name-fields"><label>First name<input name="first_name" required value={form.first_name} onChange={handleChange} /></label><label>Last name<input name="last_name" required value={form.last_name} onChange={handleChange} /></label></div><label>Email Address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={handleChange} placeholder="At least 8 characters" /></label><p className="auth-helper">New accounts are standard user accounts. Administrator access is assigned securely by the system.</p>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create Account"}</button></form><p className="auth-switch">Already have an account? <button type="button" onClick={onShowLogin}>Sign in</button></p></section></div>;
}
