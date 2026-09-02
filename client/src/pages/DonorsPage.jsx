import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DonationPopup from "../components/DonationPopup";
import "../styles/Donors.css";

const donations = [
  { id: "don-001", date: "Oct 12, 2024", program: "Clean Water Initiative - Kisumu", amount: 5000, receipt: "REC-2024-8849", method: "M-Pesa", reference: "RJK4992LK8" },
  { id: "don-002", date: "Sep 01, 2024", program: "Education Fund (Monthly)", amount: 2500, receipt: "REC-2024-7621", method: "M-Pesa", reference: "RI840131NX" },
  { id: "don-003", date: "Aug 15, 2024", program: "Emergency Relief - Floods", amount: 10000, receipt: "REC-2024-6510", method: "M-Pesa", reference: "RH194821OP" },
  { id: "don-004", date: "Aug 01, 2024", program: "Education Fund (Monthly)", amount: 2500, receipt: "REC-2024-5390", method: "M-Pesa", reference: "RG990142KA" },
  { id: "don-005", date: "Jul 01, 2024", program: "Education Fund (Monthly)", amount: 2500, receipt: "REC-2024-4211", method: "M-Pesa", reference: "RF711928LQ" },
  { id: "don-006", date: "May 10, 2024", program: "Sustainable Agriculture & Tea Farming", amount: 2500, receipt: "REC-2024-3199", method: "M-Pesa", reference: "RE449210PL" },
];

const impactUpdates = [
  { time: "Today", county: "Machakos County", title: "Clean water & solar pump commissioned in Machakos", summary: "Your contribution helped fund 3 new solar boreholes and a sand dam in Mwala, serving over 1,200 families with clean potable water.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=700&q=80", auditor: "Maji Safi Kenya Quality Inspector #41" },
  { time: "Last Week", county: "Kiambu County", title: "Scholarships awarded in Kiambu", summary: "25 students received full tuition and tablet devices for the upcoming academic term in Githunguri.", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80", auditor: "Elimu Mashinani Field Coordinator" },
  { time: "2 Weeks Ago", county: "Kericho & Trans Nzoia", title: "Kericho co-op harvest boosts food resilience", summary: "Distributed drip irrigation kits to 140 smallholder farmers, boosting food resilience by 65%.", auditor: "Kilimo Endelevu Rift Agronomist" },
];

const publicPrograms = [
  { id: "wells", title: "Sustainable Wells Initiative", category: "Clean Water", icon: "water_drop", description: "Building community-managed water infrastructure in drought-prone regions to ensure long-term health.", impact: "38,000+ people with ongoing access to verified clean water", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmNSg5zfE7DQ3zu5jpj5Zxxyv-P3AAA9BiSGKYxSlW2irxydJVOEb5SCAVHab0zd0X_NXRgsx9Q3_5x_mQqqm5j33uVZmAjGKZT2aSB0ArTXiTd9-t5i6bne2ufq2LMtQR8jD_hUaYQ6cLisWMt3gahkzoPp5-DMn96ZRgFic6yJOtBbgRS2qVKuJSLP_7jEZwV21k4cKg2og2XK-CdC2-_PmSZwYQWy8nd3Xj-zuvOxoTe9LwT1ChUA" },
  { id: "nutrition", title: "Urban Nutrition Centers", category: "Food Security", icon: "restaurant", description: "Providing dignified access to nutritious meals through community-led kitchens and local farm partnerships.", impact: "14,200 nutritious hot meals served every single week", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_nYDP1xQ8ebU7wdi6mFVIap80ikftYXPIAXzwTBRJfZ_3D9tIu3wAZS0WGnOrYslEHQKUKTtDZkbWObyTwFG6N5EsgaICBCzUhouo0XSHEnnb3ZZm3tEaSrs4LPTJbgF9h8CxZNgpK69HSdFb_CCBWgyxGzTUusU_ugcsTaW18PNOX5MESMrKSR3jUmBfBed3lC9jWjTWBk-y734hWnBuotUaDYQslcmGH5k5vYmy8jQnf5UC_Ijqyg" },
  { id: "literacy", title: "Digital Literacy Access", category: "Education", icon: "school", description: "Equipping adults and youth with essential tech skills to bridge the digital divide and open employment pathways.", impact: "1,840 graduates placed in living-wage career pathways", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDv-4_7XiKvt01r0Aw_OFZxR2Q-vkmIfbyWAKs_S4bOVBD9T7eRbWMa0pa_QdAy9SJaTCBa3Tdw9nP0Ab0AAn7_DErNvG3iphSY-UUXhuWn1po_I3zpPXZQ0Ka35fgsMXT9uHlNMsg_QAgaWY77bJkZOAtSyFaawffzMonEbLjUwMxOhmZsP1SyO1qcB3pZQS0mBk9Pm0t--Qn9QHtgRIco2uIleBcRbi18acrnOKbEyHMzQlDz5_9d1Q" },
  { id: "health", title: "Mobile Health Clinics", category: "Healthcare Access", icon: "medical_services", description: "Bringing essential medical services and health education directly to underserved neighborhoods through our fleet of mobile units.", impact: "65% funded • 9,400 clinic visits conducted this year", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD58UOor5Jf6HP23RKceLauPM03eh82qXCZBYAXfvoz1_rK5DNZuv7sv_Bkf2BSJb5Jhpp-M-KSulKhnF0Jq97h0gdeeQyUBlq9_bjAy0-7qtHD1Z68xJ_hfEScK2EDuZZfwnHPT7_PRXP-BuMhNgA9HeEbmyHOFdU99Qd36ct6P28LMtCef7lL1-arjnggsW7klvzzXunsdL5DtMKH4rzs1fSYBH1Sg26MCMqQU7-rOIhZLH-JfeI-WQ" },
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
  const totalGiven = donations.reduce((total, donation) => total + donation.amount, 0);

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
  const programsWithTypes = publicPrograms.map(program => ({
    ...program,
    type: program.id === "wells" || program.id === "nutrition" || program.id === "health" ? "financial" : "non-financial"
  }));

  // Filter programs based on the active filter
  const filteredPrograms = activeProgramFilter === "all" 
    ? programsWithTypes 
    : programsWithTypes.filter(program => program.type === activeProgramFilter);

  const handleDonationSubmit = (donationData) => {
    console.log("Donation submitted:", donationData);
    // Here you would typically call your backend API to process the donation
    window.alert(`Thank you for your donation of $${donationData.amount} to ${donationData.program}!`);
  };

  useEffect(() => {
    const syncLoginStatus = () => setIsLoggedIn(isUserLoggedIn());
    window.addEventListener("storage", syncLoginStatus);
    return () => window.removeEventListener("storage", syncLoginStatus);
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
              {filteredPrograms.map((program) => (
                <article key={program.id} className="public-program-card">
                  <div className="public-program-image">
                    <img src={program.image} alt={program.title} />
                    <span><span className="material-symbols-outlined">{program.icon}</span>{program.category}</span>
                  </div>
                  <div className="public-program-copy">
                    <div>
                      <h3>{program.title}</h3>
                      <p>{program.description}</p>
                    </div>
                    {program.id === "health" && 
                      <div className="public-progress">
                        <p><span>Campaign Goal: $1,000,000</span><b>65% Funded ($650K)</b></p>
                        <i><i /></i>
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
              <p>{learnMoreProgram.description}</p>
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
              <tbody>{donations.map((donation) => <tr key={donation.id}><td>{donation.date}</td><td><b>{donation.program}</b><small>{donation.method}</small></td><td className="amount">{formatCurrency(donation.amount)}</td><td><span className="complete-status"><span className="material-symbols-outlined">check_circle</span> Completed</span></td><td><button type="button" className="receipt-button" onClick={() => setSelectedReceipt(donation)}><span className="material-symbols-outlined">download</span> Receipt</button></td></tr>)}</tbody>
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
