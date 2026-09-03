import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiList,
  FiPlus,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import { apiUrl } from "../../api/client";
import { getAccessToken } from "../../utils/auth";
import { getDashboardStats } from "../../api/dashboard";
import { listDonations, listNonFinancialDonations } from "../../api/donations";
import "../../styles/Admin/ProgramsPage.css";

const filters = ["All", "Active", "Inactive"];
const pageSize = 6;
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" });
const emptyProgramForm = {
  title: "",
  summary: "",
  description: "",
  long_description: "",
  image_url: "",
  type: "",
  location: "",
  organisation_id: "",
  active: true,
  program_kind: "financial",
  funding_goal: "",
  progress_target: "",
  progress_value: "0",
  progress_unit: "",
};

function toFormState(program) {
  return {
    title: program.title ?? "",
    summary: program.summary ?? "",
    description: program.description ?? "",
    long_description: program.long_description ?? "",
    image_url: program.image_url ?? "",
    type: program.type ?? "",
    location: program.location ?? "",
    organisation_id: program.organisation_id ?? "",
    active: program.active,
    program_kind: program.program_kind ?? "financial",
    funding_goal: program.funding_goal ?? "",
    progress_target: program.progress_target ?? "",
    progress_value: program.progress_value ?? 0,
    progress_unit: program.progress_unit ?? "",
  };
}

function fundingPercent(program) {
  if (!program.funding_goal) return 0;
  return Math.min(100, Math.round((program.funding_raised / program.funding_goal) * 100));
}

function progressPercent(program) {
  if (!program.progress_target) return 0;
  return Math.min(100, Math.round((program.progress_value / program.progress_target) * 100));
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function Programs() {
  const [activeTab, setActiveTab] = useState("programs");
  const [donationsTab, setDonationsTab] = useState("financial");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [programs, setPrograms] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [stats, setStats] = useState({ activePrograms: 0, totalDonations: 0, donationsCount: 0 });
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [detailProgram, setDetailProgram] = useState(null);
  const [detailForm, setDetailForm] = useState(null);
  const [financialDonations, setFinancialDonations] = useState([]);
  const [nonFinancialDonations, setNonFinancialDonations] = useState([]);
  const [donationsLoaded, setDonationsLoaded] = useState(false);
  const [donationsPage, setDonationsPage] = useState(0);
  const token = getAccessToken();

  const loadPrograms = () => fetch(apiUrl("/api/auth/programs"), { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setPrograms(data.programs ?? []));

  useEffect(() => {
    loadPrograms().catch(() => setMessage("Could not load programs."));
    fetch(apiUrl("/api/auth/organisations"), { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setOrganisations(data.organisations ?? [])).catch(() => setOrganisations([]));
    getDashboardStats().then(setStats).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToDonations() {
    setActiveTab("donations");
    if (!donationsLoaded) {
      setDonationsLoaded(true);
      listDonations().then((data) => setFinancialDonations(data.donations ?? [])).catch(() => setMessage("Could not load donations."));
      listNonFinancialDonations().then((data) => setNonFinancialDonations(data.donations ?? [])).catch(() => setMessage("Could not load non-financial donations."));
    }
  }

  const visiblePrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return programs.filter(
      (program) =>
        (!term || program.title.toLowerCase().includes(term) ||
          program.description.toLowerCase().includes(term)) &&
        (activeFilter === "All" || (activeFilter === "Active" && program.active) ||
          (activeFilter === "Inactive" && !program.active))
    );
  }, [activeFilter, programs, searchTerm]);

  const visibleDonations = donationsTab === "financial" ? financialDonations : nonFinancialDonations;
  const pageDonations = visibleDonations.slice(donationsPage * pageSize, (donationsPage + 1) * pageSize);

  function buildProgramPayload(form) {
    return {
      ...form,
      funding_goal: form.program_kind === "financial" && form.funding_goal !== "" ? Number(form.funding_goal) : null,
      progress_target: form.program_kind === "non_financial" && form.progress_target !== "" ? Number(form.progress_target) : null,
      progress_value: form.program_kind === "non_financial" && form.progress_value !== "" ? Number(form.progress_value) : 0,
    };
  }

  async function submitProgram(event) {
    event.preventDefault();
    const response = await fetch(apiUrl("/api/auth/programs"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildProgramPayload(programForm)),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not create program.");
    setPrograms((current) => [data.program, ...current]);
    setMessage("Program created.");
    setShowCreateForm(false);
    setProgramForm(emptyProgramForm);
  }

  function openDetails(program) {
    setDetailProgram(program);
    setDetailForm(toFormState(program));
  }

  async function updateProgram(event) {
    event.preventDefault();
    if (!detailProgram) return;
    const response = await fetch(apiUrl(`/api/auth/programs/${detailProgram.id}`), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildProgramPayload(detailForm)),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not update program.");
    setPrograms((current) => current.map((item) => item.id === detailProgram.id ? data.program : item));
    setMessage("Program updated.");
    setDetailProgram(null);
    setDetailForm(null);
  }

  async function deleteProgram() {
    if (!detailProgram) return;
    if (!window.confirm(`Delete ${detailProgram.title}? This cannot be undone.`)) return;
    const response = await fetch(apiUrl(`/api/auth/programs/${detailProgram.id}`), { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || "Could not delete program.");
      return;
    }
    setPrograms((current) => current.filter((item) => item.id !== detailProgram.id));
    setMessage("Program deleted.");
    setDetailProgram(null);
    setDetailForm(null);
  }

  return (
    <div className="admin-programs">
      <AdminTopbar pageClass="admin-programs" searchId="program-search" placeholder="Search programs..." searchTerm={searchTerm} onSearchChange={(event) => setSearchTerm(event.target.value)} />

      <div className="admin-programs__body">
        <SideBar />
        <main className="admin-programs__main">
          <div className="admin-programs__heading">
            <div>
              <h1>Program Overview</h1>
              <p>Manage and monitor ongoing initiatives.</p>
            </div>
            {activeTab !== "donations" && (
              <button
                className="admin-programs__add-button"
                type="button"
                onClick={() => setShowCreateForm(true)}
              >
                <FiPlus aria-hidden="true" />
                <span>New Program</span>
              </button>
            )}
          </div>

          <nav className="admin-programs__tabs" role="tablist" aria-label="Program sections">
            {[{ id: "all", label: "All" }, { id: "programs", label: "Programs" }, { id: "donations", label: "Donations" }].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                className={`admin-programs__tab${activeTab === id ? " admin-programs__tab--active" : ""}`}
                onClick={() => {
                  if (id === "donations") {
                    goToDonations();
                    return;
                  }
                  setActiveTab(id);
                  setActiveFilter("All");
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeTab !== "donations" ? (
          <div className="admin-programs__content-grid">
            <section
              className="programs-list"
              aria-labelledby="programs-heading"
            >
              <div className="programs-list__header">
                <div
                  className="programs-list__filters"
                  role="group"
                  aria-label="Program status filters"
                >
                  {filters.map((filter) => (
                    <button
                      className={`programs-list__filter${activeFilter === filter ? " programs-list__filter--active" : ""}`}
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="programs-list__cards">
                {visiblePrograms.length ? (
                  visiblePrograms.map((program) => (
                    <article
                      className="programs-list__card"
                      key={program.id}
                    >
                      <div className="programs-list__card-image-container">
                        {program.image_url && <img
                          className="programs-list__card-image"
                          src={program.image_url}
                          alt={program.title}
                        />}
                      </div>
                      <div className="programs-list__card-content">
                        <h3>{program.title}</h3>
                        <p className="programs-list__card-description">{program.description}</p>
                        <span className={`programs-list__status programs-list__status--${program.active ? "on-track" : "draft"}`}>
                          {program.active ? "Active" : "Inactive"}
                        </span>
                        <div className="programs-list__progress">
                          {program.program_kind === "financial" && program.funding_goal > 0 && (
                            <div className="programs-list__progress-item">
                              <div className="programs-list__progress-header">
                                <span>Funding Goal</span>
                                <span>{currencyFormatter.format(program.funding_raised)} / {currencyFormatter.format(program.funding_goal)}</span>
                              </div>
                              <div className="programs-list__progress-bar">
                                <div
                                  className="programs-list__progress-fill"
                                  style={{ width: `${fundingPercent(program)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {program.program_kind === "non_financial" && program.progress_target > 0 && (
                            <div className="programs-list__progress-item">
                              <div className="programs-list__progress-header">
                                <span>{program.progress_unit || "Progress"}</span>
                                <span>{program.progress_value} / {program.progress_target}</span>
                              </div>
                              <div className="programs-list__progress-bar">
                                <div
                                  className="programs-list__progress-fill"
                                  style={{ width: `${progressPercent(program)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button className="programs-list__view-details" type="button" onClick={() => openDetails(program)}>
                          <span>View Details</span>
                          <FiChevronRight aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="programs-list__empty">
                    No programs match this search.
                  </p>
                )}
              </div>
            </section>

            <aside
              className="programs-impact"
              aria-labelledby="total-impact-heading"
            >
              <h2 id="total-impact-heading">Total Impact</h2>
              <p className="programs-impact__description">
                Across all programs, based on live donation records.
              </p>
              <div className="programs-impact__stats">
                <div className="programs-impact__stat">
                  <strong>{(stats.donationsCount ?? 0).toLocaleString()}</strong>
                  <span>TOTAL DONATIONS</span>
                </div>
                <div className="programs-impact__stat">
                  <strong>{currencyFormatter.format(stats.totalDonations ?? 0)}</strong>
                  <span>FUNDS DISBURSED</span>
                </div>
              </div>
              <button
                className="programs-impact__generate-report"
                type="button"
                onClick={goToDonations}
              >
                <FiList aria-hidden="true" />
                <span>View All</span>
              </button>
            </aside>
          </div>
          ) : (
          <div className="admin-programs__donations">
            <nav className="admin-programs__subtabs" role="tablist" aria-label="Donation type">
              <button type="button" role="tab" aria-selected={donationsTab === "financial"} className={`admin-programs__subtab${donationsTab === "financial" ? " admin-programs__subtab--active" : ""}`} onClick={() => { setDonationsTab("financial"); setDonationsPage(0); }}>
                <FiHeart aria-hidden="true" />
                <span>Financial Donations</span>
              </button>
              <button type="button" role="tab" aria-selected={donationsTab === "non_financial"} className={`admin-programs__subtab${donationsTab === "non_financial" ? " admin-programs__subtab--active" : ""}`} onClick={() => { setDonationsTab("non_financial"); setDonationsPage(0); }}>
                <FiUsers aria-hidden="true" />
                <span>Non-Financial Donations</span>
              </button>
            </nav>
            <section className="admin-programs__donations-table" aria-label={`${donationsTab} donations`}>
              <table>
                <thead>
                  {donationsTab === "financial" ? (
                    <tr><th>Donor</th><th>Program</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
                  ) : (
                    <tr><th>Donor</th><th>Program</th><th>Type</th><th>Description</th><th>Date</th></tr>
                  )}
                </thead>
                <tbody>
                  {pageDonations.length ? pageDonations.map((donation) => (
                    donationsTab === "financial" ? (
                      <tr key={donation.id}>
                        <td>{donation.donorName}</td>
                        <td>{donation.programTitle}</td>
                        <td>{currencyFormatter.format(donation.amount)}</td>
                        <td>{donation.paymentMethod || "—"}</td>
                        <td>{donation.status}</td>
                        <td>{donation.date}</td>
                      </tr>
                    ) : (
                      <tr key={donation.id}>
                        <td>{donation.donorName}</td>
                        <td>{donation.programTitle}</td>
                        <td>{donation.type}</td>
                        <td>{donation.description}</td>
                        <td>{donation.date}</td>
                      </tr>
                    )
                  )) : (
                    <tr><td className="admin-programs__donations-empty" colSpan={donationsTab === "financial" ? 6 : 5}>{message || "No donations found."}</td></tr>
                  )}
                </tbody>
              </table>
              <footer className="admin-programs__donations-pagination">
                <span>Showing {visibleDonations.length ? donationsPage * pageSize + 1 : 0} to {Math.min((donationsPage + 1) * pageSize, visibleDonations.length)} of {visibleDonations.length}</span>
                <div>
                  <button className="tooltip" type="button" aria-label="Previous page" data-tooltip="Previous page" disabled={donationsPage === 0} onClick={() => setDonationsPage((current) => current - 1)}>
                    <FiChevronLeft aria-hidden="true" />
                  </button>
                  <button className="tooltip" type="button" aria-label="Next page" data-tooltip="Next page" disabled={(donationsPage + 1) * pageSize >= visibleDonations.length} onClick={() => setDonationsPage((current) => current + 1)}>
                    <FiChevronRight aria-hidden="true" />
                  </button>
                </div>
              </footer>
            </section>
          </div>
          )}
          {message && <p role="status" className="admin-programs__message">{message}</p>}
        </main>
      </div>

      {showCreateForm && (
        <div className="admin-programs__modal-backdrop" role="presentation" onClick={() => setShowCreateForm(false)}>
          <form className="admin-programs__modal" onSubmit={submitProgram} onClick={(event) => event.stopPropagation()}>
            <h2>Create program</h2>
            <div className="admin-programs__modal-body">
              <label>Title
                <input value={programForm.title} onChange={(event) => setProgramForm((current) => ({ ...current, title: event.target.value }))} placeholder="Program title" required />
              </label>
              <label>Summary
                <input value={programForm.summary} onChange={(event) => setProgramForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Short summary" />
              </label>
              <label>Description
                <textarea value={programForm.description} onChange={(event) => setProgramForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={3} />
              </label>
              <label>Long description
                <textarea value={programForm.long_description} onChange={(event) => setProgramForm((current) => ({ ...current, long_description: event.target.value }))} placeholder="Full details shown to donors" rows={4} />
              </label>
              <label>Poster image URL
                <input type="url" value={programForm.image_url} onChange={(event) => setProgramForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="https://…" />
              </label>
              <label>Type
                <input value={programForm.type} onChange={(event) => setProgramForm((current) => ({ ...current, type: event.target.value }))} placeholder="e.g. Education, Agriculture" />
              </label>
              <label>Organisation
                <select value={programForm.organisation_id} onChange={(event) => setProgramForm((current) => ({ ...current, organisation_id: event.target.value }))} required>
                  <option value="">Select organisation</option>
                  {organisations.map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>{organisation.name}</option>
                  ))}
                </select>
              </label>
              <label>Location
                <input value={programForm.location} onChange={(event) => setProgramForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" />
              </label>
              <label>Program kind
                <select value={programForm.program_kind} onChange={(event) => setProgramForm((current) => ({ ...current, program_kind: event.target.value }))}>
                  <option value="financial">Financial (funding goal)</option>
                  <option value="non_financial">Non-financial (progress target)</option>
                </select>
              </label>
              {programForm.program_kind === "financial" ? (
                <label>Funding goal
                  <input type="number" min="0" value={programForm.funding_goal} onChange={(event) => setProgramForm((current) => ({ ...current, funding_goal: event.target.value }))} placeholder="e.g. 500000" />
                </label>
              ) : (
                <>
                  <label>Progress target
                    <input type="number" min="0" value={programForm.progress_target} onChange={(event) => setProgramForm((current) => ({ ...current, progress_target: event.target.value }))} placeholder="e.g. 1000" />
                  </label>
                  <label>Progress value
                    <input type="number" min="0" value={programForm.progress_value} onChange={(event) => setProgramForm((current) => ({ ...current, progress_value: event.target.value }))} placeholder="e.g. 0" />
                  </label>
                  <label>Progress unit
                    <input value={programForm.progress_unit} onChange={(event) => setProgramForm((current) => ({ ...current, progress_unit: event.target.value }))} placeholder="e.g. business kits" />
                  </label>
                </>
              )}
              <label>Status
                <select value={programForm.active} onChange={(event) => setProgramForm((current) => ({ ...current, active: event.target.value === "true" }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>
            <div className="admin-programs__modal-actions">
              <button type="button" className="admin-programs__modal-cancel" onClick={() => { setShowCreateForm(false); setProgramForm(emptyProgramForm); }}>Cancel</button>
              <button type="submit" className="admin-programs__modal-confirm">Save Program</button>
            </div>
          </form>
        </div>
      )}

      {detailProgram && detailForm && (
        <div className="admin-programs__modal-backdrop" role="presentation" onClick={() => setDetailProgram(null)}>
          <form className="admin-programs__modal" onSubmit={updateProgram} onClick={(event) => event.stopPropagation()}>
            <div className="admin-programs__modal-header">
              <h2>{detailProgram.title}</h2>
              <button type="button" aria-label="Close" onClick={() => setDetailProgram(null)}><FiX aria-hidden="true" /></button>
            </div>
            <div className="admin-programs__modal-body">
              {hasValue(detailForm.title) && <label>Title
                <input value={detailForm.title} onChange={(event) => setDetailForm((current) => ({ ...current, title: event.target.value }))} required />
              </label>}
              {hasValue(detailForm.description) && <label>Description
                <textarea value={detailForm.description} onChange={(event) => setDetailForm((current) => ({ ...current, description: event.target.value }))} rows={3} />
              </label>}
              {hasValue(detailForm.long_description) && <label>Long description
                <textarea value={detailForm.long_description} onChange={(event) => setDetailForm((current) => ({ ...current, long_description: event.target.value }))} rows={4} />
              </label>}
              {hasValue(detailForm.image_url) && <label>Poster image URL
                <input type="url" value={detailForm.image_url} onChange={(event) => setDetailForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="https://…" />
              </label>}
              {hasValue(detailForm.type) && <label>Type
                <input value={detailForm.type} onChange={(event) => setDetailForm((current) => ({ ...current, type: event.target.value }))} />
              </label>}
              {hasValue(detailForm.organisation_id) && organisations.some((organisation) => String(organisation.id) === String(detailForm.organisation_id)) && <label>Organisation
                <select value={detailForm.organisation_id} onChange={(event) => setDetailForm((current) => ({ ...current, organisation_id: event.target.value }))}>
                  {organisations.filter((organisation) => String(organisation.id) === String(detailForm.organisation_id)).map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>{organisation.name}</option>
                  ))}
                </select>
              </label>}
              {hasValue(detailForm.location) && <label>Location
                <input value={detailForm.location} onChange={(event) => setDetailForm((current) => ({ ...current, location: event.target.value }))} />
              </label>}
              {detailForm.program_kind === "financial" && hasValue(detailForm.funding_goal) ? (
                <label>Funding goal
                  <input type="number" min="0" value={detailForm.funding_goal} onChange={(event) => setDetailForm((current) => ({ ...current, funding_goal: event.target.value }))} />
                </label>
              ) : detailForm.program_kind === "non_financial" && (
                <>
                  {hasValue(detailForm.progress_target) && <label>Progress target
                    <input type="number" min="0" value={detailForm.progress_target} onChange={(event) => setDetailForm((current) => ({ ...current, progress_target: event.target.value }))} />
                  </label>}
                  {hasValue(detailForm.progress_value) && <label>Progress value
                    <input type="number" min="0" value={detailForm.progress_value} onChange={(event) => setDetailForm((current) => ({ ...current, progress_value: event.target.value }))} />
                  </label>}
                  {hasValue(detailForm.progress_unit) && <label>Progress unit
                    <input value={detailForm.progress_unit} onChange={(event) => setDetailForm((current) => ({ ...current, progress_unit: event.target.value }))} />
                  </label>}
                </>
              )}
              {hasValue(detailForm.active) && <label>Status
                <select value={detailForm.active} onChange={(event) => setDetailForm((current) => ({ ...current, active: event.target.value === "true" }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>}
            </div>
            <div className="admin-programs__modal-actions admin-programs__modal-actions--split">
              <button type="button" className="admin-programs__modal-danger" onClick={deleteProgram}><FiTrash2 aria-hidden="true" /> Delete</button>
              <div>
                <button type="button" className="admin-programs__modal-cancel" onClick={() => setDetailProgram(null)}>Close</button>
                <button type="submit" className="admin-programs__modal-confirm">Update Program</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Programs;
