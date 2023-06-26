const mongoose = require('mongoose');
const Joi = require('joi');

const WalletHistorySchema = new mongoose.Schema({
    mem_id : {type: String, required: true},
    name : {type: String, required: true},
    type : {type : String, required :true},
    amount : {type: Number, required: true},
    detail : {type: String, required: false, default: '-'},
    timestamp : {type: Date, required: false, default: new Date()}
}, {timestamps: true});

const WalletHistory = mongoose.model('wallet_history', WalletHistorySchema);

module.exports = {WalletHistory}