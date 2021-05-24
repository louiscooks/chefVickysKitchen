const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
	host: "smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "b9717cc454f1d4",
		pass: "2de527cdfade91"
	}
});
const message = {
	from: "abc123@gmail.com", // Sender address
	to: "4c317156a3-09c2fb@inbox.mailtrap.io", // List of recipients
	subject: "Your order ha", // Subject line
	html: "<h1>Your order have been submitted</h1><p>Your order id is 10292030378293 to view the status online our webpage <a href:'localhost:3000/cart/menu'>click here</a></p>" // Plain text body
};

transport.sendMail(message, function (err, info) {
	if (err) {
		console.log(err);
	} else {
		console.log(info);
	}
});
}
