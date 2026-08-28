import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

const formatCurrency = (amount) => `KSh ${amount.toLocaleString()}`;

export default function DonorsPage() {
  const navigate = useNavigate();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [monthlyAmount, setMonthlyAmount] = useState(2500);
  const [subscriptionStatus, setSubscriptionStatus] = useState("Active");
  const totalGiven = donations.reduce((total, donation) => total + donation.amount, 0);

  const showDonationNotice = () => {
    window.alert("The donation flow will be available here soon.");
  };

  return (
    <div className="donors-page">
      <Navbar onOpenDonate={showDonationNotice} onOpenLogin={() => window.alert("Login will be available soon.")} />
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

      {isSubscriptionOpen && <div className="donor-modal-backdrop" role="presentation" onMouseDown={() => setIsSubscriptionOpen(false)}><section className="donor-modal subscription-modal" role="dialog" aria-modal="true" aria-labelledby="subscription-title" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="subscription-title">Manage Monthly Giving</h2><button type="button" aria-label="Close subscription management" onClick={() => setIsSubscriptionOpen(false)}><span className="material-symbols-outlined">close</span></button></header><label>Monthly Contribution (KSh)</label><div className="amount-options">{[1000, 2500, 5000].map((amount) => <button type="button" className={monthlyAmount === amount ? "selected" : ""} onClick={() => setMonthlyAmount(amount)} key={amount}>{formatCurrency(amount)}</button>)}</div><div className="status-control"><div><b>Subscription Status</b><small>Currently {subscriptionStatus}</small></div><button type="button" onClick={() => setSubscriptionStatus(subscriptionStatus === "Active" ? "Paused" : "Active")}>{subscriptionStatus === "Active" ? "Pause Giving" : "Resume Giving"}</button></div><button type="button" className="save-button" onClick={() => setIsSubscriptionOpen(false)}>Save Settings</button></section></div>}
    </div>
  );
}
