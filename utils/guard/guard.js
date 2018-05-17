const isAdmin = (req) => {
    return req.user.role === 'admin';
}

module.exports = {
    isAdmin: isAdmin,
}