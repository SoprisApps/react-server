import RequestLocalStorage from 'request-local-storage';

import clsQ from 'cls-q';

if (SERVER_SIDE) {
	RequestLocalStorage.patch(clsQ);
}

export default RequestLocalStorage;
