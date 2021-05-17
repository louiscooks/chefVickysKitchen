const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
	items: [
		new Schema(
			{
				product: { type: Schema.Types.ObjectId, ref: "Product" },
				qty: { type: Number, min: 1 },
				specialInstructions: String,
				diet: String
			},
			{ _id: true }
		)
	],
	contact: {
		user: { type: Schema.Types.ObjectId, ref: "User" },
		firstname: String,
		lastname: String,
		email: String,
		phoneNumber: String,
		preferredContact: [String]
	},
	totalPrice: { type: Number, min: 0, default: 0 },
	deliveryDate: { type: Date },
	location: {
		street: String,
		unit: String,
		city: String,
		state: String,
		zipcode: String
	},
	geometry: {
		type: {
			type: String,
			enum: ["Point"]
		},
		coordinates: {
			type: [Number]
		}
	}
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
