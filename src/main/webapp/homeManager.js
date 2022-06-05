{
    let controller = new Controller();
    let meetingsCreatedList, meetingsInvitedList;

    window.addEventListener("load", () => {
        if(sessionStorage.getItem("username") == null) window.location.href = "index.html";
        else {
            controller.setup();
        }
    })

    function Controller(){
        this.setup = function() {
            meetingsCreatedList = new MeetingList(document.getElementById("idMeetingsCreatedParagraph"), document.getElementById("idMeetingsCreatedTable"), document.getElementById("idMeetingsCreatedListContainer"), false);
            meetingsCreatedList.show();

            meetingsInvitedList = new MeetingList(document.getElementById("idMeetingsInvitedParagraph"), document.getElementById("idMeetingsInvitedTable"), document.getElementById("idMeetingsInvitedListContainer"), true);
            meetingsInvitedList.show();

        }
    }

    function MeetingList(meetingParagraph, listContainer, listContainerBody, isInvited) {
        this.meetingParagrah = meetingParagraph;
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
                                meetingParagraph.textContent = "Non c'è niente da mostrare :(";
                                return;
                            }

                            self.update(meetingsCreated);
                            break;

                        case 403:
                            window.location.href = request.getResponseHeader("Location");
                            window.sessionStorage.removeItem('username');
                            break;

                        default:
                        //mostra un messaggio
                    }
                }
            }

            if(this.isInvited === true) makeCall("GET", 'GetMeetingsInvited', null, function(request) {callBackFunction(request)});
            else makeCall("GET", 'GetMeetingsCreated', null, function(request) {callBackFunction(request)});
        };
        this.update = function(meetingList) {
            let row, titleCell, dateCell, timeCell, durationCell, hostCell;
            this.listContainerBody.innerHTML = ""; //serve a svuotare la tabella

            const self = this;
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

    function Meeting(data){
        this.id = data.id;
        this.idCreator = data.idCreator;
        this.creator = data.creator;
        this.title = data.title;
        this.date = data.date;
        this.time = data.time;
        this.duration = data.duration;
        this.numberOfParticipants = data.numberOfParticipants;

        this.show = function() {

        };
    }
}