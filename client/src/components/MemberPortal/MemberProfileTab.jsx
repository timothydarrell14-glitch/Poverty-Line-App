import { useState } from "react";
import { apiRequest } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const MemberProfileTab = ({ user, onUserUpdated, onRequestCallback, onEditProfileClick }) => {
  const [skills, setSkills] = useState(() => {
    if (user?.skills) {
      return typeof user.skills === "string"
        ? user.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(user.skills) ? user.skills : [];
    }
    return ["Customer Service", "Inventory Sorting", "Digital Literacy"];
  });
  const [prevSkillsProp, setPrevSkillsProp] = useState(user?.skills);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);
  const { showToast } = useToast();

  if (user?.skills !== prevSkillsProp) {
    setPrevSkillsProp(user?.skills);
    if (user?.skills) {
      const parsed = typeof user.skills === "string"
        ? user.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(user.skills) ? user.skills : [];
      setSkills(parsed);
    }
  }

  const updateSkillsInDatabase = async (updatedSkills) => {
    if (!user?.user_id) return;
    setSavingSkills(true);
    const skillsString = updatedSkills.join(", ");
    try {
      const updatedUser = await apiRequest(`/api/users/${user.user_id}`, {
        method: "PATCH",
        body: { skills: skillsString },
      });
      if (onUserUpdated) onUserUpdated(updatedUser);
      showToast("Skills updated in your profile database!", "success");
    } catch (err) {
      showToast(err.message || "Failed to save skills.", "error");
    } finally {
      setSavingSkills(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      showToast("Skill already exists in your profile.", "info");
      return;
    }
    const nextSkills = [...skills, trimmed];
    setSkills(nextSkills);
    setNewSkillInput("");
    updateSkillsInDatabase(nextSkills);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const nextSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(nextSkills);
    updateSkillsInDatabase(nextSkills);
  };

  return (
    <div className="member-profile-tab">
      <div className="profile-case-card">
        <div className="profile-card-header">
          <div>
            <h2>Member Profile & Case File</h2>
            <p>Your details and active case management record.</p>
          </div>
          <button className="btn-edit-profile" onClick={onEditProfileClick}>
            Edit Profile
          </button>
        </div>

        <div className="profile-grid-layout">
          {/* Left Column: Personal & Contact Info */}
          <div className="profile-col">
            <div className="info-group">
              <label>Full Name</label>
              <h3 className="info-value-title">
                {user ? `${user.first_name} ${user.last_name}` : "Member Profile"}
              </h3>
            </div>

            <div className="info-group">
              <label>Contact Details</label>
              <p className="info-value-text">
                📧 {user?.email || "member@povertyline.org"}
                <br />
                📞 {user?.phone || "(555) 234-5678"}
              </p>
            </div>

            <div className="info-group">
              <label>Current Location</label>
              <p className="info-value-text">{user?.location || "Nairobi, Kenya / Central District"}</p>
            </div>

            <div className="info-group">
              <label>Assistance Goals & Bio</label>
              <p className="info-value-text">
                Seeking employment in community outreach or customer logistics, along with housing voucher support for my family.
              </p>
            </div>
          </div>

          {/* Right Column: Skills & Navigator Card */}
          <div className="profile-col">
            {/* Skills Tag Manager */}
            <div className="info-group">
              <label>Experience & Skills</label>
              <div className="skills-tags-wrap">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag-pill">
                    {skill}
                    <button
                      className="btn-remove-skill"
                      onClick={() => handleRemoveSkill(skill)}
                      disabled={savingSkills}
                      title="Remove skill"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddSkill} className="add-skill-bar">
                <input
                  type="text"
                  placeholder="Add a new skill tag..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-add-skill"
                  disabled={savingSkills}
                >
                  {savingSkills ? "Saving..." : "+ Add"}
                </button>
              </form>
            </div>

            {/* Assigned Navigator Card */}
            <div className="navigator-assigned-card">
              <h4>Assigned Family Navigator</h4>
              <p>
                <strong>Sarah Jenkins, MSW</strong> is your dedicated case coordinator for housing vouchers, emergency relief, and program referrals.
              </p>
              <button
                className="link-request-callback"
                onClick={onRequestCallback}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                Request 15-min Navigator Callback &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileTab;
