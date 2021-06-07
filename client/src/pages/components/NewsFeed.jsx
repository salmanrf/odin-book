import {useState, useEffect, useContext} from "react";

import {TokenContext, UserContext, PostListActionContext} from "../../Context_Store";
import {getFeedPosts} from "../../helpers/post_api";
import CreatePostForm from "./CreatePostForm";
import PostContainer from "./PostContainer";
import FriendListButton from "./FriendListButton";
import Loading from "./Loading";
import ModalOverlay from "./ModalOverlay";

const NewsFeed = () => {
  const token = useContext(TokenContext);
  const [feedPosts, setFeedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  function append(post) {
    setFeedPosts([...feedPosts, post]);
  }

  function remove(postId) {
    setFeedPosts(feedPosts.filter((post) => post._id !== postId));
  }

  useEffect(() => {
    document.title = "Odin Book";

    getFeedPosts(token)
      .then((res) => res.status === 200 && res.json())
      .then(({posts}) => posts && setFeedPosts(posts))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="wall-main">
      <PostListActionContext.Provider 
        value={{
          postList: {
            append,
            remove
          }
        }}
      >
        <CreatePost />
        <FeedPostsList isLoading={isLoading} posts={feedPosts} />
      </PostListActionContext.Provider>
      <FriendListButton />
    </main>
  );
}

const CreatePost = () => {
  const user = useContext(UserContext);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {showForm && 
        <>
          <CreatePostForm closeForm={() => setShowForm(false)} />
          <ModalOverlay close={() => setShowForm(false)} />
        </>
      }
      <div className="create-post-container">
        <div className="create-post-header">
          <div className="profile-picture">
            <img src={`https://srf-odin-book.herokuapp.com/${user.profile_picture}`} />
          </div>
          <div 
            id="create-post-btn"
            onClick={() => setShowForm(true)}
          >
            {`What is on your mind, ${user.display_name} ?`}
          </div>
        </div>
      </div>
    </>
  );
}

const FeedPostsList = (props) => {
  const {posts, isLoading} = props;

  return (
    <div className="post-list">
      {isLoading ?
        <Loading />
        :
        posts.map((post) => (
          <PostContainer post={post} key={post._id} />
        ))
      }  
    </div>
  );
}

export default NewsFeed; 