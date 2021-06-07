import {useState, useEffect, useContext} from "react";

import {TokenContext, UserContext} from "../../Context_Store";
import {getRequestStatus, createFriendRequest, acceptFriendRequest, deleteFriendRequest, deleteCurrentUserFriend} from "../../helpers/user_api";

import spinning from "../../assets/img/spinning.svg";

const UserFriendStatus = (props) => {
  const currentUser = useContext(UserContext);
  const token = useContext(TokenContext);
  const {user} = props;
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    setIsMounted(true);

    if(currentUser._id !== user._id) {
      return ( 
        getRequestStatus(user._id, token)
          .then((res) => res.status === 200 && res.json())
          .then(({request}) => {
            if(request)
              setRequest(request);
          })
          .catch(() => null)
          .finally(() => setIsLoading(false))
        );
    }

    return () => setIsMounted(false);
  }, []);

  return (
    <div className="user-friend-status">
      {!isLoading && 
        (() => {
          if(currentUser._id === user._id)
            return null;
          
          if(!request._id) {
            if(request.status === 0)
              return (
                <AddFriendBtn user={user} request={request} updateRequest={setRequest} />
              );
            else if(request.status === 3) 
              return (
                <DeleteFriendBtn user={user} request={request} updateRequest={setRequest} />
              );
          }

          if(request.status === 2) {
            return (
              <>
                <RequestOption user={user} request={request} updateRequest={setRequest} />
              </>
            );
          }

          if(request.status === 1) {
            return (
              <CancelRequestBtn user={user} request={request} updateRequest={setRequest} />
            );
          }
            
        })()
      }
    </div>
  );
}

const AddFriendBtn = (props) => {
  const token = useContext(TokenContext);
  const {user, updateRequest} = props;
  const [isLoading, setIsLoading] = useState(false);
  
  function handleBtnClick() {
    setIsLoading(true);

    createFriendRequest(user._id, token)
      .then((res) => res.status === 201 && res.json())
      .then(({request}) => request && updateRequest(request))
      .catch(() => null)
  }

  return (
    <div className="friend-request-btn" onClick={handleBtnClick}>
      {isLoading ?
        <img src={spinning} alt=""/>
        :
        <span>Add Friend</span>
      }
    </div>
  );
}

const DeleteFriendBtn = (props) => {
  const token = useContext(TokenContext);
  const {user, updateRequest} = props;
  const [isLoading, setIsLoading] = useState(false);
  
  function handleBtnClick() {
    if(isLoading)
      return;
    
    setIsLoading(true);

    deleteCurrentUserFriend(user._id, token)
      .then((res) => res.status === 200 && res.json())
      .then(({request}) => request && updateRequest(request))
      .catch(() => null);
  }

  return (
    <div className="friend-request-btn" onClick={handleBtnClick}>
      {isLoading ?
        <img src={spinning} alt=""/>
        :
        <span>Delete Friend</span>
      }
    </div>
  );
}

const CancelRequestBtn = (props) => {
  const token = useContext(TokenContext);
  const {request, updateRequest} = props;
  const [isLoading, setIsLoading] = useState(false);

  function handleDeleteRequest() {
    setIsLoading(true);

    deleteFriendRequest(request._id, token)
      .then((res) => res.status === 200 && res.json())
      .then(({request}) => request && updateRequest(request))
      .catch(() => null)
  }

  return (
    <div className="friend-request-btn" onClick={handleDeleteRequest}>
      {isLoading ?
        <img src={spinning} alt=""/>
        :
        <span>Cancel Request</span>
      }
    </div>
  );
}

const RequestOption = (props) => {
  const token = useContext(TokenContext);
  const {user, request, updateRequest} = props;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  function handleAcceptRequest() {
    if(isAccepting || isRejecting)
      return;
    
    setIsAccepting(true);

    acceptFriendRequest(request._id, token)
      .then((res) => res.status === 200 && res.json())
      .then(({request, newFriend}) => {
        request && updateRequest(request);
        console.log(newFriend);
      })
      .catch(() => null);
  }

  function handleRejectRequest() {
    if(isAccepting || isRejecting)
      return;

    setIsRejecting(true);

    deleteFriendRequest(request._id, token)
      .then((res) => res.status === 200 && res.json())
      .then(({request}) => request && updateRequest(request))
      .catch(() => null);
  }
  
  return (
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
  );
}

export default UserFriendStatus;