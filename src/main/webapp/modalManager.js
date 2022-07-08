(function() {
    let modalButton = document.getElementById("modal-btn");
    let modal = document.getElementById("modal");
    let closeButton = document.querySelector(".close-btn");
    let formContainer = document.getElementById("idNewMeetingForm");
    let counter = 0;
    let userList;

    function clearModal() {
        controller.reset();
        userList.clear();
        modal.style.display = "none"
    }
    modalButton.addEventListener("click", () => modal.style.display = "block");
    closeButton.addEventListener("click", () => {
        clearModal();
    })
    window.addEventListener("click", (e) => {
        if(e.target === modal) {
            clearModal();
        }
    });

    function UserList() {
        this.userList = document.getElementById("modalUserlist");
        this.message = document.getElementById("modalMessage");
        this.numberOfParticipants = formContainer.querySelector("input[name='numberOfParticipants']").value

        this.show = function() {
            const self = this;

            function callBackFunction(request) {
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
            makeCall("GET", 'GetUsers', null, function(request) {callBackFunction(request)});
        }
        this.update = function(userList) {
            const self = this;
            let checkbox, label, button;

            userList.forEach(function(username) {
                checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "checkbox";
                checkbox.value = username;

                label = document.createElement("label");
                label.textContent = username;
                label.append(checkbox);
                label.append(document.createElement("br"));

                self.userList.append(label);
            });

            self.userList.append(document.createElement("br"));

            button = document.createElement("input");
            button.type = "button";
            button.name = "inviteButton";
            button.value = "invite";
            button.addEventListener("click", () => {
                let selectedUsersCounter
                let checkboxes = document.querySelectorAll('input[name="checkbox"]:checked');
                checkboxes.forEach(() => selectedUsersCounter++);
                alert(selectedUsersCounter);

                if(selectedUsersCounter > this.numberOfParticipants - 1 || selectedUsersCounter <= 0) {
                    counter++;
                    makeCall("POST", 'CreateMeeting', null, function(request) {callBackFunction(request)});
                }

                counter = 0;
            });
            self.userList.append(button);

            //<input type="checkbox" th:name="selectedUsers" th:value="${user.key}" th:checked="${userMap.get(user.key).get_2()}"/>
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