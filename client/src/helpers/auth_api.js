export function postSignin(username, password) {
  const response = fetch("https://srf-odin-book.herokuapp.com/api/auth/signin", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({username, password}),
  });

  return response;
}

export async function postSignup(profilePicture, displayName, username, password) {
  const userInfo = {
    display_name: displayName,
    username,
    password,
  };
  
  const userInfoRes = await fetch("https://srf-odin-book.herokuapp.com/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userInfo)
  });

  // If signup fails or there is no profilePicture, return fetch result
  if(userInfoRes.status !== 201 || !profilePicture)
    return userInfoRes;

  // Signup returns access token, use it to update profile picture
  const {token} = await userInfoRes.json();

  // For uploading multipart/form-data
  const formData = new FormData();
  formData.append("profile_picture", profilePicture);

  const profilePictureRes = fetch(`https://srf-odin-book.herokuapp.com/api/user/current/profile-picture`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    // fetch sends multipart/form-data by default
    body: formData
  });

  return profilePictureRes;
}

export function getRefreshToken() {
  const response = fetch("https://srf-odin-book.herokuapp.com/api/refresh", {
    credentials: "include",
  });

  return response;
}

export function getSignout() {
  const response = fetch("https://srf-odin-book.herokuapp.com/api/auth/signout", {
    credentials: "include",
  });

  return response
}

