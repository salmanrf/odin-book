const validTypes = [
  "image/jpeg",
  "image/png",
  "image/svg",
  "image/gif"
];

export function validateFileSize(fileList) {
  let totalSize = 0;

  // Max file count is 10
  if(fileList.length > 10) 
    return {valid: false, msg: "Can't upload more than 10 images"};

  for(const file of fileList) {
    totalSize += file.size;
  }
  
  // Max total size is 10MB
  if(totalSize >= 1024 * 1000 * 10) 
    return {valid: false, msg: "Can't upload more than 10MB"};    

  return {valid: true, msg: ""}
}

export function validateFileTypes(fileList) {
  for(const file of fileList) {
    if(!validTypes.includes(file.type))
      return {valid: false, msg: "Post images only! (jpg, png, svg, gif)"};
  }

  return {valid: true, msg: ""}
}

