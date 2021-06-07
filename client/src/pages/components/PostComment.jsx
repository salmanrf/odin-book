import {useState, useEffect, useContext, forwardRef} from "react";
import {Link} from "react-router-dom";

import {UserContext, PostContext, TokenContext, CommentListActionContext} from "../../Context_Store";
import {getPostComment, createComment} from "../../helpers/post_api";
import CommentContainer from "./CommentContainer";
import Loading from "./Loading";

import sendIcon from "../../assets/img/send.png";

const PostComment = forwardRef((props, ref) => {
  const token = useContext(TokenContext);
  const post = useContext(PostContext);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setIsLoading(true);
    
    getPostComment(post._id, 3, token)
      .then((res) => res.status === 200 && res.json())
      .then(({count, comments}) => {
        count && setCommentCount(count);
        comments && setComments(comments);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function addCommentToList(newComment) {
    if(commentCount <= 3) {
      setComments([...comments, newComment]);
      setCommentCount(commentCount + 1);
    } else {
      setCommentCount(commentCount + 1);
    }
  }

  function deleteCommentFromList(commentId) {
    setComments(comments.filter((c) => c._id !== commentId));
    setCommentCount(commentCount - 1);
  }

  return (
    <div className="post-comments-container">
      {commentCount > 3 &&
        <Link 
          className="more-comments-link" 
          to={`/post/${post._id}`}
        >
          All Comments({commentCount})
        </Link>
      }
      <CommentListActionContext.Provider value={{
        commentList: {
          remove: deleteCommentFromList
        }
      }}>
        <CommentList 
          isLoading={isLoading}
          comment={{list: comments}}
        />
      </CommentListActionContext.Provider>
      <AddComment 
        commentList={{
          append: addCommentToList,
          remove: deleteCommentFromList
        }}
        ref={ref} 
      />
    </div>
  );
})

const AddComment = forwardRef((props, ref) => {
  const user = useContext(UserContext);
  const token = useContext(TokenContext);
  const post = useContext(PostContext);
  const {commentList} = props;
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);
    
    if(!content) {
      setIsLoading(false);
      return;
    } 

    createComment(post._id, content, token)
      .then((res) => res.status === 201 && res.json())
      .then((res) => (
        (res && res.comment) && 
          commentList.append({
            _id: res.comment._id,
            author: user,
            content: res.comment.content
          })))
      .catch(() => null)
      .finally(() => {
        setContent("");
        setIsLoading(false);
      });
  }

  return (
    <div className="add-comment">
      <div className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${user.profile_picture}`} />
      </div>
      <form className="comment-input-wrapper"
        onSubmit={handleSubmit}
      >
        <input 
          type="text" 
          name="comment"
          placeholder="Say something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          ref={ref}
          disabled={isLoading ? true : false}
        />
        <button 
          type="submit" 
          disabled={isLoading ? true : false}
        >
          <img src={sendIcon} alt="send" />
        </button>
      </form>
    </div>
  );
})

const CommentList = (props) => {
  const {comment, isLoading} = props;
  
  return (
    <div className="comment-list-container"
      style={{height: isLoading && "100px"}}
    >
      {isLoading ? 
        <div className="comment-loading-wrapper">
          <Loading />
        </div>
        :
        comment.list.map((c) => (
          <CommentContainer comment={c} key={c._id} />
        ))
      }
    </div>
  );
}

export default PostComment;