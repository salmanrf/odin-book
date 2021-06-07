import {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import {BiSearch, BiArrowBack} from "react-icons/bi";

import {searchAll} from "../../helpers/search_api";

const SearchBox = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  
  function handleSearchChange(e) {
    clearTimeout(timeoutId);

    if(!e.target.value)
      return setSearchResults(null);
    
    setTimeoutId(
      setTimeout(() => handleSearch(e.target.value), 150)
    );
  }

  function handleSearch(keyword) {
    searchAll(keyword)
      .then((res) => res.status === 200 && res.json())
      .then((res) => res && setSearchResults(res));
  }
  
  return (
    <div id="search-container">
      <div id="search-input-container"
        onClick={() => setIsActive(true)}  
      >
        <div id="search-btn"
          style={{
            width: isActive ? "0" : "35px",
            opacity: isActive ? "0" : "1",
          }}
        >
          <BiSearch />
        </div>
        <input 
          type="text" 
          name="search" 
          placeholder="Find on OdinBook" 
          id="search-input" 
          style={{
            width: isActive && "290px",
            paddingLeft: isActive && "10px"
          }}
          onChange={handleSearchChange}
        />
      </div>
      <SearchResultList isActive={isActive} results={searchResults} closeSearch={() => setIsActive(false)} />
    </div>
  );
}

const SearchResultList = (props) => {
  const {isActive, results, closeSearch} = props;
  
  return (
    <div id="search-result-container"
        style={{
          opacity: isActive && "1",
          display: isActive && "block"
        }}
    >
      <div id="search-result-header">
        <div id="search-close-btn"
          // This event will propagate to it's parent "#search-input-container"
          // which will trigger another handler that also call "setIsActive"
          onClick={(e) => {
            closeSearch();
            // Either stop the propagation
            e.stopPropagation();
          }}
          // Or defer the statement in event loop
          // onClick={() => setTimeout(() => setIsActive(false), 0)}
        >
          <BiArrowBack 
            style={{
              right: isActive && "0",
              opacity: isActive && "1",
            }}
          />
        </div>
      </div>
      {results && 
        <div id="search-result-list">
          {results.users && results.users.map((user) => (
              <UserSearchResult user={user} />
          ))}
          {results.posts && results.posts.map((post) => (
              <PostSearchResult post={post} />
          ))}
        </div>
      }
    </div>
  );
}

const UserSearchResult = (props) => {
  const {user} = props;
  
  return (
    <Link to={`/user/${user._id}`} className="user-search-result">
      <div className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${user.profile_picture}`} />
      </div>
      <div className="user-display-name">{user.display_name}</div>
    </Link>
  )
}

const PostSearchResult = (props) => {
  const {post} = props;
  
  return (
    <Link to={`/post/${post._id}`} className="post-search-result">
      <div className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${post.author.profile_picture}`} />
      </div>
      <div className="user-display-name">{post.author.display_name}</div>
      <div className="post-search-content-overview">
        <span>
          "
          {post.content.length <= 50 ?
            post.content
            :
            post.content.substr(0, 50)
          }
          "
        </span>
      </div>
    </Link>
  )
}

export default SearchBox;