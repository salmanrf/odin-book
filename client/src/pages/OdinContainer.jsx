import {useState, useEffect, useContext} from "react";
import {BrowserRouter as Router, Switch, Route, NavLink, useRouteMatch} from "react-router-dom";

import socket from "../helpers/socket";
import {TokenContext, UserContext, SidebarContext, FriendListContainerContext} from "../Context_Store";
import {getCurrentUser} from "../helpers/user_api";
import UserPage from "./UserPage";
import PostPage from "./PostPage";
import Header from "./components/Header.jsx";
import NewsFeed from "./components/NewsFeed.jsx";
import UserList from "./components/UserList.jsx";
import SavedPostsList from "./components/SavedPostsList";
import FriendListContainer from "./components/FriendListContainer";
import UserSettingsPage from "./UserSettingsPage";
import Loading from "./components/Loading";

import "../css/odin-container.css";
import "../css/odin-container-responsive.css";
import "../css/app-main.css";
import "../css/app-main-responsive.css";
import "../css/user-list.css";

import NewsIcon from "../assets/img/newspaper.png";
import BookmarkIcon from "../assets/img/bookmark.png";
import UserIcon from "../assets/img/user.png";

const OdinContainer = () => {
  const token = useContext(TokenContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFriendList, setShowFriendList] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async function() {
      const res = await getCurrentUser("", token);

      if(res.status === 200) {
        const {user} = await res.json();

        setUser(user);
        
        socket.auth = {userId: user._id};
        socket.connect();
      }
      
      setIsLoading(false);
    })();
  }, []);
  
  if(isLoading) 
    return (
      <Loading />
    );

  if(user)
    return (  
      <div id="odin-container">
        <UserContext.Provider value={user}>  
          <SidebarContext.Provider 
            value={{
                isShown: showSidebar,
                show: () => setShowSidebar(true),
                hide: () => setShowSidebar(false)
            }}
          >
            <FriendListContainerContext.Provider 
              value={{
                isShown: showFriendList,
                show: () => setShowFriendList(true),
                hide: () => setShowFriendList(false)
              }}
            >
              <Header />
              <AppMain user={{value: user, set: setUser}} />
            </FriendListContainerContext.Provider>
          </SidebarContext.Provider>
        </UserContext.Provider>
      </div>
    );
}

const AppMain = (props) => {
  const {user} = props;
  const {path} = useRouteMatch();

  return (
    <main id="app-main">
      {/* Conditionally renders Sidebar */}
      <Switch>
        <Route path={`${path}user/:id`} component={null}/>
        <Route path={`${path}post/:id`} component={null}/>
        <Route path={`${path}settings`} component={null}/>
        <Route path={path} component={Sidebar} />
      </Switch>
      {/* Conditionally renders different sections of the app */}
      <Switch>
        <Route exact path={path} component={NewsFeed} />
        <Route exact path={`${path}post`} component={NewsFeed} />
        <Route path={`${path}settings`}>
          <UserContext.Provider value={user}>
            <UserSettingsPage />
          </UserContext.Provider>
        </Route>
        <Route path={`${path}saved`} component={SavedPostsList} />
        <Route exact path={`${path}user`} component={UserList} />
        <Route path={`${path}user/:userId`} component={UserPage} />
        <Route path={`${path}post/:postId`} component={PostPage} />
      </Switch>
      {/* Conditionally renders FriendListContainer */}
      <Switch>  
        <Route path={`${path}user/:id`} component={null} />
        <Route path={`${path}post/:id`} component={null}/>
        <Route path={`${path}settings`} component={null}/>
        <Route path={path} component={FriendListContainer} />
      </Switch>
    </main>
  );
}

const Sidebar = () => {
  const {isShown, hide} = useContext(SidebarContext);
  
  return (
    <div id="sidebar"
      style={{left: isShown && "0"}}
      onClick={hide}
    >
      <div className="sidebar-nav">
        <NavLink to="/" className="sidebar-nav-item" exact activeClassName="nav-item-active">
          <img src={NewsIcon} alt="news-feed-icon"/>
          <span>Feed</span>
        </NavLink>
        <NavLink to="/saved" className="sidebar-nav-item" activeClassName="nav-item-active">
          <img src={BookmarkIcon} alt="bookmark-icon"/>  
          <span>Saved</span>
        </NavLink>
      </div>
      <div className="sidebar-nav">
        <div className="sidebar-nav-title">Explore</div>
        <NavLink to="/user" className="sidebar-nav-item" activeClassName="nav-item-active">
          <img src={UserIcon} alt="people-icon"/>
          <span>Users</span>
        </NavLink>
      </div>
    </div>
  );
}

export default OdinContainer;