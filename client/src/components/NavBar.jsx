import '../styles/NavBar.css'
import { IoMdHeartEmpty } from "react-icons/io";

function NavBar() {
  return (
          <nav className="navbar">
      <div className="logo">
        <h1>Poverty Line</h1>
      </div>
          <div className="nav-links">
              <ul>
                  <li><a href="#">Home</a></li>
                  <li><a href="#">Get Help</a></li>
                  <li><a href="#">Donors</a></li>
                  <li><a href="#">Organisations</a></li>
                  <li><a href="#">Contact Us</a></li>
           </ul>
          </div>
          <div className="auth-links">
              <a href="#">Login</a><br/>
                  <button><IoMdHeartEmpty size={24} style={{ stroke: 'white', strokeWidth: '15px' }} /> Donate Now</button>
          </div>
    </nav>
  )
}

export default NavBar