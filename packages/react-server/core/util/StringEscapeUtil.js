
// see comment on escapeForScriptTag about how these are used
const UNSAFE_CHARS = /[<>\/]/g;
const REPLACEMENT_CHARS = {
	'<' : '\\u003C',
	'>' : '\\u003E',
	'/' : '\\u002F',
};

/**
 * Escapes a string in a manner suitable for including in a <script> tag.
 * (It replaces '<', '>', '/' with their unicode equivalents, effectively
 * hiding any erroneous "</script>" tags written out in JS strings from
 * the HTML parser.
 *
 * Idea borrowed from Yahoo's express-state, but our use case is simpler:
 * https://github.com/yahoo/express-state
 */
export function escapeForScriptTag (str) {
	if (!str) {
		return str;
	}

	return str.replace(UNSAFE_CHARS, function (match) {
		return REPLACEMENT_CHARS[match];
	});
}
