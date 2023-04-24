import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';
import config from 'config';
import axios from 'axios';
import EmailEvent from './interfaces/EmailEvent';
import NewEmailEvent from './interfaces/NewEmailEvent';
import HasteResponse from './interfaces/HasteResponse';

class EmailPaste {
	public HTTPD: Hapi.Server;

	constructor() {
		this.HTTPD = new Hapi.Server({
			port: config.get('httpd.port'),
		});
	}

	async createPaste(content: string) {
		const req = await axios.post(`${config.get('hastebin.server')}/documents`, content);
		if (req.status !== 200) {
			throw new Error("Error creating paste!");
		}
		const res = req.data as HasteResponse;
		return res.key;
	}

	async sendEmail(to: string, template: string, params: { [key: string]: string }, replyId?: string,) {
		const payload: any = {
			to: [
				{ address: to },
			],
			template,
			trackingEnabled: true,
			render: {
				params
			}
		};

		if (replyId) {
			payload.reference = {
				message: replyId,
			};
		}
		const req = await axios.post(`${config.get('emailengine.api')}/v1/account/${config.get('emailengine.accountId')}/submit`, payload, {
			headers: {
				Authorization: `Bearer ${config.get('emailengine.key')}`
			}
		});
		if (req.status !== 200) {
			throw new Error("Error sending email! " + req.data);
		}
		console.log(req.data);
	}

	async start() {
		this.HTTPD.route({
			path: "/v1/webhook/messageNew",
			method: "POST",
			handler: async (req, h) => {
				try {
					const body = req.payload as EmailEvent;

					if (typeof req.payload !== "object") {
						return Boom.badRequest("Invalid Content");
					}

					if (body.event !== "messageNew") {
						return Boom.badRequest("Invalid Event");
					}

					const newEmail = body as NewEmailEvent;

					if (newEmail.data.subject.match(/undelivered/gi) || newEmail.data.subject.match(/undeliverable/gi)) {
						console.log("Skipping system email from " + newEmail.data.from.address)
						return Boom.badRequest("System Email - Skipping");
					}

					if (!newEmail.data.subject.match(/paste/gi)) {
						return Boom.badRequest("Invalid Email - Must have 'paste' in the subject.");
					}

					let hasteId: string | undefined = undefined;

					if (newEmail.data.text.plain) {
						hasteId = await this.createPaste(newEmail.data.text.plain);
					} else if (newEmail.data.text.html) {
						hasteId = await this.createPaste(newEmail.data.text.html);
					} else {
						return Boom.badRequest("Missing email contents!");
					}

					const rawHaste = await this.createPaste(JSON.stringify(newEmail, null, '\t'));

					await this.sendEmail(newEmail.data.from.address, config.get('emailengine.templateId'), {
						haste_url: config.get('hastebin.server') + hasteId,
						haste_id: hasteId,
						raw_haste_id: rawHaste,
						raw_haste_url: config.get('hastebin.server') + rawHaste
					}, newEmail.data.emailId);

					return hasteId || "ERR";
				} catch (e) {
					console.log(e);
					return Boom.internal();
				}
			}
		});

		await this.HTTPD.start();
	}
}
const app = new EmailPaste();
app.start();