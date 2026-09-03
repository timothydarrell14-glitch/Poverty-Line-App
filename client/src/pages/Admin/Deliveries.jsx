import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiMinus,
  FiPlus,
  FiTruck,
} from "react-icons/fi";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import SideBar from "../../components/Admin/SideBar";
import { apiUrl } from "../../api/client";
import { getAccessToken } from "../../utils/auth";
import "../../styles/Admin/DeliveriesPage.css";
import "../../styles/Admin/DeliveriesPage.dark.css";

const initialDeliveries = [
  {
    id: "SHP-992A",
    destination: "North District Hub",
    status: "In Transit",
    updated: "Updated: 10:42 AM",
    marker: "delivery-map__marker--north",
  },
  {
    id: "SHP-844B",
    destination: "Westside Community Center",
    status: "In Transit",
    updated: "Updated: 09:15 AM",
    marker: "delivery-map__marker--west",
  },
  {
    id: "SHP-771C",
    destination: "South Metro Clinic",
    status: "Delivered",
    updated: "Delivered: Yesterday, 4:30 PM",
    marker: "delivery-map__marker--south",
  },
  {
    id: "SHP-602D",
    destination: "Eastside Food Bank",
    status: "Delivered",
    updated: "Delivered: Yesterday, 1:20 PM",
    marker: "delivery-map__marker--east",
  },
  {
    id: "SHP-495E",
    destination: "Central Shelter",
    status: "Delayed",
    updated: "Updated: 08:30 AM",
    marker: "delivery-map__marker--central",
  },
];

const filters = ["All", "In Transit", "Delivered", "Delayed"];

function Deliveries() {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(initialDeliveries[0].id);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    fetch(apiUrl("/api/auth/deliveries"), { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.deliveries?.length) return;
        setDeliveries(data.deliveries.map((delivery) => ({
          id: delivery.id,
          destination: delivery.destination,
          status: delivery.status,
          updated: delivery.updated,
          marker: delivery.marker || "delivery-map__marker--new",
        })));
        setSelectedId((current) => current || data.deliveries[0]?.id || initialDeliveries[0].id);
      })
      .catch(() => undefined);
  }, []);

  const visibleDeliveries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return deliveries.filter(
      (delivery) =>
        (activeFilter === "All" || delivery.status === activeFilter) &&
        (!term ||
          delivery.id.toLowerCase().includes(term) ||
          delivery.destination.toLowerCase().includes(term)),
    );
  }, [activeFilter, deliveries, searchTerm]);
  function addDelivery() {
    const newDelivery = {
      id: `SHP-${String(deliveries.length + 701).padStart(3, "0")}F`,
      destination: "New Community Distribution Point",
      status: "In Transit",
      updated: "Updated: Just now",
      marker: "delivery-map__marker--new",
    };
    setDeliveries((current) => [newDelivery, ...current]);
    setActiveFilter("All");
    setSearchTerm("");
    setSelectedId(newDelivery.id);
  }

  return (
    <div className="admin-deliveries">
      <AdminTopbar pageClass="admin-deliveries" searchId="delivery-search" placeholder="Search deliveries..." searchTerm={searchTerm} onSearchChange={(event) => setSearchTerm(event.target.value)} />
      <div className="admin-deliveries__body">
        <SideBar />
        <main className="admin-deliveries__main">
          <div className="admin-deliveries__heading">
            <div>
              <h1>Deliveries</h1>
              <p>Track and manage active shipments.</p>
            </div>
            <button
              className="admin-deliveries__add-button"
              type="button"
              onClick={addDelivery}
            >
              <FiPlus aria-hidden="true" />
              <span>Log New Delivery</span>
            </button>
          </div>
          <div className="admin-deliveries__content-grid">
            <section
              className="delivery-map"
              aria-labelledby="live-tracking-heading"
            >
              <div className="delivery-map__header">
                <h2 id="live-tracking-heading">Live Tracking</h2>
                <div className="delivery-map__controls">
                  <button
                    className="tooltip"
                    type="button"
                    aria-label="Zoom out"
                    data-tooltip="Zoom out"
                    onClick={() => setIsZoomed(false)}
                  >
                    <FiMinus aria-hidden="true" />
                  </button>
                  <button
                    className="tooltip"
                    type="button"
                    aria-label="Zoom in"
                    data-tooltip="Zoom in"
                    onClick={() => setIsZoomed(true)}
                  >
                    <FiPlus aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div
                className={`delivery-map__canvas${isZoomed ? " delivery-map__canvas--zoomed" : ""}`}
              >
                <span className="delivery-map__river delivery-map__river--one" />
                <span className="delivery-map__river delivery-map__river--two" />
                <span className="delivery-map__route delivery-map__route--one" />
                <span className="delivery-map__route delivery-map__route--two" />
                <span className="delivery-map__label delivery-map__label--north">
                  North District
                </span>
                <span className="delivery-map__label delivery-map__label--west">
                  Westside
                </span>
                <span className="delivery-map__label delivery-map__label--south">
                  South Metro
                </span>
                <span className="delivery-map__label delivery-map__label--east">
                  Eastside
                </span>
                {deliveries.map((delivery) => (
                  <button
                    className={`delivery-map__marker ${delivery.marker}${selectedId === delivery.id ? " delivery-map__marker--selected" : ""} tooltip`}
                    key={delivery.id}
                    type="button"
                    aria-label={`${delivery.id}: ${delivery.destination}`}
                    data-tooltip={`${delivery.id}: ${delivery.destination}`}
                    onClick={() => setSelectedId(delivery.id)}
                  >
                    <FiTruck aria-hidden="true" />
                  </button>
                ))}
                <div className="delivery-map__legend">
                  <span>
                    <i className="delivery-map__legend-icon delivery-map__legend-icon--truck" />
                    In transit
                  </span>
                  <span>
                    <i className="delivery-map__legend-icon delivery-map__legend-icon--pin" />
                    Delivered
                  </span>
                </div>
              </div>
            </section>
            <section
              className="delivery-list"
              aria-labelledby="active-shipments-heading"
            >
              <div className="delivery-list__header">
                <h2 id="active-shipments-heading">Active Shipments</h2>
                <div
                  className="delivery-list__filters"
                  role="group"
                  aria-label="Delivery status filters"
                >
                  {filters.map((filter) => (
                    <button
                      className={
                        activeFilter === filter
                          ? "delivery-list__filter--active"
                          : ""
                      }
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="delivery-list__cards">
                {visibleDeliveries.length ? (
                  visibleDeliveries.map((delivery) => {
                    const statusClass = delivery.status
                      .toLowerCase()
                      .replace(" ", "-");
                    return (
                      <button
                        className={`delivery-list__card${selectedId === delivery.id ? " delivery-list__card--selected" : ""}`}
                        key={delivery.id}
                        type="button"
                        onClick={() => setSelectedId(delivery.id)}
                      >
                        <span
                          className={`delivery-list__id delivery-list__id--${statusClass}`}
                        >
                          #{delivery.id}
                        </span>
                        <span
                          className={`delivery-list__status delivery-list__status--${statusClass}`}
                        >
                          {delivery.status === "Delivered" ? (
                            <FiCheckCircle aria-hidden="true" />
                          ) : (
                            <FiTruck aria-hidden="true" />
                          )}
                          {delivery.status}
                        </span>
                        <strong>{delivery.destination}</strong>
                        <small>
                          <FiClock aria-hidden="true" />
                          {delivery.updated}
                        </small>
                        <span className="delivery-list__details" role="tooltip">
                          <b>Shipment details</b>
                          <span>
                            <em>Reference</em> #{delivery.id}
                          </span>
                          <span>
                            <em>Destination</em> {delivery.destination}
                          </span>
                          <span>
                            <em>Status</em> {delivery.status}
                          </span>
                          <span>
                            <em>Last update</em> {delivery.updated}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="delivery-list__empty">
                    No shipments match this search.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Deliveries;
