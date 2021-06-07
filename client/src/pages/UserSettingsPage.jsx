import {useState, useEffect, useContext} from "react";
import {AiOutlineCamera} from "react-icons/ai";

import {TokenContext, UserContext} from "../Context_Store";
import {validateFileSize, validateFileTypes} from "../helpers/form";
import {getCurrentUser, updateCurrentUser} from "../helpers/user_api";
import Loading from "./components/Loading";
import spinning from "../assets/img/spinning.svg";

import "../css/user-settings-page.css";

const UserSettingsPage = () => {
  const token = useContext(TokenContext);
  const userContext = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [user, setUser] = useState(null);
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
    getCurrentUser("_id display_name username profile_picture", token)
      .then((res) => res.status === 200 && res.json())
      .then(({user}) => {
        if(!user) return;

        document.title = `${user.display_name}'s Settings`;
        
        setUser(user);

        setDisplayName(user.display_name);
        setUsername(user.username);
        setProfilePicture({src: `https://srf-odin-book.herokuapp.com/${user.profile_picture}`});
      })
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

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

  async function handleUpdateSettings(event) {
    event.preventDefault();

    if(isFetching) return;

    if(password.length < 6)
      return setPasswordErr("Must contain 6 to 100 characters");

    if(repeatPassword !== password)
      return setRepeatPasswordErr("Repeat password must matches password");
    
    setIsFetching(true);

    try {
      const userData = {
        profilePicture, 
        displayName, 
        username, 
        password
      }

      const response = await updateCurrentUser(userData, token);

      const result = await response.json();

      if(result.user) {
        setIsFetching(false);
        console.log(result.user);
        return userContext.set({...userContext.value, ...result.user});
      }

      const {error} = result;

      error.display_name ? setDisplayNameErr(error.display_name.msg) : setDisplayNameErr("");
      error.username ? setUsernameErr(error.username.msg) : setUsernameErr("");
      error.password ? setPasswordErr(error.password.msg) : setPasswordErr("");

      setIsFetching(false);
    } catch {
      setIsFetching(false);
      return;
    }
  }

  if(isLoading || !user) 
    return (
      <div id="user-settings-page">
        <div id="user-settings-container">
          <Loading />
        </div>
      </div>
    ); 

  if(user) 
    return (
      <div id="user-settings-page">
        <div id="user-settings-container">
          <div id="user-settings-title">User Settings</div>
          <form id="signin-form"
            onSubmit={handleUpdateSettings}
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

            <button type="submit" id="submit-settings">
              {isFetching ? 
                <img src={spinning} alt="" />
                :
                <span>Save</span>
              }
            </button>
          </form>
        </div>
      </div>
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

export default UserSettingsPage;