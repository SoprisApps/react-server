export default class JSONSerializer {
	static contentTypes = ['application/json'];

	static serialize(obj) {
		console.log('serializing: ', obj);
		return JSON.stringify(obj);
	}

	static parse(text) {
		if (text && text.trim) {
			text = text.trim();
		}
		if (/^{}&&/.test(text)) {
			text = text.substr(4);
		}
		console.log('parsing: ', text);
		return JSON.parse(text);
	}
}
