import {useContext} from "react";
import {Link} from "react-router-dom";

import {PostActionContext, UserContext, TokenContext, PostListActionContext} from "../../Context_Store";
import PostBookmarkBtn from "./PostBookmarkBtn";
import PostSettings from "./PostSettings";

const PostHeader = (props) => {
  const {post} = useContext(PostActionContext);
  const user = useContext(UserContext);
  const token = useContext(TokenContext);
  
  return (
    <div className="post-header">
      <Link className="profile-picture" to={`/user/${post.author._id}`}>
        <img src={`https://srf-odin-book.herokuapp.com/${post.author.profile_picture}`} />
      </Link>
      <Link className="post-info" to={`/user/${post.author._id}`}>
        <div className="post-author">{post.author.display_name}</div>
        <div className="post-date">{(new Date(post.date)).toDateString()}</div>
      </Link>
      <PostBookmarkBtn token={token} user={user} post={post} />
      {post.author._id === user._id &&
        <PostSettings post={post} user={user} />
      }
    </div>
  );
}

export default PostHeader;