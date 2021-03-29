const { number } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const Cart = require("./cart");

const userSchema = new Schema({
	firstname: String,
	lastname: String,
	phoneNumber: Number,
	email: {
		type: String,
		required: true,
		unique: true
	},
	shoppingCart: {
		type: Schema.Types.ObjectId,
		ref: "cart"
	},
	isAdmin: { type: Boolean, default: false },
	orders: { type: Schema.Types.ObjectId, ref: "Order" }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
