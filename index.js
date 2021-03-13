const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const session = require("express-session");

const ExpressError = require("./utilities/ExpressError");
const mongoose = require("mongoose");

const User = require("./models/user");

const orderRoutes = require("./routes/order");
const adminProductRoutes = require("./routes/adminProduct");
const userRoutes = require("./routes/user");

mongoose.connect("mongodb://localhost:27017/chefvicky", {
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
//categories filter

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionConfig = {
	secret: "thisisnotagoodsecret",
	resave: false,
	saveUninitialized: true
};
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
	next();
});
//home page
app.get("/", (req, res) => {
	res.render("home");
});

// view all menus send post req to cart
app.use("/order", orderRoutes);
//review routes
app.use("/admin", adminProductRoutes);
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

app.listen(3000, () => {
	console.log("listening on port 3000!");
});
