const mongoose = require('mongoose');
const { Schema } = mongoose;

const tokenSchema = new Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiryDate: { type: Date, required: true }
});

const Token = mongoose.model('Token', tokenSchema);