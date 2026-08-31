import { useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiPlus,
  FiList,
} from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import { apiUrl } from "../../api/client";
import "../../styles/Admin/ProgramsPage.css";

const fallbackPrograms = [
  {
    id: 1,
    title: "Urban Nutrition",
    description: "Distributing fresh, locally sourced produce to urban food deserts.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80",
    status: "On Track",
    statusType: "on-track",
    budgetAllocation: { current: 50000, total: 100000 },
    familiesReached: { current: 1200, total: 2000 },
  },
  {
    id: 2,
    title: "Digital Literacy",
    description: "Equipping seniors with essential digital skills and affordable devices.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    status: "Review Needed",
    statusType: "review-needed",
    budgetAllocation: { current: 85000, total: 90000 },
    graduates: { current: 300, total: 500 },
  },
];

const filters = ["Active", "Draft", "Completed"];
const emptyProgramForm = { name: "", description: "", organisation_id: "", status: "Draft", location: "" };

function Programs() {
  const [activeFilter, setActiveFilter] = useState("Active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [statusProgram, setStatusProgram] = useState(null);
  const [statusDraft, setStatusDraft] = useState("Draft");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetch(apiUrl("/api/auth/programs"), { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setPrograms(data.programs?.length ? data.programs : fallbackPrograms)).catch(() => setPrograms(fallbackPrograms));
    fetch(apiUrl("/api/auth/organisations"), { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()).then((data) => setOrganisations(data.organisations ?? [])).catch(() => setOrganisations([]));
  }, [token]);

  const visiblePrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return programs.filter(
      (program) =>
        (!term || program.title.toLowerCase().includes(term) ||
          program.description.toLowerCase().includes(term)) &&
        (activeFilter === "All" || activeFilter === "Active" || program.status === activeFilter ||
         (activeFilter === "Draft" && program.statusType === "draft") ||
         (activeFilter === "Completed" && program.statusType === "completed"))
    );
  }, [activeFilter, programs, searchTerm]);

  async function submitProgram(event) {
    event.preventDefault();
    const response = await fetch(apiUrl("/api/auth/programs"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(programForm),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not create program.");
    setPrograms((current) => [data.program, ...current]);
    setMessage("Program created.");
    setShowCreateForm(false);
    setProgramForm(emptyProgramForm);
  }

  async function updateStatus() {
    if (!statusProgram) return;
    const response = await fetch(apiUrl(`/api/auth/programs/${statusProgram.id}`), {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusDraft }),
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message || "Could not update program status.");
    setPrograms((current) => current.map((item) => item.id === statusProgram.id ? data.program : item));
    setStatusProgram(null);
    setMessage("Status updated.");
  }

  const totalImpact = {
    individualsAssisted: 14200,
    fundsDisbursed: 1200000,
  };

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
            <button
              className="admin-programs__add-button"
              type="button"
              onClick={() => setShowCreateForm(true)}
            >
              <FiPlus aria-hidden="true" />
              <span>New Program</span>
            </button>
          </div>

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
                      className={`programs-list__card${selectedProgram === program.id ? " programs-list__card--selected" : ""}`}
                      key={program.id}
                      onClick={() => setSelectedProgram(program.id)}
                    >
                      <div className="programs-list__card-image-container">
                        {program.image && <img
                          className="programs-list__card-image"
                          src={program.image}
                          alt={program.title}
                        />}
                      </div>
                      <div className="programs-list__card-content">
                        <h3>{program.title}</h3>
                        <p className="programs-list__card-description">{program.description}</p>
                        <span className={`programs-list__status programs-list__status--${program.statusType}`}>
                          {program.status}
                        </span>
                        <div className="programs-list__progress">
                          {program.budgetAllocation && (
                            <div className="programs-list__progress-item">
                              <div className="programs-list__progress-header">
                                <span>Budget Allocation</span>
                                <span>${(program.budgetAllocation.current / 1000).toFixed(0)}k / ${(program.budgetAllocation.total / 1000).toFixed(0)}k</span>
                              </div>
                              <div className="programs-list__progress-bar">
                                <div
                                  className="programs-list__progress-fill"
                                  style={{ width: `${(program.budgetAllocation.current / program.budgetAllocation.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {program.familiesReached && (
                            <div className="programs-list__progress-item">
                              <div className="programs-list__progress-header">
                                <span>Families Reached</span>
                                <span>{program.familiesReached.current.toLocaleString()} / {program.familiesReached.total.toLocaleString()}</span>
                              </div>
                              <div className="programs-list__progress-bar">
                                <div
                                  className="programs-list__progress-fill"
                                  style={{ width: `${(program.familiesReached.current / program.familiesReached.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {program.graduates && (
                            <div className="programs-list__progress-item">
                              <div className="programs-list__progress-header">
                                <span>Graduates</span>
                                <span>{program.graduates.current} / {program.graduates.total}</span>
                              </div>
                              <div className="programs-list__progress-bar">
                                <div
                                  className="programs-list__progress-fill"
                                  style={{ width: `${(program.graduates.current / program.graduates.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button className="programs-list__view-details" type="button" onClick={(event) => { event.stopPropagation(); setStatusProgram(program); setStatusDraft(program.status || "Draft"); }}>
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
                Across all active programs this quarter.
              </p>
              <div className="programs-impact__stats">
                <div className="programs-impact__stat">
                  <strong>{(totalImpact.individualsAssisted / 1000).toFixed(1)}k</strong>
                  <span>INDIVIDUALS ASSISTED</span>
                </div>
                <div className="programs-impact__stat">
                  <strong>${(totalImpact.fundsDisbursed / 1000000).toFixed(1)}M</strong>
                  <span>FUNDS DISBURSED</span>
                </div>
              </div>
              <button
                className="programs-impact__generate-report"
                type="button"
                onClick={() => setActiveFilter("All")}
              >
                <FiList aria-hidden="true" />
                <span>View All</span>
              </button>
            </aside>
            {message && <p role="status">{message}</p>}
          </div>
        </main>
      </div>

      {showCreateForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <form onSubmit={submitProgram} style={{ width: 440, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 24px 60px rgba(15,23,42,0.22)" }}>
            <h2 style={{ marginTop: 0 }}>Create program</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <input value={programForm.name} onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))} placeholder="Program name" required />
              <textarea value={programForm.description} onChange={(event) => setProgramForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} />
              <select value={programForm.organisation_id} onChange={(event) => setProgramForm((current) => ({ ...current, organisation_id: event.target.value }))} required>
                <option value="">Select organisation</option>
                {organisations.map((organisation) => (
                  <option key={organisation.id} value={organisation.id}>{organisation.name}</option>
                ))}
              </select>
              <input value={programForm.location} onChange={(event) => setProgramForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" />
              <select value={programForm.status} onChange={(event) => setProgramForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => { setShowCreateForm(false); setProgramForm(emptyProgramForm); }}>Cancel</button>
              <button type="submit">Save Program</button>
            </div>
          </form>
        </div>
      )}

      {statusProgram && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div style={{ width: 360, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 24px 60px rgba(15,23,42,0.22)" }}>
            <h2 style={{ marginTop: 0 }}>Update status</h2>
            <p>{statusProgram.title}</p>
            <select value={statusDraft} onChange={(event) => setStatusDraft(event.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => setStatusProgram(null)}>Close</button>
              <button type="button" onClick={updateStatus}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Programs;
