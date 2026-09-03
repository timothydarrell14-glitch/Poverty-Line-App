import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api/client";
import { useToast } from "../context/ToastContext";

function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  async function submit(event) {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(apiUrl("/api/auth/login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      showToast("Welcome back. You are signed in successfully.", "success");
      navigate(data.user.role.toLowerCase() === "admin" ? "/admin" : "/access-denied", { replace: true });
    } catch (requestError) { setError(requestError.message || "Unable to sign in."); showToast(requestError.message || "Unable to sign in.", "error"); }
    finally { setIsSubmitting(false); }
  }
  return <main className="login-page"><form onSubmit={submit}><h1>Sign in</h1><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" required /></label>{error && <p role="alert">{error}</p>}<button disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</button></form></main>;
}
export default LoginPage;
