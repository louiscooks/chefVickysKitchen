const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	shoppingCart: {
		type: Schema.Types.ObjectId,
		ref: "cart"
	},
	isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
