import { useState } from "react";
import { apiUrl } from "../api/client";
import { useToast } from "../context/ToastContext";
import "../styles/Auth.css";
const countryCodes = [
  ["KE", "Kenya", "+254"],
  ["US", "United States", "+1"],
  ["GB", "United Kingdom", "+44"],
  ["CA", "Canada", "+1"],
  ["AU", "Australia", "+61"],
  ["DE", "Germany", "+49"],
  ["FR", "France", "+33"],
  ["IN", "India", "+91"],
  ["CN", "China", "+86"],
  ["JP", "Japan", "+81"],
];

export default function Signup({ isOpen, onClose, onShowLogin }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", role: "member", phone: "" });
  const [countryCode, setCountryCode] = useState("+254");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  if (!isOpen) return null;

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const localPhone = form.phone.replace(/^\+\d+\s*/, "");
  const handleCountryCodeChange = (event) => {
    const nextCode = event.target.value;
    setCountryCode(nextCode);
    setForm((current) => ({ ...current, phone: localPhone ? `${nextCode} ${localPhone}` : "" }));
  };
  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    setForm((current) => ({ ...current, phone: value ? `${countryCode} ${value}` : "" }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setMessage(""); setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl("/api/users/register"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || Object.values(data).flat().join(" ") || "Unable to create your account.");
      showToast("Account created successfully. You can now sign in.", "success");
      onShowLogin?.(form.email);
    } catch (requestError) { setError(requestError.message || "Unable to create your account."); showToast(requestError.message || "Unable to create your account.", "error"); } finally { setIsSubmitting(false); }
  };

  return <div className="auth-backdrop" onMouseDown={onClose} role="presentation"><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="signup-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="material-symbols-outlined">person_add</span><h2 id="signup-title">Create your account</h2></div><button type="button" aria-label="Close sign up" onClick={onClose}><span className="material-symbols-outlined">close</span></button></header><form onSubmit={handleSubmit}><fieldset className="account-type-field"><legend>Account type</legend><div className="account-type-options">{[["member", "person", "Member", "Get support and access community resources"], ["donor", "volunteer_activism", "Donor", "Support programmes and track your impact"]].map(([value, icon, title, description]) => <label className={`account-type-option ${form.role === value ? "selected" : ""}`} key={value}><input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} /><span className="material-symbols-outlined">{icon}</span><span><strong>{title}</strong><small>{description}</small></span></label>)}</div></fieldset><div className="auth-name-fields"><label>First name<input name="first_name" required value={form.first_name} onChange={handleChange} /></label><label>Last name<input name="last_name" required value={form.last_name} onChange={handleChange} /></label></div><label>Email Address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" /></label><span className="auth-field-label">Phone number</span><div className="auth-phone-fields"><select aria-label="Country code" value={countryCode} onChange={handleCountryCodeChange}>{countryCodes.map(([code, name, dialCode]) => <option key={`${code}-${dialCode}`} value={dialCode}>{name} ({dialCode})</option>)}</select><input aria-label="Phone number" name="phone" type="tel" autoComplete="tel" value={localPhone} onChange={handlePhoneChange} placeholder="Phone number" /></div><label>Password<input name="password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={handleChange} placeholder="At least 8 characters" /></label><p className="auth-helper">Admin and partner accounts are created securely by the system.</p>{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create Account"}</button></form><p className="auth-switch">Already have an account? <button type="button" onClick={onShowLogin}>Sign in</button></p></section></div>;
}
