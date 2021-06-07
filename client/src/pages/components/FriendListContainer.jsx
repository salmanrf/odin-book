import {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";

import {TokenContext, UserContext, FriendListContainerContext} from "../../Context_Store";
import {getCurrentUserFriends, getReceivedRequests} from "../../helpers/user_api";
import {acceptFriendRequest, deleteFriendRequest} from "../../helpers/user_api";

import spinning from "../../assets/img/spinning.svg";

const FriendListContainer = () => {
  const user = useContext(UserContext);
  const token = useContext(TokenContext);
  const {isShown, show, hide} = useContext(FriendListContainerContext);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    Promise.all([
      getReceivedRequests(token),
      getCurrentUserFriends(user._id, token)
    ])
    .then(([requestRes, friendRes]) => (
        Promise.all([
          requestRes.status === 200 && requestRes.json(),
          friendRes.status === 200 && friendRes.json(),
        ])
      )
    )
    .then(([{requests}, {friends}]) => {
      requests && setRequests(requests);
      friends && setFriends(friends);
    })
    .catch(() => null);
  }, []);

  return (
    <div id="friend-list-container"
      style={{right: isShown && "0"}}
      onClick={hide}
    >
      <div id="friend-request-list" className="friend-list-section">
        <h1>Friend Requests</h1>
        {requests.map((req) => (
          <FriendRequestContainer 
            request={req} 
            deleteRequest={(reqId) => setRequests(requests.filter((req) => req._id !== reqId))}
            key={req._id}
          />          
        ))}
      </div>
      <div id="friend-list" className="friend-list-section">
        <h1>Friends</h1>
        {friends.map((friend) => (
          <FriendChatLink friend={friend} key={friend._id} />
        ))}
      </div>
    </div>
  );
}

const FriendChatLink = (props) => {
  const {friend} = props;
  
  return (
    <div className="friend-chat-link">
      <div className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${friend.profile_picture}`}/> 
      </div>
      <span>{friend.display_name}</span>
    </div>
  );
}

const FriendRequestContainer = (props) => {
  const token = useContext(TokenContext);
  const {request, deleteRequest} = props;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    return () => setIsMounted(false);
  }, []);

  function handleAcceptRequest() {
    if(isAccepting || isRejecting)
      return;

    setIsAccepting(true);

    acceptFriendRequest(request._id, token) 
      .then((res) => {
        if(res.status === 200) {
          setTimeout(() => {
            deleteRequest(request._id);
          }, 150);
        }
      })
      .catch(() => null)
  }

  function handleRejectRequest() {
    if(isAccepting || isRejecting)
      return;

    setIsRejecting(true);

    deleteFriendRequest(request._id, token) 
      .then((res) => {
        if(res.status === 200) {
          setTimeout(() => {
            deleteRequest(request._id);
          }, 150);
        }
      })
      .catch(() => null)
  }

  return (
    <div 
      className="friend-request-container" 
      key={request._id} 
      style={{height: `${isMounted ? "50px" : "0"}`}}
    >
      <Link to={`/user/${request.requester._id}`} className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${request.requester.profile_picture}`} />
      </Link>
      <Link to={`/user/${request.requester._id}`} className="user-display-name">{request.requester.display_name}</Link>
      <div className="friend-request-options">
        <div className="friend-request-btn accept" onClick={handleAcceptRequest}>
          {isAccepting ? 
            <img src={spinning} alt=""/>
            :
            <span>Accept</span>
          }
        </div>
        <div className="friend-request-btn reject" onClick={handleRejectRequest}>
          {isRejecting ? 
            <img src={spinning} alt=""/>
            :
            <span>Reject</span>
          }
        </div>
      </div>
    </div>
  )
}

export default FriendListContainer;