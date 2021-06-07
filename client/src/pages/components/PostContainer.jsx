import {createRef, useState, useEffect, useContext} from "react";

import {PostContext, PostListActionContext, PostActionContext} from "../../Context_Store";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostReaction from "./PostReaction";
import PostComment from "./PostComment";
import UpdatePostForm from "./UpdatePostForm";
import DeletePostPrompt from "./DeletePostPrompt";
import ModalOverlay from "./ModalOverlay";

import "../../css/post-container.css";
import "../../css/post-container-responsive.css";

const PostContainer = (props) => {
  const {postList} = useContext(PostListActionContext);
  const [post, setPost] = useState(props.post);
  const [isMounted, setIsMounted] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const commentRef = createRef();
  const PostActionContextValue = {
    post,
    updatePost: {
      update: setPostUpdate,
      openForm: () => setShowUpdateForm(true),
      closeForm: () => setShowUpdateForm(false)
    },
    deletePost: {
      openPrompt: () => setShowDeletePrompt(true),
      closePrompt: () => setShowDeletePrompt(false),
      delete: () => {
        setShowDeletePrompt(false);
        setIsMounted(false);

        setTimeout(() => {
          postList.remove(post._id);
        }, 150);
      }
    }
  }

  useEffect(() => {
    setIsMounted(true);

    return () => setIsMounted(false);
  }, []);

  function setPostUpdate(postData) {
    setPost({
      ...post,
      content: postData.content,
      images: postData.images
    });
  }

  function focusCommentInput() {
    commentRef.current.focus();
  }
  
  return (
    <div 
      className="post-container" 
      style={{
        opacity: `${isMounted ? "1" : "0"}`,
        top: `${isMounted ? "0" : "25px"}`
      }}
    > 
      <PostActionContext.Provider value={PostActionContextValue}>
        <PostHeader />
        {showUpdateForm &&
          <>
            <UpdatePostForm />
            <ModalOverlay close={() => setShowUpdateForm(false)}/>
          </>
        }
        {showDeletePrompt &&
          <>
            <DeletePostPrompt />
            <ModalOverlay close={() => setShowDeletePrompt(false)} />
          </>
        }
      </PostActionContext.Provider>
      <PostContent post={post} />
      <PostContext.Provider value={post}>
        <PostReaction focusComment={focusCommentInput} />
        <PostComment ref={commentRef} />
      </PostContext.Provider>
    </div>
  );
}

export default PostContainer;