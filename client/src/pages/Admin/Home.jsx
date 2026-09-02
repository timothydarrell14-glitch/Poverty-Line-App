import {
  FiBox,
  FiChevronRight,
  FiEdit2,
  FiFileText,
  FiMessageSquare,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopbar from "../../components/Admin/AdminTopbar";
import { useAdminSession } from "../../components/AdminSession";
import SideBar from "../../components/Admin/SideBar"
import "../../styles/Admin/Home.css";

const activities = [
  {
    type: "delivery",
    title: "Shipment #402 Delivered",
    time: "2 hours ago",
    description:
      "Essential medical supplies successfully delivered to the North District Community Center.",
    icon: FiBox,
  },
  {
    type: "program",
    title: "New Program Launched",
    time: "Yesterday",
    description:
      "The 'Urban Nutrition Center' initiative is now live and accepting volunteer registrations.",
    icon: FiUser,
    tags: ["Nutrition", "Urban"],
  },
  {
    type: "partner",
    title: "Partner Onboarded",
    time: "Oct 12",
    description:
      "Global Aid Corp has officially signed the partnership agreement for Q4 initiatives.",
    icon: FiUsers,
  },
];

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { user, updateUser, uploadAvatar, uploadCover } = useAdminSession();
  const avatarFileRef = useRef(null);
  const coverFileRef = useRef(null);
  const visibleActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matchingActivities = activities.filter((activity) =>
      [activity.title, activity.description, ...(activity.tags ?? [])].join(" ").toLowerCase().includes(term),
    );
    return (showAllActivities ? matchingActivities : matchingActivities.slice(0, 2));
  }, [searchTerm, showAllActivities]);

  async function handleProfileSave(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProfileError("");
    setIsSavingProfile(true);
    try {
      const avatarFile = avatarFileRef.current?.files?.[0];
      const coverFile = coverFileRef.current?.files?.[0];
      if (avatarFile) await uploadAvatar(avatarFile);
      if (coverFile) await uploadCover(coverFile);
      await updateUser({
        first_name: form.get("firstName"),
        last_name: form.get("lastName"),
        email: form.get("email"),
        avatar_url: avatarFile ? undefined : form.get("avatarUrl"),
        cover_url: coverFile ? undefined : form.get("coverUrl"),
      });
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <div className="admin-home">
      <AdminTopbar
        pageClass="admin-home"
        searchClass="admin-home__search"
        searchId="admin-search"
        placeholder="Search..."
        searchTerm={searchTerm}
        onSearchChange={(event) => setSearchTerm(event.target.value)}
      />

      <div className="admin-home__body">
        <SideBar />
        <div className="admin-home__workspace">
        <main className="admin-home__main">
          <section
            className="admin-home__profile"
            aria-labelledby="admin-profile-name"
          >
            <img
              className="admin-home__cover-image"
              src={user?.coverUrl || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80"}
              alt="Dashboard cover"
            />
            <div className="admin-home__profile-content">
              <img
                className="admin-home__profile-avatar"
                src={user?.avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || "Admin")}`}
                alt=""
              />
              <div className="admin-home__profile-copy">
                <h1 id="admin-profile-name">{user?.name}</h1>
                <p>{user?.role}</p>
              </div>
              <button className="admin-home__edit-profile" type="button" onClick={() => setIsEditingProfile(true)}>
                <FiEdit2 aria-hidden="true" />
                <span>Edit Profile</span>
              </button>
            </div>
          </section>

          <div className="admin-home__dashboard-grid">
            <div className="admin-home__left-column">
              <section
                className="admin-home__panel admin-home__impact"
                aria-labelledby="global-impact-heading"
              >
                <h2 id="global-impact-heading">Global Impact</h2>
                <div className="admin-home__panel-rule" />
                <div className="admin-home__program-total">
                  <strong>42</strong>
                  <span>Active Programs</span>
                </div>
                <div className="admin-home__impact-stats">
                  <div>
                    <strong>$1.2M</strong>
                    <span>Donations</span>
                  </div>
                  <div>
                    <strong>156</strong>
                    <span>Partnerships</span>
                  </div>
                </div>
              </section>

              <section
                className="admin-home__panel admin-home__quick-actions"
                aria-labelledby="quick-actions-heading"
              >
                <h2 id="quick-actions-heading">Quick Actions</h2>
                <div className="admin-home__quick-action-list">
                  {!searchTerm || "new program".includes(searchTerm.toLowerCase()) ? <button type="button" onClick={() => navigate("/admin/programs")}>
                    <span className="admin-home__action-icon admin-home__action-icon--teal">
                      <FiFileText aria-hidden="true" />
                    </span>
                    <span>New Program</span>
                    <FiChevronRight aria-hidden="true" />
                  </button> : null}
                  {!searchTerm || "view chats".includes(searchTerm.toLowerCase()) ? <button type="button" onClick={() => navigate("/admin/chats")}>
                    <span className="admin-home__action-icon admin-home__action-icon--green">
                      <FiMessageSquare aria-hidden="true" />
                    </span>
                    <span>View Chats</span>
                    <FiChevronRight aria-hidden="true" />
                  </button> : null}
                </div>
              </section>
            </div>

            <section
              className="admin-home__panel admin-home__activities"
              aria-labelledby="recent-activity-heading"
            >
              <div className="admin-home__activities-heading">
                <h2 id="recent-activity-heading">Recent Activity</h2>
                <button className="admin-home__view-all" type="button" onClick={() => setShowAllActivities((showAll) => !showAll)}>
                  {showAllActivities ? "Show Less" : "View All"}
                </button>
              </div>
              <div className="admin-home__panel-rule" />
              <ol className="admin-home__activity-list">
                {visibleActivities.length ? visibleActivities.map(
                  ({ type, title, time, description, icon: Icon, tags }) => (
                    <li className="admin-home__activity" key={title}>
                      <span
                        className={`admin-home__activity-icon admin-home__activity-icon--${type}`}
                      >
                        <Icon aria-hidden="true" />
                      </span>
                      <article>
                        <div className="admin-home__activity-title-row">
                          <h3>{title}</h3>
                          <time>{time}</time>
                        </div>
                        <p>{description}</p>
                        {tags && (
                          <div className="admin-home__activity-tags">
                            {tags.map((tag) => (
                              <span key={tag}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </article>
                    </li>
                  ),
                ) : <li className="admin-home__empty-state">No dashboard items match “{searchTerm}”.</li>}
              </ol>
            </section>
          </div>
        </main>
        </div>
      </div>
      {isEditingProfile && (
        <div className="admin-home__modal-backdrop" role="presentation">
          <form className="admin-home__profile-form" onSubmit={handleProfileSave}>
            <h2>Edit Profile</h2>
            <label>First name<input name="firstName" defaultValue={user?.name?.split(" ")[0] ?? ""} required /></label>
            <label>Last name<input name="lastName" defaultValue={user?.name?.split(" ").slice(1).join(" ") ?? ""} required /></label>
            <label>Email<input name="email" type="email" defaultValue={user?.email ?? ""} required /></label>
            <label>Profile picture URL<input name="avatarUrl" type="url" placeholder="https://…" defaultValue={user?.avatarUrl ?? ""} /></label>
            <label>Or upload a profile picture<input ref={avatarFileRef} name="avatarFile" type="file" accept="image/*" /></label>
            <label>Dashboard cover URL<input name="coverUrl" type="url" placeholder="https://…" defaultValue={user?.coverUrl ?? ""} /></label>
            <label>Or upload a cover image<input ref={coverFileRef} name="coverFile" type="file" accept="image/*" /></label>
            {profileError && <p className="admin-home__form-error" role="alert">{profileError}</p>}
            <div className="admin-home__form-actions">
              <button type="button" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              <button type="submit" disabled={isSavingProfile}>{isSavingProfile ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default Home;
