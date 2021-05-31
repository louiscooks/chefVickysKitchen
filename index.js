if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const session = require("express-session");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const ExpressError = require("./utilities/ExpressError");
const mongoose = require("mongoose");

const User = require("./models/user");

const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
const resetCart = require("./middleware/resetCart");
const catchAsync = require("./utilities/catchAsync");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/chefvicky";
const MongoStore = require("connect-mongo");

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());
//categories filter

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(mongoSanitize());

const secret = process.env.SECRET || "thisisnotagoodsecret";

const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
	console.log("SESSION STORE ERROR", e);
});
const sessionConfig = {
	store,
	name: "sess",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};

const scriptSrcUrls = [
	"https://code.jquery.com",
	"https://stackpath.bootstrapcdn.com",
	// "https://api.tiles.mapbox.com",
	"https://api.mapbox.com",
	// "https://kit.fontawesome.com",
	// "https://cdnjs.cloudflare.com",
	"https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
	"https://cdn.jsdelivr.net",
	// "https://kit-free.fontawesome.com",
	"https://stackpath.bootstrapcdn.com",
	"https://api.mapbox.com"
	// "https://api.tiles.mapbox.com",
	// "https://fonts.googleapis.com",
	// "https://use.fontawesome.com"
];
const connectSrcUrls = [
	"https://api.mapbox.com",
	"https://*.tiles.mapbox.com",
	"https://events.mapbox.com"
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			childSrc: ["blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://images.unsplash.com",
				"https://source.unsplash.com/collection/345760/1600x900",
				"https://res.cloudinary.com"
			],
			fontSrc: ["'self'", ...fontSrcUrls]
		}
	})
);

app.use(session(sessionConfig));
app.use(flash());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
//strategy passport is using // specify authentication method added automatically by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
//how to store and unstore a user in the session //also specified and added automatically on user model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.currentUser = req.user;
	res.locals.userCart = req.session.cart;
	res.locals.startOrder = req.session.startOrder;
	res.locals.url = req.originalUrl;
	next();
});
//home page
app.get("/", catchAsync(resetCart), (req, res) => {
	res.render("home");
});

// view all menus send post req to cart
app.use("/cart", cartRoutes);
// view all menus send post req to cart
app.use("/order", orderRoutes);
//product routes
app.use("/product", productRoutes);
//user routes
app.use("/", userRoutes);

//error handling middleware
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Oh No, Something Went Wrong!";
	res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`listening on port ${port}!`);
});
