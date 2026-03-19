const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const p = require('passport-local-mongoose');
const passportLocalMongoose = typeof p === 'function' ? p : p.default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Listing'
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
