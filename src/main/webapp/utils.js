
function makeCall(method, url, dataToSend, callBackFunction, isFormData) {
	const request = new XMLHttpRequest(); // visible by closure

	request.onreadystatechange = function() {
		callBackFunction(request)
	};

	request.open(method, url);

	if(isFormData === true) {
		request.send(dataToSend);
	} else {
		if (dataToSend == null) {
			request.send();
		} else {
			request.send(new FormData(dataToSend));
		}
	}
}
