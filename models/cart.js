const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
	items: [
		new Schema(
			{
				combo: { type: Schema.Types.ObjectId, ref: "Combo" },
				product: { type: Schema.Types.ObjectId, ref: "Product" },
				qty: Number,
				specialInstructions: String
			},
			{ _id: true }
		)
	],
	totalQty: { type: Number, max: 5, default: 0 },
	createdAt: { type: Date, default: Date.now },
	deliverDate: { type: Date },
	totalPrice: { type: Number, min: 0, default: 0 }
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
