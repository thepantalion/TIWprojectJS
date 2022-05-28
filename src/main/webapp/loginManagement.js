/**
 * Login management
 */

(function() { // avoid variables ending up in the global scope

  document.getElementById("signInButton").addEventListener('click', (event) => {
    const form = event.target.closest("form");
    if (form.checkValidity()) {
      makeCall("POST", 'SignIn', event.target.closest("form"),
          function(x) {
            if (x.readyState === XMLHttpRequest.DONE) {
              const message = x.responseText;
              switch (x.status) {
                case 200:
                  sessionStorage.setItem('username', message);
                  window.location.href = "home.html";
                  break;
                case 400: // bad request
                  document.getElementById("signInErrorMessage").textContent = message;
                  break;
                case 401: // unauthorized
                  document.getElementById("signInErrorMessage").textContent = message;
                  break;
                case 500: // server error
                  document.getElementById("signInErrorMessage").textContent = message;
                  break;
              }
            }
          }
      );
    } else {
      form.reportValidity();
    }
  });

  document.getElementById("signUpButton").addEventListener('click', (event) => {
    const form = event.target.closest("form");
    if (form.checkValidity()) {
      makeCall("POST", 'SignUp', event.target.closest("form"), function(x) {
            if (x.readyState === XMLHttpRequest.DONE) {
              const message = x.responseText;
              switch (x.status) {
                case 200:
                  document.getElementById("signUpErrorMessage").textContent = message;
                  break;
                case 400: // bad request
                  document.getElementById("signUpErrorMessage").textContent = message;
                  break;
                case 401: // unauthorized
                  document.getElementById("signUpErrorMessage").textContent = message;
                  break;
                case 500: // server error
                  document.getElementById("signUpErrorMessage").textContent = message;
                  break;
              }
            }
          });
    } else {
      form.reportValidity();
    }
  });

})();