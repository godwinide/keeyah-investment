const Site = require("../model/Site");

const router = require("express").Router();


router.get("/", async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("index", { pageTitle: "Welcome", site, req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/about", async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("about-us", { pageTitle: "Welcome", site, req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/contact-us", async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("contact-us", { pageTitle: "Welcome", site, req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/market-data", async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("market-data", { pageTitle: "Welcome", site, req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/services", async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("index", { pageTitle: "Welcome", site, req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});

router.get("/faq", async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("faq", { pageTitle: "Welcome", site, req, res });
    }
    catch (err) {
        return res.redirect("/");
    }
});


module.exports = router;