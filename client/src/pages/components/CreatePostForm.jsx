import {useState, useEffect, useContext} from "react";
import {IoIosClose} from "react-icons/io";
import {v4 as uuidv4} from "uuid";

import {TokenContext, UserContext, PostListActionContext} from "../../Context_Store";
import {validateFileTypes, validateFileSize} from "../../helpers/form";
import {createPost} from "../../helpers/post_api";
import Loading from "./Loading";

import imageIcon from "../../assets/img/picture.png";

const CreatePostForm = (props) => {
  const token = useContext(TokenContext);
  const {postList} = useContext(PostListActionContext);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    if(!postContent && postImages.length === 0) {
      setIsLoading(false);
      return;
    }

    createPost({content: postContent, images: postImages}, token)
      .then((res) => (res.status === 200 || res.status === 201) && res.json())
      .then(({post}) => {
        postList.append(post);
      })
      .catch(() => null)
      .finally(() => {
        setIsLoading(false)
        setPostContent("");
        setPostImages([]);
        props.closeForm();
      });
  }

  useEffect(() => {
    if(!postContent && postImages.length === 0)
      setIsValid(false);
    else 
    setIsValid(true);
  }, [postContent, postImages]);
  
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
        <ImagePreviews images={postImages} updateImages={setPostImages} />
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
          <span>Create</span>
        </button>
      </div>

    </form>
  );
}

const FormTitle = () => {
  return (
    <div className="post-form-title">
      <h2>Create Post</h2>
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
  const {images, updateImages} = props;
  
  function deleteImage(id) {
    updateImages([...images.filter((img) => img.id !== id)]);
  }

  return (
    <div className="post-image-preview">
      {images.map((img) => (
        <div className="preview-image-container" key={img.id}>
          <img src={URL.createObjectURL(img)} alt="preview-image"/>
          <div className="container-relative-overlay"></div>
          <div className="remove-img-btn" onClick={() => deleteImage(img.id)}>
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

    setValidationMsg("");
    setPostImages([...postImages, ...fileList]);
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

export default CreatePostForm;
