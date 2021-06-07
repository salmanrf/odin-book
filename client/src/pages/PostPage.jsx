import {useState, useEffect, useContext, createRef} from "react";
import {useParams, useHistory} from "react-router-dom";
import {MdNavigateBefore, MdNavigateNext} from "react-icons/md";
import {v4 as uuidv4} from "uuid";

import {PostContext, PostListActionContext, PostActionContext} from "../Context_Store";
import {getSinglePost} from "../helpers/post_api";
import Loading from "./components/Loading";
import PostHeader from "./components/PostHeader";
import PostReaction from "./components/PostReaction";
import PostPageComment from "./components/PostPageComment";
import UpdatePostForm from "./components/UpdatePostForm";
import DeletePostPrompt from "./components/DeletePostPrompt";
import ModalOverlay from "./components/ModalOverlay";

import "../css/post-page.css";

const PostPage = () => {
  const history = useHistory();
  const {postId} = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      delete: () => setShowDeletePrompt(false),
      openPrompt: () => setShowDeletePrompt(true),
      closePrompt: () => setShowDeletePrompt(false),
    }
  }

  function setPostUpdate(postData) {
    setPost({
      ...post,
      content: postData.content,
      images: postData.images
    })
  }

  function focusCommentInput() {
    commentRef.current.focus();
  }

  useEffect(() => {
    getSinglePost(postId)
      .then((res) => res.status === 200 && res.json())
      .then(({post}) => {
        if(post) {
          post && setPost(post);
          document.title = `${post.author.display_name}'s Post`
        }
      })
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, [postId]);
  
  if(!post)
    return (
      <div id="post-page">
        <Loading />
      </div>  
    )
  
  if(post)
    return (
      <div id="post-page">
        <PostImageSlideShow images={post.images} />
        <div id="post-page-main">
          <PostListActionContext.Provider 
            value={{
              removeFromSaved: () => null
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
              <div className="post-content">
                <pre className="post-text">{post.content}</pre>
              </div>
              <PostContext.Provider value={post}>
                <PostReaction focusComment={focusCommentInput} />
                <PostPageComment ref={commentRef} />
              </PostContext.Provider>
            </PostActionContext.Provider>
          </PostListActionContext.Provider>
        </div>      
      </div>
    )
}

const PostImageSlideShow = (props) => {
  const {images} = props;
  const sliderContainerRef = createRef();
  const [position, setPosition] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if(images.length === 0)
      return;
    
    function resetSlide() {
      setPosition(0);
      setPage(1);
    }
      
    window.addEventListener("resize", resetSlide);

    return () => window.removeEventListener("resize", resetSlide);
  }, []);
  
  function slidePrev() {
    if(page === 1)
      return;

    setPosition(position + sliderContainerRef.current.offsetWidth);
    setPage(page - 1);
  }
  
  function slideNext() {
    if(page < images.length) {
      setPosition(position - sliderContainerRef.current.offsetWidth);
      setPage(page + 1);
    } else {
        return;
    }
  }

  return (
    <div id="post-page-image-slideshow">      
      <div id="slider-container" ref={sliderContainerRef}
        style={{
          left: position + "px"
        }}
      >
        {images.map((img) => (
            <div className="slider-item" key={uuidv4()}>
              <img src={`https://srf-odin-book.herokuapp.com/${img}`} alt="" />
            </div>
        ))}
      </div>
      {images.length > 1 &&
        <div className="slider-buttons-container">
          <div 
            className="slider-button"
            onClick={slidePrev}
          >
            <MdNavigateBefore />
          </div>
          <div 
            className="slider-button"
            onClick={slideNext}
          >
            <MdNavigateNext />
          </div>
        </div>
      }
    </div>
  );
}

export default PostPage;