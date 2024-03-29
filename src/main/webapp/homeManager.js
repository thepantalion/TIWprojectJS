let controller;

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

            document.getElementById("logoutButton").addEventListener("click", () => {
                window.sessionStorage.removeItem("username");
                window.location.href = "index.html";
            });
        }
        this.reset = function() {
            meetingsCreatedList.reset();
            meetingsCreatedList.show();

            meetingsInvitedList.reset();
            meetingsInvitedList.show();
        }
    }

    function MeetingList(meetingParagraph, listContainer, listContainerBody, isInvited) {
        this.meetingParagraph = meetingParagraph;
        this.listContainer = listContainer;
        this.listContainerBody = listContainerBody;
        this.isInvited = isInvited;

        this.reset = function() {
            this.listContainer.style.visibility = "hidden";
        }
        this.show = function() {
            const self = this;

            function callBackFunction(request) {
                if (request.readyState === XMLHttpRequest.DONE) {
                    const payload = request.responseText;

                    switch (request.status) {
                        case 200:
                            const meetings = JSON.parse(payload);

                            if (meetings.length === 0) {
                                if(isInvited) self.meetingParagraph.textContent = "There are no invitations...";
                                else self.meetingParagraph.textContent = "You have not created any meeting yet...";

                                listContainer.style.visibility = "hidden"
                                return;

                            } else {
                                if(isInvited) self.meetingParagraph.textContent = "These are the meetings you have been invited to: ";
                                else self.meetingParagraph.textContent = "These are the meetings you have created: ";
                                self.update(meetings);
                            }

                            break;

                        case 401:
                            window.sessionStorage.removeItem('username');
                            window.location.href = request.getResponseHeader("Location");
                            break;

                        default:
                            meetingParagraph.textContent = "An error was encountered while retrieving the data..."
                    }
                }
            }

            if(this.isInvited === true) makeCall("GET", 'GetMeetingsInvited', null, function(request) {callBackFunction(request)}, false);
            else makeCall("GET", 'GetMeetingsCreated', null, function(request) {callBackFunction(request)}, false);
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
                    const number = formContainer.querySelector("input[name='numberOfParticipants']").value;
                    const duration = formContainer.querySelector("input[name='duration']").value;
                    if(number >= 2 && duration > 0) {
                        function verifyMeetingResponseManager(request) {
                            if (request.readyState === XMLHttpRequest.DONE) {
                                switch (request.status) {
                                    case 200:
                                        modal.style.display = "block";
                                        break;

                                    case 400:
                                        alert("The provided data is not correct. Please change it before submitting invitations.");
                                        break;

                                    case 401:
                                        window.sessionStorage.removeItem('username');
                                        window.location.href = request.getResponseHeader("Location");
                                        break;

                                    default:
                                       alert("An error was encountered while processing your request...");
                                }
                            }
                        }
                        makeCall("POST", 'VerifyMeeting', formContainer, function(request) {verifyMeetingResponseManager(request)}, false);
                    } else {
                        alert("The typed amount of users or the duration of the meeting are not valid. Please try again.");
                    }
                } else formContainer.reportValidity();
            });

            this.formContainer.querySelector("input[name='clearButton']").addEventListener("click", () =>{
                this.reset();
            })
        }
        this.reset = function() {
            this.formContainer.reset();
        }
    }

    window.addEventListener("load", () => {
        if(sessionStorage.getItem("username") == null) window.location.href = "index.html";
        else controller.setup();
    });
})();