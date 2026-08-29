import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/JobsPage.css";
import jobsHero from "../assets/organisations-hero.jpg";

const jobs = [
  [9, "Housing Support Navigator", "Full-time", "Riverside", "New", "Guide clients through housing referrals, documents, and follow-up support."], [8, "Digital Skills Facilitator", "Contract", "Remote / Hybrid", "3 days ago", "Run welcoming digital literacy workshops for job seekers and community members."], [7, "Community Garden Assistant", "Seasonal", "Greenview", "5 days ago", "Help maintain a shared growing space and organise community harvests."], [6, "Client Services Administrator", "Full-time", "Downtown Office", "1 week ago", "Keep client records accurate and help visitors access the right service quickly."], [5, "Youth Programme Mentor", "Part-time", "Westfield", "2 weeks ago", "Support young people with practical skills and access to local resources."], [4, "Food Pantry Coordinator", "Full-time", "Eastside Community Centre", "2 weeks ago", "Lead welcoming pantry services alongside volunteers and partner teams."], [1, "Community Liaison", "Full-time", "City Center, Metro Hub", "2 days ago", "Act as the primary point of contact between support services and community members."], [2, "Logistics Assistant", "Part-time", "Northside Distribution", "5 days ago", "Coordinate the delivery of essential supplies with care and attention to detail."], [3, "Support Specialist", "Contract", "Remote / Hybrid", "1 week ago", "Provide administrative and emotional support to people using assistance programs."]
].map(([job_id, title, type, location, posted, description]) => ({ job_id, title, type, location, posted, description }));

const eligibilityQuestions = [
  ["age", "Are you at least 18 years old?", "You must be 18 or older to apply."],
  ["work", "Are you legally able to work in this location?", "This may include citizenship, residency, or a valid work permit."],
  ["availability", "Can you meet the role schedule and location requirements?", "Reasonable accommodations can be discussed with the employer."],
  ["consent", "Do you consent to share your application with this organisation?", "Your information is used only to process this application."]
];

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { error: "The service returned an unexpected response." }; }
}
function errorMessage(data, fallback) {
  if (data.error) return data.error;
  const messages = Object.entries(data).map(([field, errors]) => `${field.replace(/_/g, " ")}: ${Array.isArray(errors) ? errors.join(", ") : errors}`);
  return messages.join(". ") || fallback;
}

export default function JobsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [view, setView] = useState(null);
  const [accountMode, setAccountMode] = useState("signin");
  const [email, setEmail] = useState(() => localStorage.getItem("povertyLineSavedEmail") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("povertyLineSavedPassword") || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState(""); const [lastName, setLastName] = useState(""); const [agreed, setAgreed] = useState(false);
  const [savePassword, setSavePassword] = useState(() => localStorage.getItem("povertyLineRememberMe") === "true");
  const [token, setToken] = useState(() => localStorage.getItem("povertyLineToken"));
  const [answers, setAnswers] = useState({}); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const shownJobs = jobs.filter((job) => `${job.title} ${job.type} ${job.location} ${job.description}`.toLowerCase().includes(search.trim().toLowerCase()));
  const isSignUp = accountMode === "signup";
  const close = () => { setView(null); setSelectedJob(null); setMessage(""); setAnswers({}); };
  const startApplication = (job) => { setSelectedJob(job); setMessage(""); setAnswers({}); setView(token ? "eligibility" : "account"); };
  const openAccount = () => { setSelectedJob(null); setAccountMode("signin"); setMessage(""); setView("account"); };
  const submitAccount = async (event) => {
    event.preventDefault();
    if (isSignUp && password !== confirmPassword) return setMessage("Passwords do not match.");
    if (isSignUp && !agreed) return setMessage("Please agree to the privacy notice to create your account.");
    setLoading(true); setMessage("");
    try {
      if (isSignUp) {
        const signup = await fetch("/users/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }) });
        const signupData = await readResponse(signup);
        if (!signup.ok) {
          if (signup.status === 409) {
            setAccountMode("signin");
            throw Error("This email already has an account. Please sign in with your password.");
          }
          throw Error(errorMessage(signupData, "We could not create your account. Please check your details and try again."));
        }
      }
      const login = await fetch("/users/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const loginData = await readResponse(login);
      if (!login.ok || !loginData.access_token) {
        throw Error(errorMessage(loginData, "We could not sign you in. Please check your email and password."));
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
      localStorage.setItem("povertyLineToken", loginData.access_token); setToken(loginData.access_token); setView(selectedJob ? "eligibility" : null);
    } catch (error) { setMessage(error instanceof TypeError ? "We cannot reach the account service. Start the backend and try again." : error.message); } finally { setLoading(false); }
  };
  const submitApplication = async (event) => {
    event.preventDefault();
    if (eligibilityQuestions.some(([id]) => !answers[id])) return setMessage("Please answer every eligibility question.");
    if (eligibilityQuestions.some(([id]) => answers[id] === "no")) return setView("ineligible");
    setLoading(true); setMessage("");
    try { const response = await fetch("/job-applications", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ job_id: selectedJob.job_id }) }); const data = await readResponse(response); if (!response.ok) throw Error(errorMessage(data, "Your application could not be submitted.")); setView("success"); } catch (error) { setMessage(error.message); } finally { setLoading(false); }
  };
  return <div className="jobs-page"><Navbar onOpenLogin={openAccount} onOpenDonate={() => navigate("/")} /><main><section className="jobs-hero content-wrap"><div className="jobs-copy"><p className="eyebrow">Opportunities with purpose</p><h1>Dignified employment <em>starts here.</em></h1><p>Explore meaningful work with partner organisations committed to fair wages, supportive teams, and a path forward.</p><div className="job-search"><span className="material-symbols-outlined">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job titles, skills, or locations..." aria-label="Search jobs" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><span className="material-symbols-outlined">close</span></button>}</div></div><div className="jobs-image"><img src={jobsHero} alt="People collaborating at work" /><p><span className="material-symbols-outlined">verified</span> Vetted partner organisations</p></div></section><section className="jobs-list content-wrap"><div className="list-head"><div><p className="eyebrow">Open roles</p><h2>Latest opportunities</h2></div><p>{search ? `${shownJobs.length} result${shownJobs.length === 1 ? "" : "s"}` : `Showing ${shownJobs.length} open positions`}</p></div>{shownJobs.length ? <div className="jobs-grid">{shownJobs.map((job) => <article className="job-card" key={job.job_id}><div><span className="job-type">{job.type}</span><time>{job.posted}</time></div><h3>{job.title}</h3><p className="location"><span className="material-symbols-outlined">location_on</span>{job.location}</p><p className="description">{job.description}</p><button onClick={() => startApplication(job)}>Apply now <span className="material-symbols-outlined">arrow_forward</span></button></article>)}</div> : <div className="empty-search"><span className="material-symbols-outlined">search_off</span><h3>No matching jobs</h3><p>Try a different title, skill, or location.</p><button onClick={() => setSearch("")}>Clear search</button></div>}</section></main><Footer />{view && <div className="backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="application-title"><button className="close" onClick={close} aria-label="Close"><span className="material-symbols-outlined">close</span></button>{view === "account" && <><span className="modal-icon material-symbols-outlined">{isSignUp ? "person_add" : "lock"}</span><p className="eyebrow">{isSignUp ? "Create your account" : "Sign in to continue"}</p><h2 id="application-title">{isSignUp ? "Start your application." : "Your application is almost ready."}</h2><p>{isSignUp ? "Create an account with your email, then continue to the eligibility check." : "Sign in with your email to continue to the eligibility check."}</p><form onSubmit={submitAccount}>{isSignUp && <div className="name-fields"><label>First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} required autoComplete="given-name" /></label><label>Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} required autoComplete="family-name" /></label></div>}<label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required autoComplete={isSignUp ? "new-password" : "current-password"} /></label>{isSignUp && <><small className="password-help">At least 8 characters. Use letters and numbers.</small><label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required autoComplete="new-password" /></label></>}{!isSignUp && <label className="consent-check"><input type="checkbox" checked={savePassword} onChange={(event) => setSavePassword(event.target.checked)} /> Save password on this device</label>}{isSignUp && <label className="consent-check"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I agree to the Privacy Notice and secure use of my application information.</label>}{message && <p className="message" role="alert">{message}</p>}<button disabled={loading}>{loading ? "Please wait..." : isSignUp ? "Create account and continue" : "Sign in and continue"}</button></form><button className="text-button" onClick={() => { setAccountMode(isSignUp ? "signin" : "signup"); setMessage(""); setConfirmPassword(""); setAgreed(false); }}>{isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}</button></>}{view === "eligibility" && <><p className="eyebrow">Eligibility check - step 1 of 1</p><h2 id="application-title">A few quick questions</h2><p>These answers help confirm you meet the essential requirements for <strong>{selectedJob.title}</strong>.</p><form className="questions" onSubmit={submitApplication}>{eligibilityQuestions.map(([id, question, hint]) => <fieldset key={id}><legend>{question}</legend><small>{hint}</small><div><label><input type="radio" name={id} checked={answers[id] === "yes"} onChange={() => setAnswers({ ...answers, [id]: "yes" })} /> Yes</label><label><input type="radio" name={id} checked={answers[id] === "no"} onChange={() => setAnswers({ ...answers, [id]: "no" })} /> No</label></div></fieldset>)}{message && <p className="message" role="alert">{message}</p>}<button disabled={loading}>{loading ? "Submitting..." : "Confirm eligibility and apply"}</button></form></>}{view === "ineligible" && <><span className="modal-icon material-symbols-outlined">info</span><p className="eyebrow">Eligibility review</p><h2 id="application-title">This role may not be the right fit today.</h2><p>Based on your responses, you do not meet all essential requirements. Explore other opportunities or contact our support team for guidance.</p><button className="modal-primary" onClick={close}>Browse other roles</button></>}{view === "success" && <><span className="modal-icon success material-symbols-outlined">check_circle</span><p className="eyebrow">Application received</p><h2 id="application-title">You are all set.</h2><p>Your eligibility has been confirmed and your application for <strong>{selectedJob.title}</strong> has been sent to the partner organisation.</p><button className="modal-primary" onClick={close}>Back to opportunities</button></>}</section></div>}</div>;
}