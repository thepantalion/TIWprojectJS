let modal = document.getElementById("modal");

(function() {
    let modalButton = document.getElementById("modal-btn");
    let closeButton = document.querySelector(".close-btn");
    let formContainer = document.getElementById("idNewMeetingForm");
    let counter = 0;
    let userList;

    function clearModal() {
        controller.reset();
        userList.clear();
        counter = 0;
        modal.style.display = "none"
    }
    modalButton.addEventListener("click", () => {
        formContainer.querySelector("input[name='title']").value = "test";
        formContainer.querySelector("input[name='date']").value = "2023-12-10";
        formContainer.querySelector("input[name='time']").value = "12:20";
        formContainer.querySelector("input[name='duration']").value = 30;
        formContainer.querySelector("input[name='numberOfParticipants']").value = 5;

        modal.style.display = "block"
    });
    closeButton.addEventListener("click", () => {
        clearModal();
    });
    window.addEventListener("click", (e) => {
        if(e.target === modal) {
            clearModal();
        }
    });

    function UserList() {
        this.userList = document.getElementById("modalUserlist");
        this.message = document.getElementById("modalMessage");
        this.numberOfParticipants = formContainer.querySelector("input[name='numberOfParticipants']").value
        this.notSent = true;

        this.show = function() {
            const self = this;

            function getUsersResponseManager(request) {
                if (request.readyState === 4) {
                    const payload = request.responseText;

                    switch (request.status) {
                        case 200:
                            const userList = JSON.parse(payload);

                            if (userList.length === 0) {
                                self.message.textContent = "There are no other users registered yet...";
                                return;
                            }

                            self.update(userList);
                            document.querySelector('input[name="inviteButton"]').addEventListener("click", () => {
                                if(self.notSent) {
                                    let selectedUsersCounter = 0;
                                    let formData = new FormData(document.getElementById("modalUserlist").parentNode.parentNode);
                                    let checkboxes = document.querySelectorAll('input[name="checkbox"]:checked');
                                    checkboxes.forEach(() => selectedUsersCounter++);

                                    formData.set("title", formContainer.querySelector("input[name='title']").value);
                                    formData.set("date", formContainer.querySelector("input[name='date']").value);
                                    formData.set("time", formContainer.querySelector("input[name='time']").value);
                                    formData.set("duration", formContainer.querySelector("input[name='duration']").value);
                                    formData.set("numberOfParticipants", formContainer.querySelector("input[name='numberOfParticipants']").value);

                                    if (selectedUsersCounter > self.numberOfParticipants - 1 || selectedUsersCounter <= 0) {
                                        counter++;
                                    }

                                    function createMeetingResponseManager(request) {
                                        if (request.readyState === 4) {
                                            const payload = request.responseText;

                                            switch (request.status) {
                                                case 200:
                                                    clearModal();
                                                    break;

                                                case 400:
                                                    if (payload === "past") {
                                                        alert("The server refused to process the provided data.");
                                                        clearModal();
                                                    } else if (counter >= 3 || payload === "terminate") {
                                                        alert("You reached the maximum number of available attempts. Please try again.");
                                                        clearModal();
                                                    } else {
                                                        self.notSent = true;
                                                        self.message.textContent = "Please deselect at least " + (selectedUsersCounter - self.numberOfParticipants + 1) + " users to proceed. (available attempts: " + (3 - counter) + ")";
                                                    }
                                                    break;

                                                case 403:
                                                    window.location.href = request.getResponseHeader("Location");
                                                    window.sessionStorage.removeItem('username');
                                                    break;

                                                default:
                                                    self.notSent = true;
                                                    self.message.textContent = "An error was encountered while processing your request..."
                                            }
                                        }
                                    }

                                    makeCall("POST", 'CreateMeeting', formData, function (request) {createMeetingResponseManager(request)}, true);
                                    self.notSent = false;
                                }
                            });
                            break;

                        case 403:
                            window.location.href = request.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                            break;

                        default:
                            self.message.textContent = "An error was encountered while retrieving the data..."
                    }
                }
            }

            makeCall("GET", 'GetUsers', null, function(request) {getUsersResponseManager(request)}, false);
        }
        this.update = function(userList) {
            const self = this;
            let checkbox, label;

            let checkboxes = document.querySelectorAll('input[name="checkbox"]');
            let isNotPresent = true;
            userList.forEach(function(username) {
                checkboxes.forEach(function(checkbox) {
                    if(username === checkbox.value) isNotPresent = false;
                })

                if(isNotPresent === true) {
                    checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = "checkbox";
                    checkbox.value = username;

                    label = document.createElement("label");
                    label.textContent = username;
                    label.append(checkbox);
                    label.append(document.createElement("br"));

                    self.userList.append(label);

                    isNotPresent = true;
                }
            });

            self.message.textContent = "Please select max " + (this.numberOfParticipants - 1) + " participants.";
            self.userList.style.visibility = "visible";
        }
        this.clear = function() {
            this.userList.replaceChildren();
        }
    }

    const config = { attributeFilter: [ "style" ] };
    function callback() {
         if(modal.style.display === 'block'){
             document.getElementById("meetingTitle").textContent = formContainer.querySelector("input[name='title']").value;
             document.getElementById("date").textContent = "Date: " + formContainer.querySelector("input[name='date']").value;
             document.getElementById("time").textContent = "Time: " + formContainer.querySelector("input[name='time']").value;
             document.getElementById("duration").textContent = "Duration: " + formContainer.querySelector("input[name='duration']").value + "min";
             document.getElementById("numberOfParticipants").textContent = "Maximum number of participants: " + formContainer.querySelector("input[name='numberOfParticipants']").value;

             userList = new UserList();
             userList.show();
         }
    }

    let observer = new MutationObserver(callback);
    observer.observe(modal, config);
})();