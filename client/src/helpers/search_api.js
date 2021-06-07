const searchUrl = "https://srf-odin-book.herokuapp.com/api/search";

export function searchAll(keyword) {
  const response = fetch(`${searchUrl}/?keyword=${keyword || ""}`);

  return response;
}