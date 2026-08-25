import { IoIosSearch } from "react-icons/io";
import { IoMdNotificationsOutline } from "react-icons/io";
import SideBar from "../../components/SideBar";
import ProfileCard from "../../components/ProfileCard";
import ProfilePicture from "../../components/ProfilePicture";
import { FcGallery } from "react-icons/fc";

function Home() {
  return (
    <div className="admin-home">
      <header>
        <div className="search">
          <IoIosSearch size={20} />
          <input type="text" placeholder="Search" />
        </div>
        <div className="notification">
          <a href="#">
            <IoMdNotificationsOutline size={20} />
          </a>
        </div>
      </header>
      <main>
        <SideBar />
        <div>
          {/* Profile background image + button + name */}
          <div>
            <img src="#"></img>
            <ProfileCard
              name="Name of Admin"
              role="Admin"
              imageUrl="https://via.placeholder.com/40"
            />
            <button>Edit Profile</button>
          </div>
          {/* brief summary of activities (Donations, Partnerships + active Programs) */}
          <div>
            <div>
              <h2>Number of Projects</h2>
              <span>Projects</span>
              <h2>Number of Users</h2>
              <span>Users</span>
              <h2>Number of Donations</h2>
              <span>Donations</span>
            </div>
            {/* quick actions */}
            <div>
              <h2>Quick Actions</h2>
            </div>
            {/* recent activities */}
            <div>
              <h2>Recent Activities</h2>
              <div>
                <FcGallery size={20} />
                <span>Activity 1</span>
              </div>
              <div>
                <FcGallery size={20} />
                <span>Activity 2</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Home;
