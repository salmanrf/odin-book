import {useState, useEffect, useContext} from "react";
import {Link, useRouteMatch} from "react-router-dom";

import {TokenContext, UserPageContext} from "../../Context_Store";
import {getUserFriends} from "../../helpers/user_api";
import Loading from "./Loading";

const UserPageFriends = () => {
  const {url} = useRouteMatch();
  const token = useContext(TokenContext);
  const user = useContext(UserPageContext);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    getUserFriends(user._id, 9, token)
      .then((res) => res.status === 200 && res.json())
      .then(({friends}) => friends && setFriends(friends))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <div id="user-page-friends">
      <div className="section-preview-header">
        <div className="section-preview-title">Friends</div>
        <Link to={`${url}/friends`} className="section-preview-link">Friends</Link>
      </div>
      <div className="user-friends-preview-grid"
        style={{minHeight: isLoading && "100px"}}
      >
        {isLoading ?
          <Loading />
          :
          friends.map((f) => (
            <div className="user-friends-preview-item" key={f._id}>
              <Link to={`/user/${f._id}`} className="user-friends-profile-picture">
                <img src={`https://srf-odin-book.herokuapp.com/${f.profile_picture}`} />
                <div className="photo-overlay"></div>
              </Link>
              <Link to={`/user/${f._id}`} className="user-friends-display-name">
                <span>{f.display_name}</span>
              </Link>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default UserPageFriends;