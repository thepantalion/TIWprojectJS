/**
 * AJAX call management
 */

	function makeCall(method, url, formElement, callBackFunction, reset = true) {
		const request = new XMLHttpRequest(); // visible by closure

		request.onreadystatechange = function() {
			callBackFunction(request)
		}; // closure

		request.open(method, url);

		if (formElement == null) {
			request.send();
		} else {
			request.send(new FormData(formElement));
		}

		if (formElement !== null && reset === true) {
			formElement.reset();
		}
	}

	/*
	function displayerrormodal(message) {
		document.getElementById("id_alerttext").textContent = message;
		document.getElementById("id_alert").style.display = 'block';
		document.getElementById("close_alert").addEventListener("click", () => {
			 var modal2 = document.getElementById("id_alert");
			 modal2.style.display = "none";
		})
	}
	
	function doredirect(req) {
		window.location.href = req.getResponseHeader("Location");
		window.sessionStorage.clear();
	}
	*/
