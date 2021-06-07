import {useState, useEffect, useContext} from "react";
import {Link, useRouteMatch} from "react-router-dom";

import {TokenContext, UserPageContext} from "../../Context_Store";
import {getUserImages} from "../../helpers/user_api";
import Loading from "./Loading";

const UserPagePhotos = () => {
  const {url} = useRouteMatch();
  const token = useContext(TokenContext);
  const user = useContext(UserPageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    getUserImages(user._id, null, token)
      .then((res) => res.status === 200 && res.json())
      .then(({images}) => images && setPhotos(images))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <div id="user-page-photos">
      <div className="user-page-photos-header">
        <div className="user-page-photos-title">Photos</div>
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

export default UserPagePhotos;