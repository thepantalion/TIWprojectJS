let modalButton = document.getElementById("modal-btn");
let modal = document.getElementById("modal");
let closeBtn = document.querySelector(".close-btn");
let counter = 0;

modalButton.onclick = function(){
    modal.style.display = "block"
};

(function() {
    let userList;

    function UserList() {
        this.userList = document.getElementById("modalUserlist");
        this.message = document.getElementById("modalMessage");

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
            let checkbox, label;

            userList.forEach(function(username) {
                checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = username;
                checkbox.value = username;

                label = document.createElement("label");
                label.textContent = username;
                label.append(checkbox);
                label.append(document.createElement("br"));

                self.userList.append(label);
            });
            //<input type="checkbox" th:name="selectedUsers" th:value="${user.key}" th:checked="${userMap.get(user.key).get_2()}"/>
            let formContainer = document.getElementById("idNewMeetingForm");
            self.message.textContent = "Please select max " + (formContainer.querySelector("input[name='numberOfParticipants']").value - 1) + " participants.";
            self.userList.style.visibility = "visible";
        }
    }
    function setupHeader() {
        let formContainer = document.getElementById("idNewMeetingForm");

        document.getElementById("meetingTitle").textContent = formContainer.querySelector("input[name='title']").value;
        document.getElementById("date").textContent = "Date: " + formContainer.querySelector("input[name='date']").value;
        document.getElementById("time").textContent = "Time: " + formContainer.querySelector("input[name='time']").value;
        document.getElementById("duration").textContent = "Duration: " + formContainer.querySelector("input[name='duration']").value + "min";
        document.getElementById("numberOfParticipants").textContent = "Maximum number of participants: " + formContainer.querySelector("input[name='numberOfParticipants']").value;
    }

    const config = { attributeFilter: [ "style" ] };
    function callback() {
         if(modal.style.display === 'block'){
             setupHeader();

             userList = new UserList();
             userList.show();
         }
    }

    let observer = new MutationObserver(callback);
    observer.observe(modal, config);
})();

closeBtn.onclick = function(){
    controller.reset();
    modal.style.display = "none"
}

window.onclick = function(e){
    if(e.target === modal){
        controller.reset();
        modal.style.display = "none"
    }
}