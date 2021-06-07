import {Link} from "react-router-dom";

const PostContent = (props) => {
  const {post} = props;
  
  return (
    <div className="post-content">
      <pre className="post-text">{post.content}</pre>
      {post.images.length > 0 && 
        <div className="post-images">
          <Link to={`/post/${post._id}`} className="post-image-main">
            <div className="post-image-overlay"></div>
            <img src={`https://srf-odin-book.herokuapp.com/${post.images[0]}`} alt="post images" />
          </Link>
          {post.images.length > 1 && 
            <Link to={`/post/${post._id}`} className="post-image-other">
              <div className="post-image-overlay"></div>
              <img src={`https://srf-odin-book.herokuapp.com/${post.images[1]}`} alt="post images" />
            </Link>
          }
          {post.images.length > 2 && 
            <Link to={`/post/${post._id}`} className="post-image-other">
              <img src={`https://srf-odin-book.herokuapp.com/${post.images[2]}`} alt="post images" />
              <div className="post-image-overlay">
                {/* the number of remaining images */}
                <span>{post.images.length - 2}+</span>
              </div>
            </Link>
          }  
        </div>
      }
    </div>
  );
}

export default PostContent;