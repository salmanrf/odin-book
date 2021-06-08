import {useState, useEffect, useContext} from "react";
import {Link, useRouteMatch} from "react-router-dom";

import {TokenContext, UserPageContext} from "../../Context_Store";
import {getUserImages, getUserFriends} from "../../helpers/user_api";
import Loading from "./Loading";
import UserPageFeed from "./UserPageFeed";

const UserPageMain = () => {
  return (
    <div id="user-page-main">
      <div className="user-section-preview-list">
        <UserPhotosPreview />
        <UserFriendsPreview />
      </div>
      <UserPageFeed />
    </div>
  );
}

const UserPhotosPreview = () => {
  const {url} = useRouteMatch();
  const token = useContext(TokenContext);
  const user = useContext(UserPageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    // getUserImages(userId, imagesCount, token)
    getUserImages(user._id, 9, token)
      .then((res) => res.status === 200 && res.json())
      .then(({images}) => images && setPhotos(images))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <div className="user-section-preview">
      <div className="section-preview-header">
        <div className="section-preview-title">Photos</div>
        <Link to={`${url}/photos`} className="section-preview-link">All Photos</Link>
      </div>
      <div className="user-photos-preview-grid"
        style={{minHeight: isLoading && "100px"}}
      >
        {isLoading ?
          <Loading />
          :
          photos.map((p) => (
            <PhotoPreviewItem photo={p} key={p._id} />
          ))
        }
      </div>
    </div>
  );
}

const PhotoPreviewItem = (props) => {
  const {photo} = props;

  return (
    <Link 
      to={`/post/${photo.post}`} 
      key={photo._id} 
      className="user-photos-preview-item"
    >
      <img src={`https://srf-odin-book.herokuapp.com/${photo.url}`} alt=""/>
      <div className="photo-overlay"></div>
    </Link>
  );
}

const UserFriendsPreview = () => {
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
    <div className="user-section-preview">
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
                <div>{f.display_name}</div>
              </Link>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default UserPageMain;