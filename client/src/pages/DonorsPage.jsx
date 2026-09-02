import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DonationPopup from "../components/DonationPopup";
import { apiRequest } from "../api/client";
import "../styles/Donors.css";

const impactUpdates = [
  { time: "Today", county: "Machakos County", title: "Clean water & solar pump commissioned in Machakos", summary: "Your contribution helped fund 3 new solar boreholes and a sand dam in Mwala, serving over 1,200 families with clean potable water.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=80", auditor: "Maji Safi Kenya Quality Inspector #41" },
  { time: "Last Week", county: "Kiambu County", title: "Scholarships awarded in Kiambu", summary: "25 students received full tuition and tablet devices for the upcoming academic term in Githunguri.", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80", auditor: "Elimu Mashinani Field Coordinator" },
  { time: "2 Weeks Ago", county: "Kericho & Trans Nzoia", title: "Kericho co-op harvest boosts food resilience", summary: "Distributed drip irrigation kits to 140 smallholder farmers, boosting food resilience by 65%.", auditor: "Kilimo Endelevu Rift Agronomist" },
];

const formatCurrency = (amount) => `KSh ${amount.toLocaleString()}`;

const isUserLoggedIn = () =>
  sessionStorage.getItem("povertyLineLoggedIn") === "true";

export default function DonorsPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [monthlyAmount, setMonthlyAmount] = useState(2500);
  const [subscriptionStatus, setSubscriptionStatus] = useState("Active");
  const [isDonationPopupOpen, setIsDonationPopupOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [learnMoreProgram, setLearnMoreProgram] = useState(null);
  const [activeProgramFilter, setActiveProgramFilter] = useState("all");
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState("");
  const [donationHistory, setDonationHistory] = useState([]);
  const totalGiven = donationHistory.reduce((total, donation) => total + Number(donation.amount), 0);

  const showDonationNotice = (programId = null) => {
    if (programId) {
      setSelectedProgram(programId);
    } else {
      setSelectedProgram(null);
    }
    setIsDonationPopupOpen(true);
  };

  const showLearnMore = (program) => {
    setLearnMoreProgram(program);
    setIsLearnMoreOpen(true);
  };

  const closeLearnMore = () => {
    setIsLearnMoreOpen(false);
    setLearnMoreProgram(null);
  };

  const handleProgramFilter = (filter) => {
    setActiveProgramFilter(filter);
  };

  // Add type to existing programs for filtering
  const programsWithTypes = programs.map(program => ({
    ...program,
    category: program.type,
    program_kind: program.program_kind || "financial",
  }));

  // Filter programs based on the active filter
  const filteredPrograms = activeProgramFilter === "all" 
    ? programsWithTypes 
    : programsWithTypes.filter(program => program.program_kind === activeProgramFilter.replace("-", "_"));

  const handleDonationSubmit = async (donationData) => {
    if (donationData.kind === "non_financial") {
      window.alert("Non-financial donation details received.");
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
    window.alert(
      `Donation recorded. ${response.payment.provider} payment is pending confirmation.`
    );
  };

  useEffect(() => {
    const syncLoginStatus = () => setIsLoggedIn(isUserLoggedIn());
    window.addEventListener("storage", syncLoginStatus);
    return () => window.removeEventListener("storage", syncLoginStatus);
  }, []);

  useEffect(() => {
    apiRequest("/api/programs?active=true")
      .then((data) => setPrograms(data.programs ?? []))
      .catch((error) => {
        setPrograms([]);
        setProgramsError(error.message || "Could not load programs.");
      })
      .finally(() => setProgramsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    apiRequest("/api/donations/mine")
      .then((data) => setDonationHistory(data.donations ?? []))
      .catch(() => setDonationHistory([]));
  }, [isLoggedIn]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const donationId = query.get("donation_id");
    const orderId = query.get("token");
    if (!donationId || !orderId) return;
    apiRequest("/api/donations/payments/paypal/capture", {
      method: "POST",
      body: { donation_id: Number(donationId), order_id: orderId },
    }).then(() => {
      window.history.replaceState({}, "", window.location.pathname);
    }).catch(() => {
      window.alert("PayPal payment could not be confirmed.");
    });
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="donors-page">
        <Navbar onOpenLogin={() => window.alert("Please log in to access your donor dashboard.")} />
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
                        <button type="button" onClick={() => showLearnMore(program)}>Learn more</button>
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

        {/* Learn More Popup */}
        {isLearnMoreOpen && learnMoreProgram && (
          <div className="learn-more-backdrop" onClick={closeLearnMore}>
            <div className="learn-more-popup" onClick={(e) => e.stopPropagation()}>
              <button className="learn-more-close" onClick={closeLearnMore}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3>{learnMoreProgram.title}</h3>
              {learnMoreProgram.image_url && <img src={learnMoreProgram.image_url} alt="" />}
              <p>{learnMoreProgram.long_description || learnMoreProgram.description}</p>
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
      <Navbar onOpenDonate={() => showDonationNotice()} onOpenLogin={() => window.alert("Login will be available soon.")} />
      <main className="donors-content">
        <section className="donor-welcome-card">
          <div className="donor-profile">
            <div className="donor-avatar" aria-hidden="true">SM</div>
            <div>
              <span className="donor-tier"><span className="material-symbols-outlined">auto_awesome</span> Gold Tier Donor</span>
              <h1>Hello, Sarah.</h1>
              <p>Here&apos;s the direct community impact you&apos;re making across Kenya today.</p>
            </div>
          </div>
          <button type="button" className="give-again-button" onClick={showDonationNotice}>
            <span className="material-symbols-outlined material-symbols-fill">favorite</span> Give Again
          </button>
        </section>

        <section className="donor-metrics" aria-label="Donation impact summary">
          <article><span>Total Given</span><strong>{formatCurrency(totalGiven)}</strong><small className="verified"><span className="material-symbols-outlined">check_circle</span> 100% Verified Disbursements</small></article>
          <article><span>Programs Supported</span><strong>4</strong><small>Water, Education, Agriculture</small></article>
          <article><span>Communities</span><strong>3</strong><small>Machakos, Kiambu, Nairobi</small></article>
          <article><span>Active Subscriptions</span><strong>{subscriptionStatus === "Active" ? "2" : "1"}</strong><small className="subscription-note">Monthly M-PESA Auto-Direct</small></article>
        </section>

        <section className="monthly-giving-card">
          <div>
            <span className="commitment-label"><span className="material-symbols-outlined">sync</span> Active Monthly Commitment</span>
            <h2>Education Fund (Kiambu Youth Scholarships)</h2>
            <p>Amount: <b>{formatCurrency(monthlyAmount)}/mo</b><i>•</i> Next charge: Nov 1, 2024 <i>•</i> <em>Status: {subscriptionStatus}</em></p>
          </div>
          <button type="button" className="manage-button" onClick={() => setIsSubscriptionOpen(true)}><span className="material-symbols-outlined">settings</span> Manage Subscriptions</button>
        </section>

        <section className="donor-dashboard-grid">
          <article className="donor-panel history-panel">
            <h2>Giving History</h2><p className="panel-description">Verifiable transaction records and tax-exempt receipts.</p>
            <div className="history-table-wrap"><table><thead><tr><th>Date</th><th>Program</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
              <tbody>{donationHistory.map((donation) => <tr key={donation.donation_id}><td>{donation.donation_date}</td><td><b>{donation.program_title}</b><small>{donation.payment_method}</small></td><td className="amount">{formatCurrency(Number(donation.amount))}</td><td><span className="complete-status"><span className="material-symbols-outlined">check_circle</span> {donation.payment_status}</span></td><td><button type="button" className="receipt-button" onClick={() => setSelectedReceipt(donation)}><span className="material-symbols-outlined">download</span> Receipt</button></td></tr>)}</tbody>
            </table></div>
          </article>
          <aside className="donor-panel impact-panel">
            <h2>Impact Updates</h2><p className="panel-description">Real-time verified reports from the field.</p>
            <div className="impact-list">{impactUpdates.map((update) => <article className="impact-item" key={update.title}><div><span>{update.time}</span><small>{update.county}</small></div><h3>{update.title}</h3>{update.image && <img src={update.image} alt="" /> }<p>{update.summary}</p><b><span className="material-symbols-outlined">verified_user</span> Audited by {update.auditor}</b></article>)}</div>
          </aside>
        </section>
      </main>
      <Footer onSelectTab={(tab) => navigate(tab === "home" ? "/" : `/${tab}`)} />

      {selectedReceipt && <div className="donor-modal-backdrop" role="presentation" onMouseDown={() => setSelectedReceipt(null)}><section className="donor-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title" onMouseDown={(event) => event.stopPropagation()}><header><div><h2 id="receipt-title">Official Donation Receipt</h2><p>PovertyLine Kenya Trust • Tax Exempt</p></div><button type="button" aria-label="Close receipt" onClick={() => setSelectedReceipt(null)}><span className="material-symbols-outlined">close</span></button></header><div className="receipt-details"><p><span>Receipt No:</span><b>{selectedReceipt.receipt}</b></p><p><span>Donor Name:</span><b>Sarah Mwangi</b></p><p><span>Program:</span><b>{selectedReceipt.program}</b></p><p><span>Date of Issue:</span><b>{selectedReceipt.date}</b></p><p><span>Payment Gateway:</span><b>{selectedReceipt.method}</b></p><p><span>M-PESA Code:</span><b className="mpesa-code">{selectedReceipt.reference}</b></p><p className="receipt-total"><span>Total Amount Paid:</span><b>{formatCurrency(selectedReceipt.amount)}</b></p></div><footer><button type="button" className="print-button" onClick={() => window.print()}><span className="material-symbols-outlined">print</span> Print / Save PDF</button><button type="button" className="close-button" onClick={() => setSelectedReceipt(null)}>Close</button></footer></section></div>}

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

      {isSubscriptionOpen && <div className="donor-modal-backdrop" role="presentation" onMouseDown={() => setIsSubscriptionOpen(false)}><section className="donor-modal subscription-modal" role="dialog" aria-modal="true" aria-labelledby="subscription-title" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="subscription-title">Manage Monthly Giving</h2><button type="button" aria-label="Close subscription management" onClick={() => setIsSubscriptionOpen(false)}><span className="material-symbols-outlined">close</span></button></header><label>Monthly Contribution (KSh)</label><div className="amount-options">{[1000, 2500, 5000].map((amount) => <button type="button" className={monthlyAmount === amount ? "selected" : ""} onClick={() => setMonthlyAmount(amount)} key={amount}>{formatCurrency(amount)}</button>)}</div><div className="status-control"><div><b>Subscription Status</b><small>Currently {subscriptionStatus}</small></div><button type="button" onClick={() => setSubscriptionStatus(subscriptionStatus === "Active" ? "Paused" : "Active")}>{subscriptionStatus === "Active" ? "Pause Giving" : "Resume Giving"}</button></div><button type="button" className="save-button" onClick={() => setIsSubscriptionOpen(false)}>Save Settings</button></section></div>}
    </div>
  );
}
