
export const JS_BUNDLE_SUFFIX = ".bundle.js";
export const CSS_ROLLUP_SUFFIX = ".styles.css";

export function getEntryPointNameFromRouteName (routeName) {
	return routeName + "Page";
}

export function getJsBundleFromRouteName (routeName) {
	return getEntryPointNameFromRouteName(routeName) + JS_BUNDLE_SUFFIX;
}

export function getCssRollupNameFromRouteName(routeName) {
	return getEntryPointNameFromRouteName(routeName) + CSS_ROLLUP_SUFFIX;
}
