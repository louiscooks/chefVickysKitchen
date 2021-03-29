const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
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
