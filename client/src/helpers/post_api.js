const serverURL = "https://srf-odin-book.herokuapp.com/api";

export function getPosts() {
  const response = fetch(`${serverURL}/post`);

  return response;
}

export function getFeedPosts(token) {
  const response = fetch(`${serverURL}/post/feed`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export async function createPost(postData, token) {
  // Upload post content
  const postContent = JSON.stringify({content: postData.content});
  const postImages = new FormData();

  // If postData contains images, append the images to FormData...
  // and include a query in fetch url specifying whether to save the post temporarily or not...
  // 1 for temporary (postData contains images), 0 for permanently (no image)
  let images = 0;
  if(postData.images && postData.images.length > 0) {
    for(const img of postData.images) {
      postImages.append("images", img);
    }

    images = 1;
  } 
  
  const contentResponse = await fetch(`${serverURL}/post/?images=${images}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }, 
    body: postContent
  });

  if(!images || contentResponse.status !== 201) 
    return contentResponse;

  // Upload post Images
  const {post} = await contentResponse.json();

  const response = fetch(`${serverURL}/post/${post._id}/images/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }, 
    body: postImages
  });

  return response;
}

export async function updatePost(postId, updateData, token) {
  // Send content update and list of deleted files 
  const update = JSON.stringify(updateData);

  const contentUpdateRes = await fetch(`${serverURL}/post/${postId}/`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: update
  });

  if(updateData.newImages.length === 0 || contentUpdateRes.status !== 200) 
    return contentUpdateRes;

  const formData = new FormData();

  for(const img of updateData.newImages) {
    formData.append("images", img);
  }

  const ImageUpdateRes = fetch(`${serverURL}/post/${postId}/images/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData
  });

  return ImageUpdateRes;
}

export function deletePost(postId, token) {
  const response = fetch(`${serverURL}/post/${postId}/`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getSinglePost(postId) {
  const response = fetch(`${serverURL}/post/${postId}`);

  return response;
}

export function getPostReaction(postId, token) {
  const response = fetch(`${serverURL}/post/${postId}/reactions`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function createReaction(postId, type, token) {
  const response = fetch(`${serverURL}/post/${postId}/reactions/?${type ? "type=" + type : ""}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getPostComment(postId, count, token) {
  const response = fetch(`${serverURL}/post/${postId}/comments/?count=${count || null}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function createComment(postId, content, token) {
  const body = JSON.stringify({content});

  const response = fetch(`${serverURL}/post/${postId}/comments/`, {
    method: "POST", 
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body
  });

  return response;
}

export function updateComment(commentId, content, token) {
  const body = JSON.stringify({update: content});

  const response = fetch(`${serverURL}/post/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body
  });

  return response;
}

export function deleteComment(postId, commentId, token) {
  const response = fetch(`${serverURL}/post/${postId}/comments/${commentId}`, {
    method: "DELETE", 
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}