/**
 * client.js contains the bootstrap code for the
 * client-side.
 */

import * as commonImports from "./common";
import ClientController from "./ClientController";

const clientExports = commonImports;
clientExports.ClientController = ClientController;

export default clientExports;
