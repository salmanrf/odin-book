import {useState, useEffect, useContext} from "react";
import {Link, useHistory} from "react-router-dom";
import {AiOutlineCamera} from "react-icons/ai";

import {TokenContext} from "../Context_Store";
import {validateFileSize, validateFileTypes} from "../helpers/form";
import {postSignin, postSignup} from "../helpers/auth_api";

import "../css/signin.css";

const Signup = () => {
  const [isLoading, setisLoading] = useState(false);

  return (
    <div id="signin-page">
      <h1 className="logo">Odin Book</h1>
      <div id="signin-container">
        {isLoading && 
          <div className="form-overlay"></div>
        }
        <SignupForm isLoading={isLoading} setIsLoading={setisLoading} />       
      </div>
    </div>
  );
}

const SignupForm = (props) => {
  const {token} = useContext(TokenContext);
  const {isLoading, setIsLoading} = props;
  const history = useHistory();
  const [profilePicture, setProfilePicture] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [displayNameErr, setDisplayNameErr] = useState("");
  const [usernameErr, setUsernameErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [repeatPasswordErr, setRepeatPasswordErr] = useState("");

  useEffect(() => {
    setDisplayNameErr("");
  }, [username]);

  useEffect(() => {
      setUsernameErr("");
  }, [username]);
    
  useEffect(() => {
    setPasswordErr("");
  }, [password]);

  useEffect(() => {
    setRepeatPasswordErr("");
    
    if(repeatPassword !== password)
      setRepeatPasswordErr("Repeat password must matches password");
  }, [password, repeatPassword]);

  async function handleSignup(event) {
    event.preventDefault();

    if(repeatPassword !== password)
      return setRepeatPasswordErr("Repeat password must matches password");
    
    setIsLoading(true);

    try {
      const res = await postSignup(profilePicture, displayName, username, password);

      if(res.status === 201 || res.status === 200)
        return history.push("/signin")

      const {error} = await res.json();

      error.display_name ? setDisplayNameErr(error.display_name.msg) : setDisplayNameErr("");
      error.username ? setUsernameErr(error.username.msg) : setUsernameErr("");
      error.password ? setPasswordErr(error.password.msg) : setPasswordErr("");

      setIsLoading(false);
    } catch {
      setIsLoading(false);
      return;
    }
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
    <form 
      id="signin-form" 
      encType="multipart/form-data"
      onSubmit={handleSignup}
    >
      <ProfilePictureInput profilePicture={{value: profilePicture, set: setProfilePicture}} />
      <DisplayNameInput username={{value: displayName, set: setDisplayName, error: displayNameErr}} />
      <UsernameInput username={{value: username, set: setUsername, error: usernameErr}} />
      <PasswordInput password={{value: password, set: setPassword, error: passwordErr}} />
      <RepeatPasswordInput password={{value: repeatPassword, set: setRepeatPassword, error: repeatPasswordErr}} />
      
      {displayNameErr &&
        <p className="auth-error-msg">Display Name: {displayNameErr}</p>
      }
      {usernameErr && 
        <p className="auth-error-msg">Username: {usernameErr}</p>
      }
      {passwordErr &&
        <p className="auth-error-msg">Password: {passwordErr}</p>
      }
      {repeatPasswordErr &&
        <p className="auth-error-msg">{repeatPasswordErr}</p>
      }

      <button type="submit" id="signup-btn">Signup</button>

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
      <div className="section-line"></div>
      <Link to="/signin" id="signin-link">Signin</Link>
    </form>
  );
}

const ProfilePictureInput = (props) => {
  const {profilePicture} = props;
  const [validationMsg, setValidationMsg] = useState("");

  function handleFileChange(e) {
    setValidationMsg("");

    let validationRes = {};

    if(e.target.files.length == 0)
      return;

    validationRes = validateFileTypes(e.target.files);

    if(!validationRes.valid)
      return setValidationMsg(validationRes.msg);

    validationRes = validateFileSize(e.target.files);

    if(!validationRes.valid)
      return setValidationMsg(validationRes.msg);

    setValidationMsg("");

    const file = e.target.files[0];
    file.src = URL.createObjectURL(file);

    profilePicture.set(file);
  }
  
  return (
    <>
      <label htmlFor="profile_picture" className="profile-label-text">
        <div>Profile Picture</div>
      </label>
      <label htmlFor="profile_picture" className="profile-label-preview">
        <img src={(profilePicture.value && profilePicture.value.src) || ""} alt="" />
        <div className="picture-input-overlay">
          <AiOutlineCamera />
        </div>
      </label>
      <input 
        type="file"
        id="profile_picture"
        name="profile_picture"
        accept="image/jpeg, image/png, image/sgv, image/gif"
        onChange={handleFileChange}
      />
      <p className="file-validation-msg">{validationMsg}</p>
    </>
  );
}

const DisplayNameInput = (props) => {
  const {username} = props;

  return (
    <>
      <label htmlFor="display_name">Display Name: </label>
      <input 
        type="text"
        id="display_name"
        name="display_name"
        placeholder="Display Name"
        autoComplete="off"
        value={username.value}
        onChange={(e) => username.set(e.target.value)}
        style={{outline: username.error ? "1px solid hsl(357, 81%, 65%)" : "none"}}
      />
    </>
  );
}

const UsernameInput = (props) => {
  const {username} = props;

  return (
    <>
      <label htmlFor="username">Username: </label>
      <input 
        type="text"
        id="username"
        name="username"
        placeholder="Username"
        autoComplete="off"
        value={username.value}
        onChange={(e) => username.set(e.target.value)}
        style={{outline: username.error ? "1px solid hsl(357, 81%, 65%)" : "none"}}
      />
    </>
  );
}

const PasswordInput = (props) => {
  const {password} = props;

  return (
    <>
      <label htmlFor="password">Password: </label>
      <input 
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value={password.value}
        onChange={(e) => password.set(e.target.value)}
        style={{outline: password.error ? "1px solid hsl(357, 81%, 65%)" : "none"}}
      />
    </>
  );
}

const RepeatPasswordInput = (props) => {
  const {password} = props;

  return (
    <>
      <label htmlFor="repeat_password">Repeat Password: </label>
      <input 
        type="password"
        id="repeat_password"
        name="repeat_password"
        placeholder="Repeat Password"
        value={password.value}
        onChange={(e) => password.set(e.target.value)}
        style={{outline: password.error ? "1px solid hsl(357, 81%, 65%)" : "none"}}
      />
    </>
  );
}

export default Signup;