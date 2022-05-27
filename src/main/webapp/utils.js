/**
 * AJAX call management
 */

	function makeCall(method, url, formElement, cback, reset = true) {
		const req = new XMLHttpRequest(); // visible by closure

		req.onreadystatechange = function() {
			cback(req)
		}; // closure

		req.open(method, url);

		if (formElement == null) {
			req.send();
		} else {
			req.send(new FormData(formElement));
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
