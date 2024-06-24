const router = require("express").Router();
const User = require("../../model/User");
const Deposit = require("../../model/Deposit");
const Withdraw = require("../../model/Withdraw");
const { ensureAdmin } = require("../../config/auth");
const comma = require("../../utils/comma");
const bcrypt = require("bcryptjs");
const Site = require("../../model/Site");

router.get("/", ensureAdmin, async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false });
        const pendingDeposits = await Deposit.find({ status: "pending" });
        const pendingWithdrawals = await Withdraw.find({ status: "pending" });
        return res.render("admin/dashboard", { layout: "layout3", comma, users, pendingDeposits, pendingWithdrawals, res, req });
    }
    catch (err) {
        return res.redirect("/admin");
    }
});

router.get("/settings", ensureAdmin, async (req, res) => {
    try {
        const site = await Site.findOne();
        return res.render("admin/settings", { req, res, site: site || {}, layout: "layout3" });
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.post("/settings/addresses", ensureAdmin, async (req, res) => {
    try {
        const {
            bitcoinAddress,
            bchAddress,
            ethereumAddress,
            usdtAddress,
            whatsappNumber
        } = req.body;
        const siteExists = await Site.findOne({});
        if (siteExists) {
            await Site.updateOne({ _id: siteExists._id }, {
                bitcoinAddress: bitcoinAddress ? bitcoinAddress : siteExists.bitcoinAddress,
                bchAddress: bchAddress ? bchAddress : siteExists.bchAddress,
                ethereumAddress: ethereumAddress ? ethereumAddress : siteExists.ethereumAddress,
                usdtAddress: usdtAddress ? usdtAddress : siteExists.usdtAddress,
                whatsappNumber: whatsappNumber ? whatsappNumber : siteExists.whatsappNumber,
            })
        } else {
            const newSite = new Site({
                bitcoinAddress,
                ethereumAddress,
                usdtAddress,
                whatsappNumber
            });
            await newSite.save();
        }

        req.flash("Addresses updated successfully");
        return res.redirect("/admin/settings");

    } catch (err) {
        return res.redirect("/admin")
    }
});


router.post("/settings", ensureAdmin, async (req, res) => {
    try {
        const { password, password2 } = req.body;
        if (!password || !password2) {
            req.flash("error_msg", "Enter new password");
            return res.redirect("/admin/settings");
        }
        if (password.length < 8) {
            req.flash("error_msg", "Password should be at least 8 characters long");
            return res.redirect("/admin/settings")
        }

        if (password !== password2) {
            req.flash("error_msg", "Passwords do not match");
            return res.redirect("/admin/settings");
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        await User.updateOne({ email: req.user.email }, { password: hash })
        req.flash("success_msg", "Password updated successfully");
        return res.redirect("/admin/settings");
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.get("/approve-deposit/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        const dep = await Deposit.findOne({ reference });
        const user = await User.findById(dep.userID);
        await Deposit.updateOne({ reference }, { status: "approved" });
        await History.updateOne({ reference }, { status: "approved" });
        await User.updateOne({ _id: dep.userID }, {
            balance: Number(user.balance) + Number(dep.amount),
            invested: Number(user.invested) + Number(dep.amount)
        });
        req.flash("success_msg", "Deposit Approved");
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.get("/reject-deposit/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        await Deposit.updateOne({ reference }, { status: "rejected" })
        await History.updateOne({ reference }, { status: "rejected" })
        req.flash("success_msg", "Deposit Rejected");
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.get("/approve-withdrawal/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        await Withdraw.updateOne({ reference }, { status: "approved" })
        await History.updateOne({ reference }, { status: "approved" })
        req.flash("success_msg", "Withdrawal Approved");
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});


router.get("/reject-withdrawal/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        const withd = await Withdraw.findOne({ reference });
        const user = await User.findById(withd.userID);
        await Withdraw.updateOne({ reference }, { status: "rejected" });
        await History.updateOne({ reference }, { status: "rejected" });
        await User.updateOne({ _id: withd.userID }, {
            balance: Number(user.balance) + Number(withd.amount)
        });
        req.flash("success_msg", "Withdrawal Rejected");
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});


router.get("/delete-account/:clientID", ensureAdmin, async (req, res) => {
    try {
        const { clientID } = req.params;
        await User.deleteOne({ _id: clientID });
        req.flash("success_msg", "Account Deleted Succesfully");
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.get("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const userID = req.params.id;
        const client = await User.findById(userID);
        return res.render("admin/editUser", { req, res, client, layout: "layout3" });
    } catch (err) {
        return res.redirect("/admin")
    }
});


router.post("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            balance,
            invested,
            upgrade,
            disabled,
            accountLevel,
            cot,
            phone,
            currency,
            withdrawalPin
        } = req.body;

        const userID = req.params.id;

        await User.updateOne({ _id: userID }, {
            firstname,
            lastname,
            email,
            balance,
            invested,
            disabled,
            accountLevel,
            upgrade,
            cot,
            phone,
            currency,
            withdrawalPin
        })

        req.flash("success_msg", "Client Account updated successfully");

        return res.redirect("/admin/edit-user/" + userID)
    } catch (err) {
        return res.redirect("/admin")
    }
});


module.exports = router;