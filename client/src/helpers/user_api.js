const userUrl = "https://srf-odin-book.herokuapp.com/api/user";
const currentUserUrl = "https://srf-odin-book.herokuapp.com/api/user/current";

export function getCurrentUser(select, token) {
  const response = fetch(`${currentUserUrl}/?select=${select || ""}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export async function updateCurrentUser(data, token) {
  const userData = {
    display_name: data.displayName,
    username: data.username,
    password: data.password,
    // profile_picture will be either true or false,
    // which determines if user has changed the profile_picture (true) or not
    profile_picture: data.profilePicture instanceof File
  };
  
  const userInfoRes = await fetch(`${currentUserUrl}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  const profilePicture = data.profilePicture instanceof File && data.profilePicture;

  if(!profilePicture)
    return userInfoRes;

  const formData = new FormData();
  formData.append("profile_picture", profilePicture);

  const profilePicRes = fetch(`${currentUserUrl}/profile-picture`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  return profilePicRes;
}

export function getAllUser() {
  return fetch("https://srf-odin-book.herokuapp.com/api/user");
}

export function getAllSavedPosts(token) {
  const response = fetch(`${currentUserUrl}/saved-post`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getSavedPost(postId, token) {
  const response = fetch(`${currentUserUrl}/saved-post/${postId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function addSavedPost(postId, token) {
  const response = fetch(`${currentUserUrl}/saved-post`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify({postId})
  });

  return response;
}

export function deleteSavedPost(postId, token) {
  const response = fetch(`${currentUserUrl}/saved-post`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify({postId})
  });

  return response;
}

export function getCurrentUserFriends(userId, token) {
  const response = fetch(`${currentUserUrl}/friends`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function deleteCurrentUserFriend(friendId, token) {
  const response = fetch(`${currentUserUrl}/friends/${friendId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getUserPostReaction(postId, token) {
  const response = fetch(`${currentUserUrl}/reactions/?post=${postId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getReceivedRequests(token) {
  // role can be "requester" || "receiver"
  const response = fetch(`${currentUserUrl}/requests/?role=receiver`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getRequestStatus(userId, token) {
  const response = fetch(`${currentUserUrl}/requests/${userId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function createFriendRequest(userId, token) {
  const response = fetch(`${currentUserUrl}/requests`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({receiver: userId})
  });

  return response;
}

export function acceptFriendRequest(requestId, token) {
  const response = fetch(`${currentUserUrl}/requests/${requestId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function deleteFriendRequest(requestId, token) {
  const response = fetch(`${currentUserUrl}/requests/${requestId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response;
}

// select arg expects a comma seperated list of a user instance fields
// example: "display_name,_id,username,images,-password"
export function getUser(userId, select, token) {
  const response = fetch(`${userUrl}/${userId}/?select=${select ? select : ""}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getUserPosts(userId, token) {
  const response = fetch(`${userUrl}/${userId}/posts`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getUserImages(userId, count, token) {
  const response = fetch(`${userUrl}/${userId}/images/?count=${count ? count : ""}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}

export function getUserFriends(userId, count, token) {
  const response = fetch(`${userUrl}/${userId}/friends/?count=${count ? count : ""}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return response;
}