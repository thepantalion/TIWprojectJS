
function makeCall(method, url, dataToSend, callBackFunction, isJSON) {
	const request = new XMLHttpRequest(); // visible by closure

	request.onreadystatechange = function() {
		callBackFunction(request)
	};

	request.open(method, url);

	if(isJSON === true) {
		request.send(dataToSend);
	} else {
		if (dataToSend == null) {
			request.send();
		} else {
			request.send(new FormData(dataToSend));
		}
	}
}
