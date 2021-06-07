import {useState, useContext} from "react";

import {deletePost as fetchDeletePost} from "../../helpers/post_api";
import {PostActionContext, TokenContext, PostListActionContext} from "../../Context_Store";
import ModalOverlay from "./ModalOverlay";
import Loading from "./Loading";

import "../../css/delete-prompt-modal.css";

const DeletePostPrompt = () => {
  const token = useContext(TokenContext);
  const {post, deletePost} = useContext(PostActionContext);
  const [isLoading, setIsLoading] = useState(false);

  function handleDeletePost() {
    setIsLoading(true);
    
    fetchDeletePost(post._id, token)
      .catch(() => null)
      .finally(() => {
        setIsLoading(false);
        deletePost.delete();
      });
  }
  
  return (
    <div className="delete-prompt-container">
      <div 
        className="prompt-title"
        style={{opacity: isLoading ? "0.5" : "1"}}
      >
        <h3>Delete Post</h3>
      </div>
      <div className="post-content-overview">
        <pre>
          {
            post.content.length <= 120 ?
              post.content
              :
              post.content.substr(0, 120) + "..."
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
          onClick={isLoading ? null : deletePost.closePrompt}
        >
         <span>Cancel</span> 
        </div>
        <div 
          className="prompt-button-confirm"
          style={{opacity: isLoading ? "0.5" : "1"}}
          onClick={isLoading ? null : handleDeletePost}
        >
          <span>Delete</span>
        </div>
      </div>
    </div>
  )
}

export default DeletePostPrompt;