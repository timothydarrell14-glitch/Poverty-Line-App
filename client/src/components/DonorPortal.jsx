import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";

const formatCurrency = (amount) => `KSh ${amount.toLocaleString()}`;

function ProgressBar({ percent }) {
  return (
    <div className="program-progress" aria-hidden="true">
      <div className="program-progress-track">
        <div className="program-progress-fill" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <small>{percent}% funded</small>
    </div>
  );
}

function ProgramCard({ program, onDonate }) {
  const percent = Math.round((program.funded / (program.goal || 1000000)) * 100);
  return (
    <article className="program-card">
      <img src={program.image} alt={program.title} />
      <div className="program-card-body">
        <h3>{program.title}</h3>
        <p className="muted">{program.category}</p>
        <p>{program.description}</p>
        <ProgressBar percent={percent} />
        <div className="program-actions">
          <button type="button" onClick={() => onDonate(program)}>Donate</button>
          <button type="button" onClick={() => window.alert('Program details coming soon')}>Details</button>
        </div>
      </div>
    </article>
  );
}

function MonthlyPledgeCard({ pledge, onManage }) {
  return (
    <div className="pledge-card">
      <h4>{pledge.title}</h4>
      <p>{formatCurrency(pledge.amount)}/mo • {pledge.nextCharge}</p>
      <div className="pledge-actions"><button type="button" onClick={() => onManage(pledge)}>Manage</button></div>
    </div>
  );
}

function DonationModal({ open, onClose, program, onSuccess }) {
  const [amount, setAmount] = useState(program ? Math.max(500, Math.round(program.goal * 0.01)) : 1000);
  const [method, setMethod] = useState("M-Pesa");
  const [name, setName] = useState("");

  if (!open) return null;

  const handleDonate = (e) => {
    e.preventDefault();
    const receipt = `REC-${Date.now().toString().slice(-6)}`;
    onSuccess({ program: program?.title || "General Fund", amount, method, name: name || "Guest", receipt });
    onClose();
  };

  return (
    <div className="donor-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="donor-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <h2>Make a Donation</h2>
          <button type="button" aria-label="Close" onClick={onClose}>✕</button>
        </header>
        <form onSubmit={handleDonate}>
          <label>Program</label>
          <input value={program?.title || "General Fund"} readOnly />
          <label>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <label>Amount (KSh)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={100} />
          <label>Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>M-Pesa</option>
            <option>Card</option>
            <option>Bank Transfer</option>
          </select>
          <footer>
            <button type="submit" className="primary">Donate {formatCurrency(amount)}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default function DonorPortal({ donations = [], programs = [], pledges = [], onNavigate }) {
  const [activeTab, setActiveTab] = useState("programs");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [toast, setToast] = useState(null);

  const totalGiven = useMemo(() => donations.reduce((s, d) => s + (d.amount || 0), 0), [donations]);

  const handleDonateClick = (program) => {
    setSelectedProgram(program);
    setModalOpen(true);
  };

  const handleSuccess = (receipt) => {
    setToast({ message: `Thank you — ${formatCurrency(receipt.amount)} received for ${receipt.program}`, receipt });
    setTimeout(() => setToast(null), 4500);
  };

  return (
    <div className="donor-portal">
      <div className="portal-header">
        <div>
          <h2>Your Donor Portal</h2>
          <p>Total given: <strong>{formatCurrency(totalGiven)}</strong></p>
        </div>
        <div className="portal-tabs">
          <button className={activeTab === "programs" ? "active" : ""} onClick={() => setActiveTab("programs")}>Programs</button>
          <button className={activeTab === "monthly" ? "active" : ""} onClick={() => setActiveTab("monthly")}>Monthly Giving</button>
          <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>History</button>
        </div>
      </div>

      <div className="portal-body">
        {activeTab === "programs" && (
          <section className="programs-grid">
            {programs.map((p) => <ProgramCard key={p.id} program={p} onDonate={handleDonateClick} />)}
          </section>
        )}

        {activeTab === "monthly" && (
          <section className="monthly-list">
            {pledges.map((pl) => <MonthlyPledgeCard key={pl.id} pledge={pl} onManage={() => window.alert('Manage pledge coming soon')} />)}
          </section>
        )}

        {activeTab === "history" && (
          <section className="history-list">
            <table>
              <thead><tr><th>Date</th><th>Program</th><th>Amount</th><th>Receipt</th></tr></thead>
              <tbody>{donations.map((d) => <tr key={d.id}><td>{d.date}</td><td>{d.program}</td><td>{formatCurrency(d.amount)}</td><td>{d.receipt}</td></tr>)}</tbody>
            </table>
          </section>
        )}
      </div>

      <DonationModal open={modalOpen} onClose={() => setModalOpen(false)} program={selectedProgram} onSuccess={handleSuccess} />

      {toast && <div className="donor-toast"><strong>Success</strong><p>{toast.message}</p></div>}
    </div>
  );
}

DonorPortal.propTypes = {
  donations: PropTypes.array,
  programs: PropTypes.array,
  pledges: PropTypes.array,
  onNavigate: PropTypes.func,
};
