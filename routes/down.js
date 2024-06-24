const router = require("express").Router();

router.get("/", (req,res) => {
    try{
        return res.render("down", {pageTitle: "Server suspended", layout: false, req});
    }catch(err){
        return res.redirect("/");
    }
});


module.exports = router;