import { useMemo, useState } from "react";
import {
  FiBell,
  FiChevronRight,
  FiHelpCircle,
  FiLogOut,
  FiMoon,
  FiPlus,
  FiSearch,
  FiUser,
  FiList,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import SideBar from "../../components/Admin/SideBar";
import "../../styles/Admin/ProgramsPage.css";

const programs = [
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

function Programs() {
  const [activeFilter, setActiveFilter] = useState("Active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState(null);

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
  }, [activeFilter, searchTerm]);

  function addProgram() {
    console.log("Add new program");
  }

  const totalImpact = {
    individualsAssisted: 14200,
    fundsDisbursed: 1200000,
  };

  return (
    <div className="admin-programs">
      <header className="admin-programs__topbar">
        <Link className="admin-programs__brand" to="/admin">
          Poverty Line
        </Link>
        <div className="admin-programs__topbar-content">
          <label className="admin-programs__global-search" htmlFor="program-search">
            <FiSearch aria-hidden="true" />
            <input
              id="program-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search programs..."
            />
          </label>
          <div className="admin-programs__topbar-actions">
            <button className="tooltip" type="button" aria-label="Notifications" data-tooltip="Notifications">
              <FiBell aria-hidden="true" />
            </button>
            <button className="tooltip" type="button" aria-label="Help" data-tooltip="Help">
              <FiHelpCircle aria-hidden="true" />
            </button>
            <button className="tooltip" type="button" aria-label="Account" data-tooltip="Account">
              <FiUser aria-hidden="true" />
            </button>
            <button className="tooltip" type="button" aria-label="Theme toggle" data-tooltip="Theme toggle">
              <FiMoon aria-hidden="true" />
            </button>
            <button
              className="admin-programs__logout tooltip"
              type="button"
              aria-label="Logout"
              data-tooltip="Logout"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

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
              onClick={addProgram}
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
                        <img
                          className="programs-list__card-image"
                          src={program.image}
                          alt={program.title}
                        />
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
                        <button className="programs-list__view-details" type="button">
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default Programs;