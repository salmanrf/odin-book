import {useState, useEffect, useContext} from "react";
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";

import {PostListActionContext} from "../../Context_Store";
import {getSavedPost, addSavedPost, deleteSavedPost} from "../../helpers/user_api";

const PostBookmarkBtn = (props) => {
  const {removeFromSaved} = useContext(PostListActionContext);
  const {token, user, post} = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getSavedPost(post._id, token)
      .then((res) => res.status === 200 && res.json())
      .then(({isSaved}) => setIsSaved(isSaved))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);  
  
  function handleSavePost() {
    // Post is already saved, delete
    if(isSaved) {
      setIsSaved(false);

      return ( 
        deleteSavedPost(post._id, token)
          .then((res) => res.status === 200 && setIsSaved(false))
          .then(() => removeFromSaved && removeFromSaved(post._id))
      )
    }

    // Post isn't saved, save
    addSavedPost(post._id, token)
      .then((res) => res.status === 200 && setIsSaved(true))
  }

  return (
    <div 
      className="post-bookmark-btn" 
      onClick={() => handleSavePost()}
      style={{
        gridColumn: post.author._id !== user._id ? "12 / 13" : "10 / 12"
      }}
    >
      {!isLoading && 
        (isSaved ? 
          <BsBookmarkFill className="post-bookmark" />
          :
          <BsBookmark className="post-bookmark" />
        )
      }
    </div>
  )
}

export default PostBookmarkBtn;