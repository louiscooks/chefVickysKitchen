const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
	type: "string",
	base: joi.string(),
	messages: {
		"string.escapeHTML": "{{#label}} must not include HTML!"
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {}
				});
				if (clean !== value)
					return helpers.error("string.escapeHTML", { value });
				return clean;
			}
		}
	}
});

const Joi = BaseJoi.extend(extension);

module.exports.productSchema = Joi.object({
	product: Joi.object({
		name: Joi.string().required().escapeHTML(),
		// image: Joi.string().required().escapeHTML(),
		price: Joi.string().required().escapeHTML(),
		type: Joi.string()
			.valid("entree", "drink", "dessert")
			.allow(null, "")
			.escapeHTML(),
		combo: Joi.string()
			.valid(
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			)
			.required()
			.escapeHTML(),
		ingredients: Joi.string().required().escapeHTML()
	}).required()
});
module.exports.userSchema = Joi.object({
	user: Joi.object({
		firstname: Joi.string().required().escapeHTML(),
		lastname: Joi.string().required().escapeHTML(),
		username: Joi.string().required().escapeHTML(),
		password: Joi.string().required().escapeHTML(),
		phoneNumber: Joi.number().required(),
		email: Joi.string().email().required().escapeHTML()
	}).required(),
	location: Joi.object({
		street: Joi.string().required().escapeHTML(),
		unit: Joi.string().allow(null, "").escapeHTML(),
		city: Joi.string().required().escapeHTML(),
		state: Joi.string().required().escapeHTML(),
		zipcode: Joi.string().required().escapeHTML()
	}).required()
});
