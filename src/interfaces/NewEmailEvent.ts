import EmailEvent from "./EmailEvent";

export default interface NewEmailEvent extends EmailEvent {
	path: string,
	specialUse: string,
	data: {
		id: string,
		uid: number,
		path: string,
		emailId: string,
		threadId: string,
		date: string,
		flags: string[],
		labels: string[],
		unseen: boolean,
		size: number,
		subject: string,
		from: {
			name: string,
			address: string,
		},
		replyTo: {
			name: string,
			address: string,
		},
		sender: {
			name: string,
			address: string,
		},
		to: {
			name: string,
			address: string,
		}[],
		messageId: string,
		text: {
			id: string,
			encodedSize: {
				plain: number,
				html: number,
			},
			plain?: string,
			html?: string,
			hasMore: boolean,
			_generatedHtml: string,
			webSafe: boolean,
		},
		seemsLikeNew: boolean,
		messageSpecialUse: string,
	},
	_route: {
		id: string,
	}
}