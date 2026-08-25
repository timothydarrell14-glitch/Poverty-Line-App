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
        {/* Profile background image + button + name */}
        <div>
          <img src="#"></img>
          <ProfileCard name="Name of Admin" role="Admin" imageUrl="https://via.placeholder.com/40" />
          <button>Update Profile</button>
        </div>
        {/* post card */}
        <div>
          <div>
          <h2>Share a Post</h2>
          <ProfilePicture />
          <input type="text" placeholder="Share something" />
          <button>Share</button>
          </div>
          <div>
            <FcGallery size={20} />
            <span>Add Photo/Video</span>
          </div>

        </div>
        {/* brief summary of activities // recent chats */}
        <div>
          <h2>Number of Projects</h2>
          <span>Projects</span>
          <h2>Number of Users</h2>
          <span>Users</span>
          <h2>Number of Donations</h2>
          <span>Donations</span>
        </div>
      </main>
    </div>
  );
}
export default Home;
