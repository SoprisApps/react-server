import React from "react"

export default class IsomorphicWebpack extends React.Component {
	constructor(props) {
		super(props);
		this.state = {exclamationCount: 0};
		this.increment = () => {
			this.setState({exclamationCount: this.state.exclamationCount + 1});
		}
	}

	render() {
		const env = process.env.NODE_ENV; // eslint-disable-line no-process-env
		const message = REACT_SERVER_CLIENT_SIDE; // eslint-disable-line no-undef
		console.log("REACT_SERVER_CLIENT_SIDE: ", message);
		if (MY_CUSTOM_CLIENT_VARIABLE !== undefined) { // eslint-disable-line no-undef
			console.log("MY_CUSTOM_CLIENT_VARIABLE: ", MY_CUSTOM_CLIENT_VARIABLE || null); // eslint-disable-line no-undef
		}

		const smileyFace = require("./smileyface.jpg");

		return (
			<div>
				<h2>Update 19: Hello, World{"!".repeat(this.state.exclamationCount)}</h2>
				<button onClick={this.increment}>Get More Excited!</button>
				<p>A message from Webpack:</p>
				<p>NODE_ENV: {JSON.stringify(env)}</p>
				<p>REACT_SERVER_CLIENT_SIDE: {JSON.stringify(message)}</p>
				<p>Do you like smiley faces?</p>
				<img src={smileyFace}/>
			</div>
		);
	}
}
