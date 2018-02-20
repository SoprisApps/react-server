import React from 'react';
import PropTypes from 'prop-types';

import RootElement from './RootElement';

export default class RootContainer extends React.Component {
	static get propTypes() {
		return {
			listen: PropTypes.func,
			when: PropTypes.object, // A promise.
			_isRootContainer: PropTypes.bool,
		}
	}

	static get defaultProps() {
		return {
			_isRootContainer: true,
		}
	}

	static flattenForRender(element) {
		return [{containerOpen: RootElement.getRootElementAttributes(element)}]
			.concat(RootContainer.prepChildren(element))
			.concat([{containerClose: true}])
			.reduce((m,v) => m.concat(Array.isArray(v)?v:[v]), [])
	}

	static prepChildren (element) {
		return React.Children.toArray(element.props.children).map(
			child => RootContainer.isRootContainer(child)
				?RootContainer.flattenForRender(child)
				:RootElement.ensureRootElementWithContainer(child, element)
		)
	}

	static isRootContainer(element) {
		return element && element.props && element.props._isRootContainer;
	}

	render() {
		throw new Error("RootContainers can't go in non-RootContainers!");
	}
}
