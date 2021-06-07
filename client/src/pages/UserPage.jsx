import {useState, useEffect, useContext} from "react";
import {Route, Switch, Link, NavLink, useParams, useRouteMatch} from "react-router-dom";

import {TokenContext, UserPageContext} from "../Context_Store";
import {getUser} from "../helpers/user_api";
import Loading from "./components/Loading";
import UserPageMain from "./components/UserPageMain";
import UserPageFriends from "./components/UserPageFriends";
import UserPagePhotos from "./components/UserPagePhotos";
import UserFriendStatus from "./components/UserFriendStatus";

import "../css/user-page.css";

const UserPage = () => {
  const {userId} = useParams();
  const {url} = useRouteMatch();
  const token = useContext(TokenContext);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    getUser(userId, "_id,display_name,profile_picture", token)
      .then((res) => {
        if(res.status === 200) 
          return res.json();
        else 
          throw new Error();
      })
      .then(({user}) => {
        document.title = `${user.display_name}'s Profile`;
        setUser(user);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [url]);

  if(isLoading)
    return (
      <div className="user-page-container">
        <Loading />
      </div>
    );
  
  if(!user)
    return(
      <div className="user-page-container">
        <div className="user-not-found"></div>
      </div>
    );

  if(user && !isLoading) 
    return (
      <div className="user-page-container">
        <header className="user-page-header">
          <div className="user-banner">
            <div className="banner-profile-picture">
              <img src={`https://srf-odin-book.herokuapp.com/${user.profile_picture}`} alt="" />
            </div>
          </div>
          <div className="header-display-name">
            <span>{user.display_name}</span>
          </div>
          <div className="user-page-header-section">
          <UserHeaderNav />
          <UserFriendStatus user={user} />
          </div>
        </header>

        <Switch>
          <UserPageContext.Provider value={user}>
            <Route exact path={`${url}`}>
              <UserPageMain />
            </Route>
            <Route path={`${url}/friends`} component={UserPageFriends} />
            <Route path={`${url}/photos`} component={UserPagePhotos} />
          </UserPageContext.Provider>
        </Switch>
      </div>
    );
}

const UserHeaderNav = () => {
  const {url} = useRouteMatch();
  
  return (
    <div className="header-user-nav">
      <NavLink exact to={`${url}`} 
        className="header-user-nav-link"
        activeClassName="header-user-nav-link-active"
      >
        Post
      </NavLink>
      <NavLink to={`${url}/friends`} 
        className="header-user-nav-link"
        activeClassName="header-user-nav-link-active"
      >
        Friends
      </NavLink>
      <NavLink to={`${url}/photos`} 
        className="header-user-nav-link"
        activeClassName="header-user-nav-link-active"
      >
        Photos
      </NavLink>
    </div>
  );
}

export default UserPage;