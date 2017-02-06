/**
 * Wrapper class around RLS-scoped ReactServerAgent serializers to avoid
 * a circular dependency between ReactServerAgent and ReactServerAgent/Request.
 */

import JSONSerializer from './JSONSerializer';

const RLS = require('../util/RequestLocalStorage').getNamespace();

// Simple wrapper around an object that implements the
// API we want for adding/getting serializers
class SerializersHolder {
	constructor () {
		this.serializers = {};
		this.add(JSONSerializer);
	}

	get (type) {
		return this.serializers.hasOwnProperty(type) ? this.serializers[type] : null;
	}

	getTypes () {
		return Object.keys(this.serializers);
	}

	add (serializer) {
		const types = Array.isArray(serializer.contentTypes) ? serializer.contentTypes : [serializer.contentTypes];
		types.forEach((type) => {
			this.serializers[type] = serializer;
		})
	}
}

function getSerializers (pluginType) {
	return (RLS()[pluginType] || (RLS()[pluginType] = new SerializersHolder()));
}


module.exports = {
	allSerializers: getSerializers.bind(null, "serializers"),
};
