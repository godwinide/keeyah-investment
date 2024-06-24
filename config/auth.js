module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Login required');
      res.redirect('/signin');
    },
    ensureAdmin: function(req, res, next) {
      if (req.isAuthenticated()) {
        if(req.user.isAdmin){
            return next();
        }
        req.flash('error_msg', 'Login required');
        res.redirect('/admin/signin');
      }
      req.flash('error_msg', 'Login required');
      res.redirect('/admin/signin');
    },
    forwardAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');      
    }
  };