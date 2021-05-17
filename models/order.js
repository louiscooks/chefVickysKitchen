const mongoose = require("mongoose");
const User = require("./user");
const { Schema } = mongoose;

const orderSchema = new Schema({
	items: [
		new Schema(
			{
				combo: { type: Schema.Types.ObjectId, ref: "Combo" },
				product: { type: Schema.Types.ObjectId, ref: "Product" },
				qty: Number,
				specialInstructions: String,
				diet: String
			},
			{ _id: true }
		)
	],
	location: {
		street: String,
		unit: String,
		city: String,
		state: String,
		zipcode: String
	},
	createdAt: { type: Date, default: Date.now },
	deliveryDate: { type: Date },
	totalPrice: { type: Number, min: 0, default: 0 },
	contact: {
		user: { type: Schema.Types.ObjectId, ref: "User" },
		firstname: String,
		lastname: String,
		email: String,
		phoneNumber: String,
		preferredContact: [String]
	},
	status: {
		type: String,
		enum: ["pending", "approved", "completed", "denied"]
	},
	geometry: {
		type: {
			type: String, // Don't do `{ location: { type: String } }`
			enum: ["Point"], // 'location.type' must be 'Point'
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	}
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
