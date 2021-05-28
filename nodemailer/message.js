class Message {
	constructor(to, subject, html) {
		(this.from = "info@chefvickyskitchen.com"),
			(this.to = to),
			(this.subject = subject),
			(this.html = html + "<p>Thank you,<br>Chef Vickys Kitchen</p>");
	}
}

module.exports = Message;
