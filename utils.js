

function getFileType(s) {
    let arr = s.split(".");
    return arr[arr.length-1];
}


module.exports = {
    getFileType
}