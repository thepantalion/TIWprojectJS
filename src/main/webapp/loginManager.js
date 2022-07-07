/**
 * Login management
 */

(function() { // avoid variables ending up in the global scope

  window.addEventListener("keydown", function(event) {
    if(event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  document.getElementById("signInButton").addEventListener('click', (event) => {
    const form = event.target.closest("form");
    const formData = new FormData(form);

    if (form.checkValidity()) {
      makeCall("POST", 'SignIn', event.target.closest("form"), function (x) {
        if (x.readyState === XMLHttpRequest.DONE) {
          const message = x.responseText;

          switch (x.status) {
            case 200:
              sessionStorage.setItem('username', message);
              window.location.href = "home.html";
              break;
            case 400: // bad request
              alert(message);
              break;
            case 401: // unauthorized
              alert(message);
              break;
            case 500: // server error
              alert(message);
              break;
          }
        }
      });
    } else {
      form.reportValidity();
    }
  });

  document.getElementById("signUpButton").addEventListener('click', (event) => {
    const form = event.target.closest("form");
    const formData = new FormData(form);

    if (form.checkValidity()) {
      if(formData.get("password") === formData.get("repeatPassword")){
        if(validateEmail(formData.get("email"))){
          makeCall("POST", 'SignUp', event.target.closest("form"), function (x) {
            if (x.readyState === XMLHttpRequest.DONE) {
              const message = x.responseText;
              switch (x.status) {
                case 200:
                  document.getElementById("signUpErrorMessage").textContent = message;
                  break;
                case 400: // bad request
                  alert(message);
                  break;
                case 401: // unauthorized
                  alert(message);
                  break;
                case 500: // server error
                  alert(message);
                  break;
              }
            }
          });
        }
        else alert("The email address is not valid");
      }
      else alert("The two passwords do not match.");
    } else form.reportValidity();
  });

})();

function validateEmail(email) {
  const regex = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
  return regex.match(email);
}