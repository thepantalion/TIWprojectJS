let controller; //controller needs to be exposed to all

(function() {
    let meetingsCreatedList, meetingsInvitedList, form;
    controller = new Controller();

    function Controller(){
        this.setup = function() {
            document.getElementById("idUsername").textContent = "Welcome back, " + sessionStorage.getItem("username") + "!";

            meetingsCreatedList = new MeetingList(document.getElementById("idMeetingsCreatedParagraph"), document.getElementById("idMeetingsCreatedTable"), document.getElementById("idMeetingsCreatedListContainer"), false);
            meetingsCreatedList.show();

            meetingsInvitedList = new MeetingList(document.getElementById("idMeetingsInvitedParagraph"), document.getElementById("idMeetingsInvitedTable"), document.getElementById("idMeetingsInvitedListContainer"), true);
            meetingsInvitedList.show();

            form = new Form(document.getElementById("idNewMeetingForm"));
            form.registerEvents();

            setInterval(this.reset, 40000);

            document.getElementById("logoutButton").addEventListener("click", () => {window.sessionStorage.removeItem("username");});
        }
        this.reset = function() {
            meetingsCreatedList.reset();
            meetingsCreatedList.show();

            meetingsInvitedList.reset();
            meetingsInvitedList.show();
        }
    }
    function MeetingList(meetingParagraph, listContainer, listContainerBody, isInvited) {
        this.listContainer = listContainer;
        this.listContainerBody = listContainerBody;
        this.isInvited = isInvited;

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
        }
        this.show = function() {
            const self = this;

            function callBackFunction(request) {
                if (request.readyState === 4) {
                    const payload = request.responseText;

                    switch (request.status) {
                        case 200:
                            const meetingsCreated = JSON.parse(payload);

                            if (meetingsCreated.length === 0) {
                                if(isInvited) meetingParagraph.textContent = "There are no invitations...";
                                else meetingParagraph.textContent = "You have not created any meeting yet...";

                                listContainer.style.visibility = "hidden"
                                return;
                            }

                            self.update(meetingsCreated);
                            break;

                        case 403:
                            window.location.href = request.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                            break;

                        default:
                            meetingParagraph.textContent = "An error was encountered while retrieving the data..."
                    }
                }
            }

            if(this.isInvited === true) makeCall("GET", 'GetMeetingsInvited', null, function(request) {callBackFunction(request)});
            else makeCall("GET", 'GetMeetingsCreated', null, function(request) {callBackFunction(request)});
        };
        this.update = function(meetingList) {
            const self = this;
            let row, titleCell, dateCell, timeCell, durationCell, hostCell;
            this.listContainerBody.innerHTML = ""; //serve a svuotare la tabella

            meetingList.forEach(function(meeting) {
                row = document.createElement("tr");

                titleCell = document.createElement("td");
                titleCell.textContent = meeting.title;
                row.appendChild(titleCell);

                dateCell = document.createElement("td");
                dateCell.textContent = meeting.date;
                row.appendChild(dateCell);

                timeCell = document.createElement("td");
                timeCell.textContent = meeting.time;
                row.appendChild(timeCell);

                durationCell = document.createElement("td");
                durationCell.textContent = meeting.duration + 'min';
                row.appendChild(durationCell);

                if(isInvited === true) {
                    hostCell = document.createElement("td");
                    hostCell.textContent = meeting.creator;
                    row.appendChild(hostCell);
                }

                self.listContainerBody.appendChild(row);
            });

            self.listContainer.style.visibility = "visible";
        };
    }
    function Form(formContainer) {
        this.formContainer = formContainer;

        this.registerEvents = function() {
            this.formContainer.querySelector("input[name='createTempMeeting']").addEventListener("click", () => {
                if(formContainer.checkValidity()) {
                    const value = formContainer.querySelector("input[name='numberOfParticipants']").value;
                    if(value >= 2) {
                        modal.style.display = "block";
                    } else {
                        alert("The typed amount of users is not valid. Please try again.");
                    }
                } else formContainer.reportValidity();
            });
        }
        this.reset = function() {
            formContainer.reset();
        }
    }

    window.addEventListener("load", () => {
        if(sessionStorage.getItem("username") == null) window.location.href = "index.html";
        else controller.setup();
    })
})();