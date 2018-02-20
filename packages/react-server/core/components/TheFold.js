import React from 'react';

export default class TheFold extends React.Component {
	static get defaultProps() {
		return {
			_isTheFold: true,
		}
	}

	render() {
		throw new Error("Something went wrong.  Trying to render the fold...");
	}
}


export function isTheFold(element) {
	return element && element.props && element.props._isTheFold;
}

export function markTheFold() {
	return {isTheFold:true};
}
