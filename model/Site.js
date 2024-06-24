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
    whatsappNumber: {
        type: String,
        required: false
    }
});

module.exports = Site = model("Site", SiteSchema);