const mongoose = require("mongoose");
const Product = require("../models/product");

mongoose.connect("mongodb://localhost:27017/chefvicky", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const seedDB = async () => {
	await Product.deleteMany({});
	const i = Product.insertMany([
		{
			name: "Chicken Parmasean",
			price: 15.0,
			category: "other meats",
			image: "https://source.unsplash.com/collection/345760/1600x900",
			qty: 0,
			ingredients:
				"Chicken breast, alfredo sauce, parmesean cheese, ragatoni pasta."
		},
		{
			name: "Lobster Bisque",
			price: 10.5,
			category: "seafood",
			image: "https://source.unsplash.com/collection/345760/1600x900",
			qty: 0,
			ingredients:
				"Lobster chunks, heavy cream, tomato sauce, topped with parsley, salt and pepper."
		},
		{
			name: "Califlower Rice and Impossible Meatballs",
			price: 17.2,
			category: "vegan",
			image: "https://source.unsplash.com/collection/345760/1600x900",
			qty: 0,
			ingredients:
				"chopped and fried cali flower, green onions, with impossible meat in the shape of meatballs."
		},
		{
			name: "BBQ Habanero Wings",
			price: 8.0,
			category: "other meats",
			image: "https://source.unsplash.com/collection/345760/1600x900",
			qty: 0,
			ingredients:
				"Crispy fried chicken wings, tossed in BBQ sauce with a side of seasoned fries and blue cheese."
		}
	]).then((res) => {
		console.log(res);
	});
	await i.save();
};
seedDB().then(() => {
	mongoose.connection.close();
});
