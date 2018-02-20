// the common object model of react-server on server and client -sra.

import RootContainer from "./components/RootContainer";
import RootElement from "./components/RootElement";
import Link from "./components/Link";
import TheFold from "./components/TheFold";
import History from "./components/History";
import navigateTo from "./util/navigateTo";
import ClientRequest from "./ClientRequest";
import RequestLocalStorage from './util/RequestLocalStorage';
import * as bundleNameUtil from "./util/bundleNameUtil";
import PageUtil from "./util/PageUtil";
import ReactServerAgent from './ReactServerAgent';
import RequestContext from './context/RequestContext';
import FragmentDataCache from './components/FragmentDataCache';
import * as logging from "./logging";
import config from "./config";

const moduleExports = {
	RootContainer,
	RootElement,
	Link,
	TheFold,
	History,
	navigateTo,
	ClientRequest,
	RequestLocalStorage,
	bundleNameUtil,
	PageUtil,
	ReactServerAgent,
	logging,
	config,
	getCurrentRequestContext: RequestContext.getCurrentRequestContext(),
	components: {
		FragmentDataCache: FragmentDataCache,
	},
};
export default moduleExports;


/*
module.exports = {
	RootContainer: require("./components/RootContainer"),
	RootElement: require("./components/RootElement"),
	Link: require('./components/Link'),
	TheFold: require('./components/TheFold').default,
	History: require('./components/History'),
	navigateTo: require('./util/navigateTo'),
	ClientRequest: require('./ClientRequest'),
	components: {
		FragmentDataCache: require('./components/FragmentDataCache'),
	},
	RequestLocalStorage: require('./util/RequestLocalStorage'),
	getCurrentRequestContext: require('./context/RequestContext').getCurrentRequestContext,
	bundleNameUtil: require("./util/bundleNameUtil"),
	PageUtil: require("./util/PageUtil"),
	logging: require("./logging"),
	config: require("./config"),
	ReactServerAgent: require('./ReactServerAgent'),
}
*/
