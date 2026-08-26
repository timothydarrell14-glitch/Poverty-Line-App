function ProfilePicture({ imageUrl }) {
    return (
      <div className="profile-picture">
            <img src={imageUrl || "https://via.placeholder.com/40"} /> // change default profile picture
      </div>
    );
  }
  
  export default ProfilePicture;