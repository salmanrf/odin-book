import {useState, useEffect, useContext} from "react";

import {TokenContext, PostContext} from "../../Context_Store";
import {createReaction, getPostReaction} from "../../helpers/post_api";
import {getUserPostReaction} from "../../helpers/user_api";

import comments from "../../assets/img/comments.png";
import react from "../../assets/img/react.png";
import like from "../../assets/img/like.png";
import laughing from "../../assets/img/laughing.png";
import kiss from "../../assets/img/kiss.png";
import crying from "../../assets/img/crying.png";
import angry from "../../assets/img/angry.png";

const reactionIcons = {
  ["like"]: {
    name: "like",
    img: like
  },
  ["laughing"]: {
    name: "laughing",
    img: laughing
  },
  ["kiss"]: {
    name: "kiss",
    img: kiss
  },
  ["crying"]: {
    name: "crying",
    img: crying
  },
  ["angry"]: {
    name: "angry",
    img: angry
  },
};

const PostReaction = (props) => {
  const token = useContext(TokenContext);
  const post = useContext(PostContext);
  const [showReactMenu, setShowReactMenu] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postReactions, setPostReactions] = useState(null);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    Promise.all([
      getPostReaction(post._id, token),
      getUserPostReaction(post._id, token)
    ])
    .then((res) => {
      if(res[0].status === 200 && res[1].status === 200) {
        return Promise.all([
          res[0].json(),
          res[1].json()
        ])
      }

      throw new Error();
    })
    .then(([reactData, {userReact}]) => {
      setPostReactions(reactData);
      
      if(userReact)
        setUserReaction(userReact);
    })
    .catch(() => null)
    .finally(() => setIsLoading(false));
  }, []);

  function openMenuTimeout() {
    // Open menu and clear existing timeout
    setShowReactMenu(true);
    clearTimeout(timeoutId);
  }

  function closeMenuTimeout() {
    // Close menu after 0.5 second
    setTimeoutId(
      setTimeout(() => {
        setShowReactMenu(false);
      }, 500)
    );
  }

  function updateUserReaction(reactUpdate) {
    if(!reactUpdate) {
      const update = {count: postReactions.count - 1}

      if(userReaction)
        update[userReaction.type] = postReactions[userReaction.type] - 1;
    
      setPostReactions({
        ...postReactions, 
        ...update
      });
      
      return setUserReaction(null);
    } 

    if(!userReaction) {
      setPostReactions({
        ...postReactions, 
        count: postReactions.count + 1,
        [reactUpdate.type]: postReactions[reactUpdate.type] + 1,
      });

      return setUserReaction(reactUpdate);
    }

    if(userReaction.type !== reactUpdate.type) {
      setPostReactions({
        ...postReactions, 
        [userReaction.type]: postReactions[userReaction.type] - 1,
        [reactUpdate.type]: postReactions[reactUpdate.type] + 1,
      });
    }
    
    setUserReaction(reactUpdate);
  }

  return (
    <div className="post-reaction-container">
      <PostReactionOption 
        menu={{
          status: showReactMenu,
          open: openMenuTimeout,
          close: closeMenuTimeout,
          closeImmediate: () => setShowReactMenu(false)
        }}
        userReact={{
          reaction: userReaction,
          update: updateUserReaction
        }}
      />
      {postReactions && postReactions.count > 0 && 
        <PostReactionCount reactions={postReactions} />
      }
      <div className="post-new-reaction">
        {!isLoading && 
          <PostActionReact 
            menu={{
              open: openMenuTimeout,
              close: closeMenuTimeout,
              closeImmediate: () => setShowReactMenu(false)
            }}
            userReact={{
              reaction: userReaction,
              update: updateUserReaction
            }}
          />
        }
        <PostActionComment focusComment={props.focusComment}/>
      </div>
    </div>
  );
}

const PostActionReact = (props) => {
  const token = useContext(TokenContext);
  const post = useContext(PostContext);
  const {menu, userReact} = props;
  
  async function handleActionClick() {
    menu.closeImmediate();

    // Update user reaction temporarily
    if(userReact.reaction) 
      userReact.update(null);
    else
      userReact.update({type: "like"});
    
    const res = await createReaction(post._id, null, token);

    if(res.status === 200) {
      const {reaction} = await res.json();

      // Update user reaction with fetch result
      userReact.update(reaction);
    } 
  }
  
  return (
    <div 
      className={`add-like-btn ${userReact.reaction ? "reacted" : ""}`}
      onClick={handleActionClick}
      onMouseOver={menu.open}
      onMouseLeave={menu.close}
    >
      <img src={userReact.reaction ? reactionIcons[userReact.reaction.type].img : react} alt=""/>
      <span>React</span>
    </div>
  );
}

const PostActionComment = (props) => {
  return (
    <div className="add-comment-btn" 
      onClick={props.focusComment}
    >
      <img src={comments} alt=""/>
      <span>Comment</span>
    </div>
  );
}

const PostReactionCount = (props) => {
  const {reactions} = props;

  return (
    <div className="post-reaction-count">
      <div className="reaction-list">
        {Object.keys(reactionIcons).map((r) => (
          reactions[r] > 0 && <ReactionIcon icon={reactionIcons[r]} key={r} />
        ))}
      </div>
      <div className="reaction-count">
        <span>{reactions.count}</span>
      </div>
    </div>
  );
}

const PostReactionOption = (props) => {
  const post = useContext(PostContext);
  const token = useContext(TokenContext);
  const {menu, userReact} = props;

  return (
    <div className="post-reaction-option" 
      style={{
        display: menu.status ? "flex" : "none",
      }}
      onMouseOver={menu.open}
      onMouseLeave={menu.close}
    >
      {(() => {
        const buttons = [];

        for(const r in reactionIcons) {
          buttons.push(
            <PostReactionBtn 
              post={post}
              token={token}
              icon={reactionIcons[r]} 
              menu={menu}
              userReact={userReact}
              key={Date.now() + r} 
            />
          );
        }

        return buttons;
      })()}
    </div>
  );
}

const ReactionIcon = (props) => {
  return (
    <div className="reaction-icon">
      <img src={props.icon.img} alt=""/>
    </div>
  );
}

const PostReactionBtn = (props) => {  
  const {post, token, icon, menu, userReact} = props;
  
  async function handleBtnClick() {
    menu.closeImmediate();

    // Update user reaction temporarily
    userReact.update({type: icon.name});
    
    const res = await createReaction(post._id, icon.name, token);

    if(res.status === 200) {
      const {reaction} = await res.json();

      // Update user reaction with fetch result
      userReact.update(reaction);
    }
  }

  return (
    <div className="reaction-icon"
      onClick={handleBtnClick}
    >
      <img src={icon.img} alt=""/>
    </div>
  );
}

export default PostReaction;