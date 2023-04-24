export default interface EmailEvent {
	serviceUrl: string,
	account: string,
	date: string,
	event: "messageNew"
}