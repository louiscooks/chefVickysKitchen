const { number } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const Order = require("./order");

const userSchema = new Schema({
	firstname: String,
	lastname: String,
	phoneNumber: String,
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

userSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		console.log("this is doc", doc);
		// await Order.deleteMany({
		// 	_id: { $in: doc.orders }
		// });
	}
});

const User = mongoose.model("User", userSchema);
module.exports = User;
