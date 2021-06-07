import {useState, useEffect, useContext} from "react";
import {Switch, Route, Link} from "react-router-dom";
import {FaBell} from "react-icons/fa";
import {IoChatbubbleEllipses} from "react-icons/io5";
import {BsPerson} from "react-icons/bs";
import {FiLogOut} from "react-icons/fi";
import {MdSettings} from "react-icons/md";

import {UserContext, SidebarContext} from "../../Context_Store";
import SearchBox from "./SearchBox";

import OdinLogo from "../../assets/img/odin-logo.svg";

const Header = () => {
  const {isShown, show, hide} = useContext(SidebarContext);

  return (
    <header id="odin-header">
      <NavBar>
        <Link id="odin-logo" to="/">
          <img src={OdinLogo} alt=""/>
        </Link>
        <SearchBox />
        <Switch>
          <Route path="/user/:id" component={null}/>
          <Route path="/post/:id" component={null}/>
          <Route path="/settings" component={null}/>
          <Route path="/">
            <HamburgerButton action={isShown ? hide : show} />
          </Route>
        </Switch>
      </NavBar>
      <NavBar>
        <UserNav />
      </NavBar>
    </header>
  );
}

const HamburgerButton = (props) => {
  return (
    <div 
      className="hamburger-button"
      onClick={props.action}
    >
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

const NavBar = (props) => {
  return (
    <div className="odin-header-navbar">
      {props.children}
    </div>
  )  
}

const UserNav = () => {
  const user = useContext(UserContext);

  return (
    <>
      {user && 
        <>
          <div id="nav-user">
            <Link className="profile-picture" to={`/user/${user._id}`}>
              <img src={`https://srf-odin-book.herokuapp.com/${user.profile_picture}`} />
            </Link>
            <Link to={`/user/${user._id}`}>{user.display_name}</Link>
          </div>
          {/* Implemented soon */}
          <div className="nav-icon-container">
            <IoChatbubbleEllipses />
          </div>
          <div className="nav-icon-container">
            <FaBell />
          </div>
          <NavSettings />
        </>
      }
    </>
  );
}

const NavSettings = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    function hidePopup() {setShowPopup(false)};

    if(showPopup)
      window.addEventListener("click", hidePopup);

    return () => window.removeEventListener("click", hidePopup);
  }, [showPopup]);
  
  return (
    <div 
      className="nav-icon-container"
      onClick={() => setShowPopup(true)}
    >
      <MdSettings 
        style={{color: showPopup && "hsl(196, 67%, 60%)"}}
      />
        <div 
          className="nav-popup-container"
          style={{display: showPopup && "flex"}}
        >
          <Link to="/settings" className="nav-popup-item">
            <BsPerson />
            <span>User Settings</span>
          </Link>
          <Link to="/logout" className="nav-popup-item">
            <FiLogOut />
            <span>Logout</span>
          </Link>
        </div>
    </div>
  );
}


export default Header;