import {useState, useEffect, useContext} from "react";
import {Link, useHistory} from "react-router-dom";

import "../css/signin.css";

import {TokenContext} from "../Context_Store";
import {postSignin} from "../helpers/auth_api";

const Signin = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div id="signin-page">
      <h1 className="logo">Odin Book</h1>
      <div id="signin-container">
        {isLoading && 
          <div className="form-overlay"></div>
        }
        <SigninForm isLoading={isLoading} setIsLoading={setIsLoading} />       
      </div>
    </div>
  );
}

const SigninForm = (props) => {
  const {token} = useContext(TokenContext);
  const history = useHistory();
  const {isLoading, setIsLoading} = props;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameErr, setUsernameErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  useEffect(() => {
      setUsernameErr("");
  }, [username]);
    
  useEffect(() => {
    setPasswordErr("");
  }, [password]);

  function handleSubmit(event) {
    event.preventDefault();

    setUsernameErr("");
    setPasswordErr("");
    
    handleSignin(username, password);
  }

  async function handleSignin(username, password) {
    setIsLoading(true);

    const res = await postSignin(username, password);
    const auth = await res.json();

    if(res.status === 200) {
      token.set(auth.token);
      
      setIsLoading(false);

      history.push("/");
    } else {
      const {error} = auth;

      error.username && setUsernameErr(error.username.msg);
      error.password && setPasswordErr(error.password.msg);

      setIsLoading(false);
    }
  }

  return (
    <form id="signin-form" onSubmit={handleSubmit}>
      <UsernameInput username={{value: username, set: setUsername, isInvalid: usernameErr}} />
      <PasswordInput password={{value: password, set: setPassword, isInvalid: passwordErr}} />
      
      <p className="auth-error-msg">{usernameErr}</p>
      <p className="auth-error-msg">{passwordErr}</p>

      <button type="submit" id="signin-btn">Signin</button>
      
      <div id="demo-users">
        <button 
          type="button" 
          className="demo-signin-btn" 
          onClick={() => handleSignin("gigachad", "gigachad")}
        >
          Demo User 1
        </button>
        <button 
          type="button" 
          className="demo-signin-btn"
          onClick={() => handleSignin("madeline", "madeline")}
        >
          Demo User 2
        </button>
      </div>
      {/* <button type="button" id="facebook-signin-btn">Continue with Facebook</button> */}
      <div className="section-line"></div>
      <Link to="/signup" id="signup-link">Signup</Link>
    </form>
  );
}

const UsernameInput = (props) => {
  const {username} = props;

  return (
    <>
      <input 
        type="text"
        name="username"
        placeholder="Username"
        autoComplete="off"
        value={username.value}
        onChange={(e) => username.set(e.target.value)}
        style={{outline: username.isInvalid ? "1px solid hsl(357, 81%, 65%)" : "none"}}
      />
    </>
  );
}

const PasswordInput = (props) => {
  const {password} = props;

  return (
    <input 
      type="password"
      name="password"
      placeholder="Password"
      value={password.value}
      onChange={(e) => password.set(e.target.value)}
      style={{outline: password.isInvalid ? "1px solid hsl(357, 81%, 65%)" : "none"}}
    />
  );
}

export default Signin;