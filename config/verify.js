const checkVerification = (req, res, next) => {
    // Assuming you have a user object with a 'verified' property
    if (!req.user.upgrade) {
        next();
    } else {
        res.redirect('/locked');
    }
};

module.exports = checkVerification