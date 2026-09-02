import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api/client";
import { saveAuthSession } from "../utils/auth";
import "../styles/Auth.css";

function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    const email = form.get("email")?.toString().trim();
    const password = form.get("password")?.toString();

    if (!email || !password) {
      setError("Please enter your email and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Invalid email or password."
        );
      }

      if (!data?.access_token) {
        throw new Error(
          "Login succeeded, but no access token was returned."
        );
      }

      if (!data?.user) {
        throw new Error(
          "Login succeeded, but no user information was returned."
        );
      }

      // Save authentication using the shared auth utility.
      // This keeps LoginPage, apiRequest(), and AdminRoute
      // using the same session storage keys.
      saveAuthSession({
        access_token: data.access_token,
        user: data.user,
      });

      const role = data.user?.role?.trim().toLowerCase();

      // Administrators go to the admin dashboard.
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        // Other authenticated users go to the Organisations page.
        navigate("/organisations", { replace: true });
      }
    } catch (requestError) {
      setError(
        requestError.message || "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form onSubmit={submit} className="login-form">
        <h1>Sign in</h1>

        <label htmlFor="login-email">
          Email
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
        </label>

        <label htmlFor="login-password">
          Password
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;