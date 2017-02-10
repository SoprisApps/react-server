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

	static superagentParse(res, fn) {
		res.text = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk){ res.text += chunk;});
		res.on('end', function(){
			let body = undefined,
				err = undefined;

			try {
				body = res.text && JSONSerializer.parse(res.text);
			} catch (e) {
				err = e;
				// superagent issue #675: return the raw response if the response parsing fails
				err.rawResponse = res.text || null;
				// superagent issue #876: return the http status code if the response parsing fails
				err.statusCode = res.statusCode;
			} finally {
				fn(err, body);
			}
		});
	};
}
