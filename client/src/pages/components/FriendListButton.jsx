import {useContext} from "react";
import {FaUserFriends} from "react-icons/fa";

import {FriendListContainerContext} from "../../Context_Store";

const FriendListButton = () => {
  const {isShown, show, hide} = useContext(FriendListContainerContext);
  
  return (
    <div 
      className="friend-list-button"
      onClick={isShown ? hide : show}
    >
      <FaUserFriends />
    </div>
  );
}

export default FriendListButton;