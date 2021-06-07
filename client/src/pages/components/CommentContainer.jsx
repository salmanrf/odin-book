import {useState, useEffect, useContext, createRef} from "react";
import {Link} from "react-router-dom";
import {BsThreeDots} from "react-icons/bs";

import {UserContext, TokenContext, CommentActionContext, CommentListActionContext} from "../../Context_Store";
import {updateComment} from "../../helpers/post_api";
import ModalOverlay from "./ModalOverlay";
import DeleteCommentPrompt from "./DeleteCommentPrompt";

import editIcon from "../../assets/img/edit.png";
import deleteIcon from "../../assets/img/delete.png";

const CommentContainer = (props) => {
  const user = useContext(UserContext);
  const token = useContext(TokenContext);
  const {commentList} = useContext(CommentListActionContext);
  const inputRef = createRef();
  const [comment, setComment] = useState(props.comment);
  const [commentUpdate, setCommentUpdate] = useState(props.comment.content);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  useEffect(() => {
    if(editMode)
      inputRef.current.focus();
    else
      setCommentUpdate(comment.content);
  }, [editMode]);

  function handleUpdateComment() {
    setIsUpdating(true);
    
    updateComment(comment._id, commentUpdate, token)
      .then((res) => res.status === 200 && res.json())
      .then((res) => res.comment && setComment({...comment, content: res.comment.content}))
      .catch(() => null)
      .finally(() => {
        setIsUpdating(false);
        setEditMode(false);
      });
  }
  
  return (
    <div className="comment-container">
      <div className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${comment.author.profile_picture}`} />
      </div>
      <div className="comment-content"
        style={{
          paddingBottom: editMode ? "30px" : ""
        }}
      >
        {isUpdating && 
          <ModalOverlay 
            position="absolute" 
            background="hsl(0, 0%, 0%, 40%)"
          />
        }
        <Link to={`/user/${comment.author._id}`} className="comment-author">{comment.author.display_name}</Link>
        {editMode ?
          <>
            {/* Show input element 
                and edit mode buttons
                in edit mode
            */}
            <textarea
              ref={inputRef}
              type="text" 
              name="comment" 
              placeholder="Say something..."
              value={commentUpdate}
              onChange={(e) => setCommentUpdate(e.target.value)}
              rows="3"
            />
            <EditModeOptions 
              switchFromEdit={() => setEditMode(false)}
              handleUpdateComment={handleUpdateComment}
            />
          </>
          :
          <>
            {/* Show comment content when edit mode is inactive*/}
            <p>{comment.content}</p>
          </>
        }
        
      </div>
      <CommentActionContext.Provider 
        value={{
          comment,
          deletePrompt: {
            delete: () => {
              setShowDeletePrompt(false);
              commentList.remove(comment._id);
            },
            show: () => setShowDeletePrompt(true),
            hide: () => setShowDeletePrompt(false),
          },
          editMode: {
            enable: () => setEditMode(true),
            disable: () => setEditMode(false)
          }
        }}
      >
        {user._id === comment.author._id && 
          <CommentSettings />
        }
        {showDeletePrompt && 
        <>
          <ModalOverlay close={() => setShowDeletePrompt(false)}/>
          <DeleteCommentPrompt />
        </>
        }
      </CommentActionContext.Provider>
    </div>
  );
}

const EditModeOptions = (props) => {
  const {switchFromEdit, handleUpdateComment} = props;
  
  return (
    <div className="comment-edit-mode-options">
      {/* Button for submitting comment edit */}
      <div 
        className="edit-option"
        onClick={handleUpdateComment}
      >
        <span>Save</span>
      </div>
      {/* Button for submitting comment edit */}

      {/* Cancel comment edit */}
      <div 
        className="edit-option"
        onClick={switchFromEdit}
      >
        <span>Cancel</span>
      </div>
      {/* Cancel comment edit */}
    </div>
  );
}

const CommentSettings = () => {
  const [showOptions, setShowOptions] = useState(false);
  
  return (
    <div className="comment-settings" onClick={() => setShowOptions(true)}>
      <BsThreeDots />
      {showOptions && 
        <SettingOptions closeMenu={() => setShowOptions(false)} /> 
      }
    </div>
  );
}

const SettingOptions = (props) => {
  const {deletePrompt, editMode} = useContext(CommentActionContext);
  const {closeMenu} = props;
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    window.addEventListener("click", closeMenu);

    return () => {
      setIsMounted(false);
      window.removeEventListener("click", closeMenu);
    }
  }, []);
  
  return (
    <div 
      className="post-settings-modal"
      style={{
        opacity: isMounted ? "1" : "0",
        top: isMounted ? "100%" : "150%",
        }}
    >
      <div className="settings-item"
        onClick={editMode.enable}
      >
        <div className="settings-icon">
          <img src={editIcon} alt="edit"/>
        </div>
        <span>Edit Comment</span>
      </div>
      <div className="settings-item"
        onClick={deletePrompt.show}
      >
        <div className="settings-icon">
          <img src={deleteIcon} alt=""/>
        </div>
        <span>Delete Comment</span>
      </div>
    </div>
  );
}

export default CommentContainer;