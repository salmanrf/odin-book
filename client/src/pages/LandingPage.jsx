import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

import "../css/landing-page.css"
import "../css/landing-page-responsive.css"

import OdinLogo from "../assets/img/odin-logo.svg";
import OdinPreview from "../assets/img/odin.gif";

const LandingPage = () => {
  return (
    <div id="landing-page">
      <header>
        <Link id="odin-logo" to="/">
            <img src={OdinLogo} alt=""/>
            <span>Odin Book</span>
        </Link>
      </header>
      <Main />
    </div>
  );
}

const Main = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);

    return () => setIsMounted(false);
  }, []);

  return (
    <main>
      <div id="welcome">
        <h1>Odin Book</h1>
        <p>A Social networking platform.</p>
        <div id="landing-page-gif"
          style={{
            top: isMounted && "0",
            opacity: isMounted && "1",
            boxShadow: isMounted && "2px 2px 4px 4px hsl(0, 0%, 0%, 20%)"
          }}
        >
          <img src={OdinPreview} alt="" />
        </div>
        <div id="auth-links">
          <Link to="/signin" className="signin">Join now</Link>
        </div>
      </div>
    </main>
  );
}

export default LandingPage;