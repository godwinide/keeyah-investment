const router = require("express").Router();
const passport = require("passport");

router.get("/signin", (req, res) => {
    try {
        return res.render("admin/signin", { layout: "admin/layout", pageTitle: "Login", req, res });
    } catch (err) {
        return res.redirect("/");
    }
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/admin/signin',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin/signin');
});



module.exports = router;