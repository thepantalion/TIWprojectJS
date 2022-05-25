/**
 * Login management
 */

(function() { // avoid variables ending up in the global scope

  document.getElementById("signInButton").addEventListener('click', (e) => {
    var form = e.target.closest("form");
    if (form.checkValidity()) {
      makeCall("POST", 'SignIn', e.target.closest("form"),
        function(x) {
          if (x.readyState == XMLHttpRequest.DONE) {
            var message = x.responseText;
            switch (x.status) {
              case 200:
            	sessionStorage.setItem('username', message);
                window.location.href = "home.html";
                break;
              default: // error message
                document.getElementById("signInErrorMessage").textContent = message;
            }
          }
        }
      );
    } else {
    	 form.reportValidity();
    }
  });

  document.getElementById("signUpButton").addEventListener('click', (e) => {
    var form = e.target.closest("form");
    if (form.checkValidity()) {
      makeCall("POST", 'SignUp', e.target.closest("form"),
          function(x) {
            if (x.readyState == XMLHttpRequest.DONE) {
              var message = x.responseText;
              document.getElementById("signUpErrorMessage").textContent = message;
            }
          }
      );
    } else {
      form.reportValidity();
    }
  });

})();