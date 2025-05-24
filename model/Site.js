const { model, Schema } = require("mongoose");

const SiteSchema = new Schema({
    bitcoinAddress: {
        type: String,
        required: false
    },
    bchAddress: {
        type: String,
        required: false
    },
    ethereumAddress: {
        type: String,
        required: false
    },
    usdtAddress: {
        type: String,
        required: false
    },
    upiId: {
        type: String,
        required: false
    },
    bankName: {
        type: String,
        required: false
    },
    bankAccountNumber: {
        type: String,
        required: false
    },
    bankAccountName: {
        type: String,
        required: false
    },
    bankIban: {
        type: String,
        required: false
    },
    whatsappNumber: {
        type: String,
        required: false
    }
});

module.exports = Site = model("Site", SiteSchema);