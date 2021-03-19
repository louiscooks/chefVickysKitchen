const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const comboSchema = new Schema({
	name: String,
	products: [
		{
			type: Schema.Types.ObjectId,
			ref: "Product"
		}
	],
	price: { type: Number, min: 0 }
});

const Combo = mongoose.model("Combo", comboSchema);

module.exports = Combo;
