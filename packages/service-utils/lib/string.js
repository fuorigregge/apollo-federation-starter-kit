const randomString = function (chars = 17, pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
    let text = "";
    for (let i = 0; i < chars; i++) {
        text += pool.charAt(Math.floor(Math.random() * pool.length));
    }

    return text;
};

module.exports = {
    randomString
}