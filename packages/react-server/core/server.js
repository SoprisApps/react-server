import * as commonImports from "./common.js";
import renderMiddleware from "./renderMiddleware";

const serverExports = commonImports;
serverExports.middleware = renderMiddleware;
export default serverExports;
