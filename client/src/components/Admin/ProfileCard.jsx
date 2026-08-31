import ProfilePicture from "./ProfilePicture";

function ProfileCard({ name, role, imageUrl }) {
  return (
    <div className="profile-card">
      <ProfilePicture imageUrl={imageUrl} />
    <div>
      <h2>{name || "Name of Admin"}</h2>
      <h3>{role || "Admin"}</h3>
    </div>
    </div>
  )
}

export default ProfileCard;