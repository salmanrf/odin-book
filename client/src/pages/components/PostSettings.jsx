import {useState, useEffect, useContext} from "react";
import {BsThreeDots} from "react-icons/bs";

import {PostActionContext, PostListActionContext} from "../../Context_Store";

import editIcon from "../../assets/img/edit.png";
import deleteIcon from "../../assets/img/delete.png";

const PostSettings = (props) => {
  const [showOptions, setShowOptions] = useState(false);
  
  function closeMenu() {
    setShowOptions(false);
  }
  
  return (
    <div 
      className="post-settings"
      onClick={() => setShowOptions(true)}
    >
      <BsThreeDots />
      {showOptions && 
        <SettingOptions closeMenu={closeMenu} />
      }
    </div>
  );
}

const SettingOptions = (props) => {
  const {updatePost, deletePost} = useContext(PostActionContext);
  const {closeMenu} = props;
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);

    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      setIsMounted(false);
    };
  }, []);
  
  return (
    <div 
      className="post-settings-modal"
      style={{
        opacity: isMounted ? "1" : "0",
        top: isMounted ? "100%" : "150%",
      }}
    >
      <div className="settings-item" onClick={updatePost.openForm}>
        <div className="settings-icon">
          <img src={editIcon} alt="edit"/>
        </div>
        <span>Edit Post</span>
      </div>
      <div className="settings-item" onClick={deletePost.openPrompt}>
        <div className="settings-icon">
          <img src={deleteIcon} alt=""/>
        </div>
        <span>Delete Post</span>
      </div>
    </div>
  )
}

export default PostSettings;