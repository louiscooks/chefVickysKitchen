const { number } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
	firstname: String,
	lastname: String,
	phoneNumber: Number,
	location: {
		street: String,
		unit: String,
		city: String,
		state: String,
		zipcode: String
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	isAdmin: { type: Boolean, default: false },
	orders: [{ type: Schema.Types.ObjectId, ref: "Order" }]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
