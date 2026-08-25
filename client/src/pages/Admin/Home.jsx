import { IoIosSearch } from "react-icons/io";
import { IoMdNotificationsOutline } from "react-icons/io";
import SideBar from "../../components/SideBar";

function Home() {
  return (
    <>
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
        <div className="profile">
          <a href="#">
            <img src="https://via.placeholder.com/40" />
          </a>
        </div>
      </header>
      <main>
              <SideBar />
              // Profile background image + button + name
              <div>
                  <img src="#"></img>
                  <h2>Name of Admin</h2>
                  <h3>Admin</h3>
                  <button>Update Profile</button>
              </div>
              // post card
              // brief summary of activities
              // recent chats
      </main>
    </>
  );
}
export default Home;
