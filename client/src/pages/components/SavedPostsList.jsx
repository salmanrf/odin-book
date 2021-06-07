import {useState, useEffect, useContext} from "react";

import {TokenContext, PostListActionContext} from "../../Context_Store";
import {getAllSavedPosts} from "../../helpers/user_api";
import PostContainer from "./PostContainer";
import FriendListButton from "./FriendListButton";
import Loading from "./Loading";

const SavedPostsList = () => {
  const token = useContext(TokenContext);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  function addSavedPost(post) {
    setSavedPosts([...savedPosts, post]);
  }

  function removeSavedPost(postId) {
    setSavedPosts(savedPosts.filter((saved) => saved._id !== postId));
  }

  useEffect(() => {
    document.title = "Saved Posts";

    getAllSavedPosts(token)
      .then((res) => res.status === 200 && res.json())
      .then(({saved_posts}) => saved_posts && setSavedPosts(saved_posts))
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <div className="wall-main">
      <div className="post-list">
        <PostListActionContext.Provider 
          value={{
            removeFromSaved: removeSavedPost
          }}
        >
          {isLoading ?
            <Loading />
            :
            savedPosts.map((post) => (
              <PostContainer post={post} isSaved={true} key={post._id} />
            ))
          }  
        </PostListActionContext.Provider>
      </div>
      <FriendListButton />
    </div>
  );
}

export default SavedPostsList;