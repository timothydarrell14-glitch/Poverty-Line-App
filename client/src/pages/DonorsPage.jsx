import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DonationPopup from "../components/DonationPopup";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import { getCurrentUser, isAuthenticated } from "../utils/auth";
import "../styles/Donors.css";
import "../styles/Donors.dark.css";

const formatCurrency = (amount) => `KSh ${Number(amount || 0).toLocaleString()}`;

export default function DonorsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDonationPopupOpen, setIsDonationPopupOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [detailsProgram, setDetailsProgram] = useState(null);
  const [activeProgramFilter, setActiveProgramFilter] = useState("all");
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState("");
  const [donationHistory, setDonationHistory] = useState([]);
  const [mpesaWaiting, setMpesaWaiting] = useState(null);
  const { showToast } = useToast();

  const loadDonationHistory = useCallback(() => {
    if (!isAuthenticated()) return;
    apiRequest("/api/donations/mine")
      .then((data) => setDonationHistory(data.donations ?? []))
      .catch(() => setDonationHistory([]));
  }, []);

  const showDonationNotice = (programId = null) => {
    if (programId) {
      setSelectedProgram(programId);
    } else {
      setSelectedProgram(null);
    }
    setIsDonationPopupOpen(true);
  };

  const showProgramDetails = (program) => {
    setDetailsProgram(program);
  };

  const closeProgramDetails = () => {
    setDetailsProgram(null);
  };

  const handleProgramFilter = (filter) => {
    setActiveProgramFilter(filter);
  };

  const programsWithTypes = programs.map((program) => ({
    ...program,
    category: program.type,
    program_kind: program.program_kind || "financial",
  }));

  const filteredPrograms = activeProgramFilter === "all"
    ? programsWithTypes
    : programsWithTypes.filter((program) => program.program_kind === activeProgramFilter.replace("-", "_"));

  const handleDonationSubmit = async (donationData) => {
    if (donationData.kind === "non_financial") {
      showToast("Your non-financial donation request was submitted successfully.", "success");
      return;
    }

    try {
      const response = await apiRequest("/api/donations", {
        method: "POST",
        body: donationData,
      });

      // PayPal redirect
      if (response.payment?.approval_url) {
        window.location.assign(response.payment.approval_url);
        return;
      }

      // M-Pesa STK Prompt
      if (donationData.payment_method === "mpesa") {
        setMpesaWaiting({
          donationId: response.donation.donation_id,
          amount: response.donation.amount,
          phone: donationData.donor_phone || response.payment?.phone_number || "your mobile number",
          message: response.payment?.message || "STK PIN prompt sent to your phone.",
          sandboxSimulated: Boolean(response.payment?.sandbox_simulated),
        });
        showToast(
          response.payment?.sandbox_simulated
            ? "M-Pesa sandbox simulation started. Confirm the test payment below."
            : "M-Pesa prompt sent. Check your phone to complete donation.",
          "info"
        );
        return;
      }

      // Direct success
      if (response.donation?.payment_status === "completed" || response.payment?.status === "completed") {
        showToast("Donation successful. Thank you for your contribution!", "success");
        loadDonationHistory();
      } else {
        showToast(`Donation recorded. ${response.payment?.provider || "Payment"} is pending confirmation.`, "info");
        loadDonationHistory();
      }
    } catch (err) {
      showToast(err.message || "Could not complete donation.", "error");
    }
  };

  // M-Pesa Sandbox simulation trigger
  const handleConfirmSandboxMpesa = async (donationId) => {
    try {
      const result = await apiRequest(`/api/donations/${donationId}/confirm-sandbox`, {
        method: "POST",
      });
      showToast("M-Pesa payment simulated and confirmed successfully!", "success");
      setMpesaWaiting(null);
      loadDonationHistory();
      if (result.donation) {
        setSelectedReceipt(result.donation);
      }
    } catch (err) {
      showToast(err.message || "Could not confirm payment.", "error");
    }
  };

  // Poll M-Pesa status while waiting
  useEffect(() => {
    if (!mpesaWaiting?.donationId) return;
    const interval = setInterval(async () => {
      try {
        const data = await apiRequest(`/api/donations/${mpesaWaiting.donationId}/status`);
        if (data.payment_status === "completed") {
          clearInterval(interval);
          setMpesaWaiting(null);
          showToast("M-Pesa payment confirmed! Thank you for your support.", "success");
          loadDonationHistory();
          if (data.donation) {
            setSelectedReceipt(data.donation);
          }
        } else if (data.payment_status === "failed") {
          clearInterval(interval);
          setMpesaWaiting(null);
          showToast("M-Pesa payment was not completed or was cancelled.", "error");
          loadDonationHistory();
        }
      } catch {
        // Continue polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [mpesaWaiting, loadDonationHistory, showToast]);

  // Auth sync
  useEffect(() => {
    const syncLoginStatus = () => {
      setIsLoggedIn(isAuthenticated());
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("storage", syncLoginStatus);
    window.addEventListener("povertyline-auth-change", syncLoginStatus);
    return () => {
      window.removeEventListener("storage", syncLoginStatus);
      window.removeEventListener("povertyline-auth-change", syncLoginStatus);
    };
  }, []);

  // Fetch active programs
  useEffect(() => {
    apiRequest("/api/programs?active=true")
      .then((data) => setPrograms(data.programs ?? []))
      .catch((error) => {
        setPrograms([]);
        setProgramsError(error.message || "Could not load programs.");
      })
      .finally(() => setProgramsLoading(false));
  }, []);

  // Fetch history when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadDonationHistory();
    }
  }, [isLoggedIn, loadDonationHistory]);

  // PayPal capture return hook
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const donationId = query.get("donation_id");
    const orderId = query.get("token");
    if (!donationId || !orderId) return;

    apiRequest("/api/donations/payments/paypal/capture", {
      method: "POST",
      body: { donation_id: Number(donationId), order_id: orderId },
    })
      .then((res) => {
        showToast("PayPal donation successful! Thank you for your contribution.", "success");
        window.history.replaceState({}, "", window.location.pathname);
        loadDonationHistory();
        if (res.donation) {
          setSelectedReceipt(res.donation);
        }
      })
      .catch(() => {
        showToast("PayPal payment could not be confirmed.", "error");
        window.history.replaceState({}, "", window.location.pathname);
      });
  }, [loadDonationHistory, showToast]);

  // Calculate dynamic metrics
  const completedDonations = donationHistory.filter((d) => d.payment_status === "completed");
  const completedKesDonations = completedDonations.filter((d) => d.currency === "KES");
  const totalGiven = completedKesDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const uniqueProgramsSupported = new Set(
    completedDonations.map((d) => d.program_id || d.program_title).filter(Boolean)
  ).size;

  const donorFirstName = currentUser?.first_name || "Valued";
  const donorLastName = currentUser?.last_name || "Donor";
  const donorFullName = `${donorFirstName} ${donorLastName}`.trim();
  const donorInitials = (
    (donorFirstName[0] || "D") + (donorLastName[0] || "")
  ).toUpperCase();
  const activeProgramCount = programsWithTypes.length;

  if (!isLoggedIn) {
    return (
      <div className="donors-page">
        <Navbar onOpenLogin={() => showToast("Please log in to access your donor dashboard.", "info")} />
        <main className="public-donors-content">
          <section className="public-donors-hero">
            <div className="public-donors-copy">
              <span className="public-eyebrow"><span className="material-symbols-outlined material-symbols-fill">favorite</span> Empowering Resilient Futures</span>
              <h1>Together, We Bring Hope and <em>Change Lives</em></h1>
              <p>Your generous donations empower communities, provide essential resources, and create lasting sustainable change. Join us in making a difference today.</p>
              <div className="public-hero-actions"><button type="button" className="public-primary-button" onClick={() => showDonationNotice()}><span className="material-symbols-outlined">volunteer_activism</span> Make a Donation</button></div>
            </div>
            <img className="public-hero-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy3M80B5UbKEYaAg7SzGUdGfva1q6-sb_S_FpyZgCcVzlY3LwQjBEJ6Q2H21Fj6GLhM_2Eh4tS1BdFlkDf-xsfq65T608S7RqIEMbMui4tIA7Cgh5TAFbBN6uBBAZiHIn2VT2xR-TFiQgxW9oAQgu49O8EYBI8ljGOpLllhJkOuJwJ9pkTgqSPmUb0-ES1aLoJzfBTVO3MQXpTqML1MMgfoDV3_J0bGZLYz5UhQyfdA0NgVOwm8nmPpA" alt="Community food and essentials distribution" />
          </section>
          <section className="public-programs" id="active-programs-section">
            <header>
              <div>
                <h2>Active Programs</h2>
                <p>Choose where your support creates direct, transparent, and durable impact.</p>
              </div>
              <button type="button" onClick={() => showDonationNotice()}>Custom allocation <span className="material-symbols-outlined">arrow_forward</span></button>
            </header>
            
            {/* Program Filter Navigation */}
            <div className="program-filter-nav">
              <button 
                type="button" 
                className={`filter-tab ${activeProgramFilter === "all" ? "active" : ""}`}
                onClick={() => handleProgramFilter("all")}
              >
                All Programs
              </button>
              <button 
                type="button" 
                className={`filter-tab ${activeProgramFilter === "financial" ? "active" : ""}`}
                onClick={() => handleProgramFilter("financial")}
              >
                Financial Programs
              </button>
              <button 
                type="button" 
                className={`filter-tab ${activeProgramFilter === "non-financial" ? "active" : ""}`}
                onClick={() => handleProgramFilter("non-financial")}
              >
                Non-Financial Programs
              </button>
            </div>
            
            <div className="public-program-grid">
              {programsLoading && <p className="programs-list__empty">Loading programs...</p>}
              {!programsLoading && programsError && <p className="programs-list__empty" role="alert">{programsError} Start the backend on port 5000 and try again.</p>}
              {!programsLoading && !programsError && filteredPrograms.map((program) => (
                <article key={program.id} className="public-program-card">
                  <div className="public-program-image">
                    {program.image_url && <img src={program.image_url} alt={program.title} />}
                    <span><span className="material-symbols-outlined">{program.icon}</span>{program.category}</span>
                  </div>
                  <div className="public-program-copy">
                    <div>
                      <h3>{program.title}</h3>
                      <p>{program.description}</p>
                    </div>
                    {program.program_kind === "financial" && program.funding_goal > 0 &&
                      <div className="public-progress">
                        <p><span>Goal: {program.funding_goal.toLocaleString()} {program.currency || "KES"}</span><b>{Math.min(100, Math.round((program.funding_raised / program.funding_goal) * 100))}% Funded</b></p>
                        <i><i style={{ width: `${Math.min(100, (program.funding_raised / program.funding_goal) * 100)}%` }} /></i>
                      </div>
                    }
                    {program.program_kind === "non_financial" && program.progress_target > 0 &&
                      <div className="public-progress">
                        <p><span>Target: {program.progress_target.toLocaleString()} {program.progress_unit || "items"}</span><b>{Math.min(100, Math.round((program.progress_value / program.progress_target) * 100))}% Acquired</b></p>
                        <i><i style={{ width: `${Math.min(100, (program.progress_value / program.progress_target) * 100)}%` }} /></i>
                      </div>
                    }
                    <div className="public-program-footer">
                      <p><span className="material-symbols-outlined">verified</span>{program.impact}</p>
                      <div>
                        <button type="button" onClick={() => showDonationNotice(program.id)}>Support Program <span className="material-symbols-outlined">arrow_forward</span></button>
                        <button type="button" onClick={() => showProgramDetails(program)}>View details</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {!programsLoading && !programsError && !filteredPrograms.length && <p className="programs-list__empty">No active programs are available.</p>}
            </div>
          </section>
          <section className="public-transparency"><div><span><span className="material-symbols-outlined">shield</span> 100% Transparency Commitment</span><h2>Every cent tracked with open accountability.</h2><p>All program logistics and expenditures are audited every month. Donors receive live updates and dispatch confirmations as provisions reach local distribution hubs.</p></div><button type="button" onClick={() => showDonationNotice()}><span className="material-symbols-outlined">volunteer_activism</span> Make a Donation</button></section>
        </main>
        <Footer onSelectTab={(tab) => navigate(tab === "home" ? "/" : `/${tab}`)} />

        {/* Program Details Popup Modal */}
        {detailsProgram && (
          <div className="program-popup-backdrop" role="presentation" onClick={closeProgramDetails}>
            <div className="program-popup-modal" role="dialog" aria-modal="true" aria-labelledby="prog-popup-title" onClick={(e) => e.stopPropagation()}>
              <div className="program-popup-header">
                <h3 id="prog-popup-title">{detailsProgram.title}</h3>
                <button type="button" className="program-popup-close" onClick={closeProgramDetails} aria-label="Close details">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="program-popup-body">
                {detailsProgram.image_url && (
                  <img className="program-popup-image" src={detailsProgram.image_url} alt={detailsProgram.title} />
                )}
                <div className="program-popup-tags">
                  {(detailsProgram.category || detailsProgram.type) && (
                    <span className="program-popup-tag">
                      <span className="material-symbols-outlined">{detailsProgram.icon || "category"}</span>
                      {detailsProgram.category || detailsProgram.type}
                    </span>
                  )}
                  {detailsProgram.location && (
                    <span className="program-popup-tag">
                      <span className="material-symbols-outlined">location_on</span>
                      {detailsProgram.location}
                    </span>
                  )}
                </div>
                <p>{detailsProgram.long_description || detailsProgram.description}</p>
                {detailsProgram.funding_goal > 0 && (
                  <div className="public-progress" style={{ marginTop: "12px" }}>
                    <p>
                      <span>Goal: {detailsProgram.funding_goal.toLocaleString()} {detailsProgram.currency || "KES"}</span>
                      <b>{Math.min(100, Math.round(((detailsProgram.funding_raised || 0) / detailsProgram.funding_goal) * 100))}% Funded</b>
                    </p>
                    <i>
                      <i style={{ width: `${Math.min(100, ((detailsProgram.funding_raised || 0) / detailsProgram.funding_goal) * 100)}%` }} />
                    </i>
                  </div>
                )}
              </div>
              <div className="program-popup-footer">
                <button type="button" className="program-popup-cancel-btn" onClick={closeProgramDetails}>
                  Close
                </button>
                <button
                  type="button"
                  className="program-popup-donate-btn"
                  onClick={() => {
                    const pId = detailsProgram.id;
                    closeProgramDetails();
                    showDonationNotice(pId);
                  }}
                >
                  <span className="material-symbols-outlined">volunteer_activism</span> Donate to this Program
                </button>
              </div>
            </div>
          </div>
        )}

        <DonationPopup
          isOpen={isDonationPopupOpen}
          onClose={() => {
            setIsDonationPopupOpen(false);
            setSelectedProgram(null);
          }}
          programs={programsWithTypes}
          onDonate={handleDonationSubmit}
          selectedProgramId={selectedProgram}
        />
      </div>
    );
  }

  return (
    <div className="donors-page">
      <Navbar onOpenDonate={() => showDonationNotice()} />
      <main className="donors-content">

        {/* Welcome Banner */}
        <section className="donor-welcome-card">
          <div className="donor-profile">
            <div className="donor-avatar" aria-hidden="true">{donorInitials}</div>
            <div>
              <h1>Hello, {donorFirstName}.</h1>
              <p>Welcome to your Donor Dashboard. Track your giving, view official receipts, and empower communities across Kenya.</p>
            </div>
          </div>
          <button type="button" className="give-again-button" onClick={() => showDonationNotice()}>
            <span className="material-symbols-outlined material-symbols-fill">volunteer_activism</span> Make a Donation
          </button>
        </section>

        {/* Dynamic Metrics */}
        <section className="donor-metrics" aria-label="Donation impact summary">
          <article>
            <span>Total Given</span>
            <strong>{formatCurrency(totalGiven)}</strong>
            <small>{completedKesDonations.length} completed KES contribution{completedKesDonations.length === 1 ? "" : "s"}</small>
          </article>
          <article>
            <span>Donations Made</span>
            <strong>{completedDonations.length}</strong>
            <small>{donationHistory.length} total transaction records</small>
          </article>
          <article>
            <span>Programs Supported</span>
            <strong>{uniqueProgramsSupported}</strong>
            <small>Programs with completed contributions</small>
          </article>
          <article>
            <span>Active Programs</span>
            <strong>{activeProgramCount}</strong>
            <small>Programs currently accepting support</small>
          </article>
        </section>

        {/* Giving History */}
        <section className="donor-dashboard-grid">
          <article className="donor-panel history-panel">
            <h2>Your Giving History</h2>
            <p className="panel-description">Verifiable transaction records and tax-exempt official receipts.</p>
            <div className="history-table-wrap">
              {donationHistory.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "#6f7978" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "8px", display: "block" }}>receipt_long</span>
                  <p style={{ margin: "0 0 8px", fontWeight: "600" }}>No donations recorded yet.</p>
                  <p style={{ margin: "0 0 16px", fontSize: "13px" }}>Explore active programs below and make your first contribution!</p>
                  <button type="button" className="give-again-button" style={{ padding: "10px 18px", fontSize: "13px" }} onClick={() => showDonationNotice()}>
                    Donate Now
                  </button>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Program</th>
                      <th>Method &amp; Ref</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donationHistory.map((donation) => (
                      <tr key={donation.donation_id}>
                        <td>{donation.donation_date || "Recent"}</td>
                        <td>
                          <b>{donation.program_title || "General Community Fund"}</b>
                          <small>{donation.donor_name || donorFullName}</small>
                        </td>
                        <td>
                          <b style={{ textTransform: "uppercase" }}>{donation.payment_method}</b>
                          <small style={{ color: "#16803c", fontWeight: "600" }}>
                            {donation.transaction_code || donation.provider_reference || "N/A"}
                          </small>
                        </td>
                        <td className="amount">{formatCurrency(Number(donation.amount))}</td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "3px",
                            padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                            background: donation.payment_status === "completed" ? "#ecfdf3" : "#fef3c7",
                            color: donation.payment_status === "completed" ? "#16803c" : "#92400e",
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                              {donation.payment_status === "completed" ? "check_circle" : "hourglass_empty"}
                            </span>
                            {donation.payment_status.charAt(0).toUpperCase() + donation.payment_status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button type="button" className="receipt-button" onClick={() => setSelectedReceipt(donation)}>
                            <span className="material-symbols-outlined">download</span> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </article>

        </section>

        {/* Active Programs Section */}
        <section className="donor-programs-section">
          <div className="donor-section-header">
            <div>
              <h2>Programs You Can Support</h2>
              <p>Explore community initiatives, view full details, and contribute directly to any program.</p>
            </div>
            <button type="button" className="give-again-button" onClick={() => showDonationNotice()}>
              <span className="material-symbols-outlined">volunteer_activism</span> Make a Donation
            </button>
          </div>

          <div className="program-filter-nav">
            <button
              type="button"
              className={`filter-tab ${activeProgramFilter === "all" ? "active" : ""}`}
              onClick={() => handleProgramFilter("all")}
            >
              All Programs ({programsWithTypes.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${activeProgramFilter === "financial" ? "active" : ""}`}
              onClick={() => handleProgramFilter("financial")}
            >
              Financial
            </button>
            <button
              type="button"
              className={`filter-tab ${activeProgramFilter === "non-financial" ? "active" : ""}`}
              onClick={() => handleProgramFilter("non-financial")}
            >
              Non-Financial
            </button>
          </div>

          <div className="public-program-grid">
            {programsLoading && <p className="programs-list__empty">Loading programs...</p>}
            {!programsLoading && programsError && (
              <p className="programs-list__empty" role="alert">{programsError}</p>
            )}
            {!programsLoading && !programsError && filteredPrograms.map((program) => (
              <article key={program.id} className="public-program-card">
                <div
                  className="public-program-image"
                  style={{ cursor: "pointer" }}
                  onClick={() => showProgramDetails(program)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && showProgramDetails(program)}
                >
                  {program.image_url && <img src={program.image_url} alt={program.title} />}
                  <span>
                    <span className="material-symbols-outlined">{program.icon || "volunteer_activism"}</span>
                    {program.category || program.type}
                  </span>
                </div>
                <div className="public-program-copy">
                  <div>
                    <h3
                      style={{ cursor: "pointer" }}
                      onClick={() => showProgramDetails(program)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && showProgramDetails(program)}
                    >
                      {program.title}
                    </h3>
                    <p>{program.description}</p>
                  </div>
                  {program.program_kind === "financial" && program.funding_goal > 0 && (
                    <div className="public-progress">
                      <p>
                        <span>Goal: {program.funding_goal.toLocaleString()} {program.currency || "KES"}</span>
                        <b>{Math.min(100, Math.round(((program.funding_raised || 0) / program.funding_goal) * 100))}% Funded</b>
                      </p>
                      <i><i style={{ width: `${Math.min(100, ((program.funding_raised || 0) / program.funding_goal) * 100)}%` }} /></i>
                    </div>
                  )}
                    <div className="public-program-footer">
                      {program.impact && <p><span className="material-symbols-outlined">verified</span>{program.impact}</p>}
                    <div>
                      <button type="button" onClick={() => showDonationNotice(program.id)}>
                        Support Program <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                      <button type="button" onClick={() => showProgramDetails(program)}>
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {!programsLoading && !programsError && !filteredPrograms.length && (
              <p className="programs-list__empty">No active programs are available right now.</p>
            )}
          </div>
        </section>
      </main>

      <Footer onSelectTab={(tab) => navigate(tab === "home" ? "/" : `/${tab}`)} />

      {/* Program Details Popup Modal (Dashboard) */}
      {detailsProgram && (
        <div className="program-popup-backdrop" role="presentation" onClick={closeProgramDetails}>
          <div className="program-popup-modal" role="dialog" aria-modal="true" aria-labelledby="dash-popup-title" onClick={(e) => e.stopPropagation()}>
            <div className="program-popup-header">
              <h3 id="dash-popup-title">{detailsProgram.title}</h3>
              <button type="button" className="program-popup-close" onClick={closeProgramDetails} aria-label="Close details">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="program-popup-body">
              {detailsProgram.image_url && (
                <img className="program-popup-image" src={detailsProgram.image_url} alt={detailsProgram.title} />
              )}
              <div className="program-popup-tags">
                {(detailsProgram.category || detailsProgram.type) && (
                  <span className="program-popup-tag">
                    <span className="material-symbols-outlined">{detailsProgram.icon || "category"}</span>
                    {detailsProgram.category || detailsProgram.type}
                  </span>
                )}
                {detailsProgram.location && (
                  <span className="program-popup-tag">
                    <span className="material-symbols-outlined">location_on</span>
                    {detailsProgram.location}
                  </span>
                )}
              </div>
              <p>{detailsProgram.long_description || detailsProgram.description}</p>
              {detailsProgram.funding_goal > 0 && (
                <div className="public-progress" style={{ marginTop: "12px" }}>
                  <p>
                    <span>Goal: {detailsProgram.funding_goal.toLocaleString()} {detailsProgram.currency || "KES"}</span>
                    <b>{Math.min(100, Math.round(((detailsProgram.funding_raised || 0) / detailsProgram.funding_goal) * 100))}% Funded</b>
                  </p>
                  <i>
                    <i style={{ width: `${Math.min(100, ((detailsProgram.funding_raised || 0) / detailsProgram.funding_goal) * 100)}%` }} />
                  </i>
                </div>
              )}
            </div>
            <div className="program-popup-footer">
              <button type="button" className="program-popup-cancel-btn" onClick={closeProgramDetails}>
                Close
              </button>
              <button
                type="button"
                className="program-popup-donate-btn"
                onClick={() => {
                  const pId = detailsProgram.id;
                  closeProgramDetails();
                  showDonationNotice(pId);
                }}
              >
                <span className="material-symbols-outlined">volunteer_activism</span> Donate to this Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa STK Pending Modal */}
      {mpesaWaiting && (
        <div className="mpesa-modal-backdrop" role="presentation">
          <div className="mpesa-modal" role="dialog" aria-modal="true" aria-labelledby="mpesa-title">
            <div className="mpesa-modal-icon">
              <span className="material-symbols-outlined">phonelink_ring</span>
            </div>
            <h2 id="mpesa-title">{mpesaWaiting.sandboxSimulated ? "M-Pesa Sandbox Simulation" : "M-Pesa Prompt Sent"}</h2>
            {mpesaWaiting.sandboxSimulated ? (
              <p>{mpesaWaiting.message}</p>
            ) : (
              <>
                <p>Please check your phone to approve the payment:</p>
                <span className="mpesa-phone-highlight">{mpesaWaiting.phone}</span>
                <p>Enter your <strong>M-Pesa PIN</strong> to confirm <strong>{formatCurrency(mpesaWaiting.amount)}</strong>.</p>
              </>
            )}
            <div className="mpesa-spinner-box">
              <div className="mpesa-spinner" />
              <span>{mpesaWaiting.sandboxSimulated ? "Awaiting sandbox confirmation..." : "Awaiting confirmation..."}</span>
            </div>
            <div className="mpesa-actions">
              {mpesaWaiting.sandboxSimulated && (
                <button
                  type="button"
                  className="mpesa-simulate-btn"
                  onClick={() => handleConfirmSandboxMpesa(mpesaWaiting.donationId)}
                >
                  ⚡ Simulate PIN Entered (Sandbox)
                </button>
              )}
              <button type="button" className="mpesa-close-btn" onClick={() => setMpesaWaiting(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="donor-modal-backdrop" role="presentation" onMouseDown={() => setSelectedReceipt(null)}>
          <section className="donor-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <h2 id="receipt-title">Official Donation Receipt</h2>
                <p>PovertyLine Kenya Trust • Tax Exempt</p>
              </div>
              <button type="button" aria-label="Close receipt" onClick={() => setSelectedReceipt(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className="receipt-details">
              <p><span>Receipt No:</span><b>{selectedReceipt.transaction_code || `REC-${selectedReceipt.donation_id}`}</b></p>
              <p><span>Donor Name:</span><b>{selectedReceipt.donor_name || donorFullName}</b></p>
              <p><span>Program:</span><b>{selectedReceipt.program_title || "General Community Fund"}</b></p>
              <p><span>Date of Issue:</span><b>{selectedReceipt.donation_date || "Today"}</b></p>
              <p><span>Payment Gateway:</span><b style={{ textTransform: "uppercase" }}>{selectedReceipt.payment_method}</b></p>
              <p><span>Reference Code:</span><b className="mpesa-code">{selectedReceipt.transaction_code || selectedReceipt.provider_reference || "VERIFIED"}</b></p>
              <p className="receipt-total"><span>Total Amount Paid:</span><b>{formatCurrency(selectedReceipt.amount)}</b></p>
            </div>
            <footer>
              <button type="button" className="print-button" onClick={() => window.print()}>
                <span className="material-symbols-outlined">print</span> Print / Save PDF
              </button>
              <button type="button" className="close-button" onClick={() => setSelectedReceipt(null)}>Close</button>
            </footer>
          </section>
        </div>
      )}

      {/* Donation Popup */}
      <DonationPopup
        key={isDonationPopupOpen ? `open-${selectedProgram || "general"}` : "closed"}
        isOpen={isDonationPopupOpen}
        onClose={() => {
          setIsDonationPopupOpen(false);
          setSelectedProgram(null);
        }}
        programs={programsWithTypes}
        onDonate={handleDonationSubmit}
        selectedProgramId={selectedProgram}
      />

    </div>
  );
}
