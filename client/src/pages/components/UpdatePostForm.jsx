import {useState, useEffect, useContext} from "react";
import {IoIosClose} from "react-icons/io";
import {v4 as uuidv4} from "uuid";

import {TokenContext, UserContext, PostActionContext} from "../../Context_Store";
import {validateFileTypes, validateFileSize} from "../../helpers/form";
import {updatePost as fetchUpdatePost} from "../../helpers/post_api";
import Loading from "./Loading";

import imageIcon from "../../assets/img/picture.png";

const UpdatePostForm = () => {
  const {post, updatePost} = useContext(PostActionContext);
  const token = useContext(TokenContext);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  useEffect(() => {
    setPostContent(post.content);    
    setPostImages(
      post.images.map((img) => 
        ({
          path: img,
          src: `https://srf-odin-book.herokuapp.com/${img}`,
          id: uuidv4(),
          isNew: false
        })
      )
    );
    
    return () => {
      setPostContent("");
      setPostImages([]);
    };
  }, []);

  useEffect(() => {
    if(!postContent && postImages.length === 0)
      setIsValid(false);
    else 
    setIsValid(true);
  }, [postContent, postImages]);

  function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    if(!postContent && postImages.length === 0) {
      setIsLoading(false);
      return;
    }

    const newImages = postImages.filter((postImg) => postImg.isNew);

    fetchUpdatePost(post._id, {contentUpdate: postContent, deletedImages, newImages}, token)
      .then((res) => {
        if(res.status === 200 || res.status === 201) {
          return res.json();
        }

        throw new Error();
      })
      .then(({post}) => {
        updatePost.update(post);
      })
      .catch(() => null)
      .finally(() => {
        setIsLoading(false);
        updatePost.closeForm();
      });
  }

  function updateDeletedImages(img) {
    setDeletedImages([...deletedImages, img.path]);
  }

  function deleteImage(target) {
    if(!target.isNew) {
      updateDeletedImages(target);
    }
    
    setPostImages([...postImages.filter((img) => img.id !== target.id)]);
  }
  
  return (
    <form 
      className="post-form-container" 
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >

      {isLoading && 
        <Loading background={"hsl(0, 0%, 0%, 80%)"} />
      }

      <FormTitle />
      
      <FormHeader />

      <FormTextInput content={postContent} setContent={setPostContent}/>

      {postImages.length > 0 && 
        <ImagePreviews images={postImages} deleteImage={deleteImage} />
      }
      
      <AddToPost 
        setValidationMsg={setValidationMsg} 
        postImages={postImages}
        setPostImages={setPostImages} 
      />

      <PostValidation valid={isValid} message={validationMsg} />

      <div className="post-form-control">
        <button 
          type={isValid ? "submit" : "button"}
          style={isValid ? {} : {
            opacity: "0.5"
          }}
        >
          <span>Update</span>
        </button>
      </div>

    </form>
  );
}

const FormTitle = () => {
  return (
    <div className="post-form-title">
      <h2>Update Post</h2>
    </div>
  );
} 

const FormHeader = () => {
  const user = useContext(UserContext);
  
  return (
    <div className="post-header">
      <div className="profile-picture">
        <img src={`https://srf-odin-book.herokuapp.com/${user.profile_picture}`} />
      </div>
      <div className="post-info">
        <div className="post-author">{user.display_name}</div>
      </div>
    </div>
  );
}

const FormTextInput = (props) => {
  const user = useContext(UserContext);
  const {content, setContent} = props;
  
  return (
    <textarea 
      name="post_content" 
      cols="30" rows="5"
      placeholder={`What is on your on mind, ${user.display_name} ?`}
      value={content}
      onChange={(e) => setContent(e.target.value)}
    />
  );
}

const ImagePreviews = (props) => {
  const {images, deleteImage} = props;

  return (
    <div className="post-image-preview">
      {images.map((img) => (
        <div className="preview-image-container" key={img.id}>
          <img src={img.src} alt="preview-image"/>
          <div className="container-relative-overlay"></div>
          <div className="remove-img-btn" onClick={() => deleteImage(img)}>
            <IoIosClose />
          </div>
        </div>
      ))}
    </div>
  );
}

const AddToPost = (props) => {
  const {postImages, setPostImages, setValidationMsg} = props;
  
  function handleFilesChange(e) {
    let validationRes = {};
    
    if(e.target.files.length === 0)
      return;
  
    validationRes = validateFileTypes(e.target.files);

    if(!validationRes.valid)
      return setValidationMsg(validationRes.msg);

    validationRes = validateFileSize(e.target.files);

    if(!validationRes.valid)
      return setValidationMsg(validationRes.msg);


    const fileList = Array.from(e.target.files);

    for(const file of fileList) {
      // SRC AND ISNEW MUST BE APPENDED MANUALLY
      // DON'T USE SPREAD OPERATOR !!! 
      file.src = URL.createObjectURL(file);
      file.isNew = true;
      file.id = uuidv4();
    }

    // IMPORTANT
    // THE CODE BELOW WON'T WORK WITH FORM DATA
    // BECAUSE IT TURNS EACH FILE IN THE FILE LIST INTO PLAIN OBJECT
    // Array.from(e.target.files);
    // .map((file) => ({...file, src: URL.createObjectURL(file), isNew: true}))

    setValidationMsg("");
    setPostImages(
      [
        ...postImages, 
        ...fileList
      ]
    );
  }
  
  return(
    <div className="add-to-post">
      <span>Add to your post</span>
      <input 
        type="file" 
        id="post_images" 
        name="post_images" 
        accept="image/jpeg, image/png, image/svg, image/gif"
        onChange={handleFilesChange}
        multiple 
      />
      <label htmlFor="post_images">
        <img src={imageIcon} alt="add-image-icon"/>
      </label>
    </div>
  );
}

const PostValidation = (props) => {
  const {message} = props;
  
  return (
    <div className="post-validation-msg">
      <span>{message}</span>
    </div>
  );
}

export default UpdatePostForm;
