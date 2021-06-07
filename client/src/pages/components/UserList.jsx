import {useState, useEffect, useContext} from "react";

import {TokenContext} from "../../Context_Store";
import {getAllUser} from "../../helpers/user_api";
import UserContainer from "./UserContainer";
import FriendListButton from "./FriendListButton";
import Loading from "./Loading";

const UserList = () => {
  const token = useContext(TokenContext);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    document.title = "Users";
    
    getAllUser()
      .then((res) => res.status === 200 && res.json())
      .then(({users}) => users && setUsers(users))
      .catch(() => null)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="wall-main">
      <h1 id="user-list-title">Browse Users</h1>
      <div className="post-list">
        {isLoading ?
          <Loading />
          :
          users.map((usr) => (
            <UserContainer 
              user={usr} 
              key={usr._id} 
            />
          ))
        }
      </div>   
      <FriendListButton />
    </div>
  );
}

export default UserList;