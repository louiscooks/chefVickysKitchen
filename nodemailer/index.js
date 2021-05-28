const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

const sendMail = (message) => {
	transport.sendMail(message, function (err, info) {
		if (err) {
			console.log(err);
		} else {
			console.log(info);
		}
	});
};
module.exports = sendMail;
