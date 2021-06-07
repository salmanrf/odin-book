import {useState, useEffect, useContext} from "react";

import {
    TokenContext, 
    PostContext, 
    CommentActionContext, 
} from "../../Context_Store";
import {deleteComment} from "../../helpers/post_api";
import ModalOverlay from "./ModalOverlay";
import Loading from "./Loading";

import "../../css/delete-prompt-modal.css";

const DeleteCommentPrompt = () => {
  const token = useContext(TokenContext);
  const post = useContext(PostContext);
  const {comment, deletePrompt} = useContext(CommentActionContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => setIsLoading(false);
  })
  
  function handleDeleteComment() {
    setIsLoading(true);

    deleteComment(post._id, comment._id, token)
      .then((res) => res.status === 200 && deletePrompt.delete())
      .catch(() => null)
  }
  
  return (
    <div className="delete-prompt-container">
      <div 
        className="prompt-title"
        style={{opacity: isLoading ? "0.5" : "1"}}
      >
        <h3>Delete Comment</h3>
      </div>
      <div className="post-content-overview">
        <pre>
          {
            comment.content.length <= 120 ?
              comment.content
              :
              comment.content.substr(0, 120) + "..."
          }
        </pre>
        {isLoading &&
          <>
            <Loading />
            <ModalOverlay 
              position={"absolute"}
              background={"hsl(242, 24%, 17%)"}
            />
          </>
        }
      </div>
      <div className="prompt-buttons">
        <div 
          className="prompt-button-cancel"
          style={{opacity: isLoading ? "0.5" : "1"}}
          onClick={isLoading ? null : deletePrompt.hide}
        >
         <span>Cancel</span> 
        </div>
        <div 
          className="prompt-button-confirm"
          style={{opacity: isLoading ? "0.5" : "1"}}
          onClick={isLoading ? null : handleDeleteComment}
        >
          <span>Delete</span>
        </div>
      </div>
    </div>
  )
}

export default DeleteCommentPrompt;