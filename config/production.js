module.exports = {
	httpd: {
		port: process.env.PORT || 8050,
	},
	emailengine: {
		templateId: process.env.EMAILENGINE_TEMPLATE,
		accountId: process.env.EMAILENGINE_ACCOUNTID,
		api: process.env.EMAILENGINE_API,
		key: process.env.EMAILENGINE_KEY,
	},
	hastebin: {
		server: process.env.HASTEBIN_SERVER,
	}
};