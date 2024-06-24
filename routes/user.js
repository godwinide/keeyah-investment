const router = require("express").Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../model/User");
const History = require("../model/History");
const bcrypt = require("bcryptjs");
const comma = require("../utils/comma");
const Deposit = require("../model/Deposit");
const uuid = require("uuid");
const Withdraw = require("../model/Withdraw");
const checkVerification = require("../config/verify");
const Site = require("../model/Site");

router.get("/dashboard", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("dashboard", { res, pageTitle: "Dashboard", site, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/locked", ensureAuthenticated, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("locked", { res, pageTitle: "Locked", req, site, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/locked");
    }
});

router.get("/deposit", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        const deposits = await Deposit.find({ userID: req.user.id });
        return res.render("deposit", { res, site, pageTitle: "Deposit", deposits, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.post("/deposit", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const {
            method,
            amount
        } = req.body;

        if (!method || !amount) {
            req.flash("error_msg", "Fill mandatory fields");
            return res.redirect("/deposit");
        }

        const reference = uuid.v1().split("-").slice(0, 3).join("");

        const newDeposit = new Deposit({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });

        const newHistory = new History({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });


        await newDeposit.save();
        await newHistory.save();

        req.flash("success_msg", "Your deposit request has been submitted successfully!");
        return res.redirect("/deposit");
    } catch (err) {
        console.log(err)
        return res.redirect("/dashboard");
    }
});

router.get("/withdraw", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        const withdrawals = await Withdraw.find({ userID: req.user.id });
        return res.render("withdraw", { res, pageTitle: "Deposit", withdrawals, site, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.post("/withdraw", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const {
            method,
            amount,
            pin
        } = req.body;


        if (!method || !amount || !pin) {
            req.flash("error_msg", "Fill mandatory fields");
            return res.redirect("/withdraw");
        }

        if (Number(amount) > Number(req.user.balance)) {
            req.flash("error_msg", "Insufficient funds");
            return res.redirect("/withdraw");
        }

        if (req.user.withdrawalPin != pin) {
            req.flash("error_msg", "Incorrect Transfer PIN");
            return res.redirect("/withdraw");
        }

        if (req.user.cot > 0) {
            req.flash("error_msg", `To process the transaction, a transfer fee of $${req.user.cot} is required as a deposit.`);
            return res.redirect("/withdraw");
        }

        const reference = uuid.v1().split("-").slice(0, 3).join("");

        const newWithdraw = new Withdraw({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });

        const newHistory = new History({
            amount: Number(amount),
            method,
            userID: req.user.id,
            user: req.user,
            reference
        });

        await newWithdraw.save();
        await newHistory.save()
        await User.updateOne({ _id: req.user.id }, {
            balance: req.user.balance - Number(amount)
        })

        req.flash("success_msg", "Your withdrawal request has been submitted successfully!");
        return res.redirect("/withdraw");
    } catch (err) {
        console.log(err)
        return res.redirect("/dashboard");
    }
});

router.get("/upgrade", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("upgrade", { res, pageTitle: "Deposit", site, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/transactions", ensureAuthenticated, async (req, res) => {
    try {
        const site = await Site.findOne();
        const transactions = await History.find({ userID: req.user.id });
        return res.render("transaction", { res, pageTitle: "Transactions", transactions, req, site, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/trade-history", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("tradeHistory", { res, pageTitle: "Trade History", site, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/update-password", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("updatePassword", { res, pageTitle: "Update Password", site, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.post("/update-password", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const { currentPassword, password, password2 } = req.body;

        if (!currentPassword || !password || !password2) {
            req.flash("error_msg", "Please fill all fields!");
            return res.redirect("/update-password");
        }

        if (password.length < 8) {
            req.flash("error_msg", "Password should be at least 8 characters long");
            return res.redirect("/update-password");
        }

        if (password !== password2) {
            req.flash("error_msg", "Passwords do not match");
            return res.redirect("/update-password")
        }

        const isMatch = await bcrypt.compare(currentPassword, req.user.password);

        if (!isMatch) {
            req.flash("error_msg", "Current password is incorrect");
            return res.redirect("/update-password");
        }

        return res.render("updatePassword", { res, pageTitle: "Update Password", req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});

router.get("/top-investors", ensureAuthenticated, checkVerification, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("topInvestor", { res, pageTitle: "Top Investors", site, req, comma, layout: "layout2" });
    } catch (err) {
        return res.redirect("/dashboard");
    }
});


module.exports = router;