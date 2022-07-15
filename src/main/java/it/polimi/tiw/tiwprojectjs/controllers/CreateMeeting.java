package it.polimi.tiw.tiwprojectjs.controllers;

import it.polimi.tiw.tiwprojectjs.beans.Meeting;
import it.polimi.tiw.tiwprojectjs.beans.User;
import it.polimi.tiw.tiwprojectjs.dao.MeetingDAO;
import it.polimi.tiw.tiwprojectjs.dao.UserDAO;
import it.polimi.tiw.tiwprojectjs.utilities.ConnectionHandler;
import it.polimi.tiw.tiwprojectjs.utilities.Pair;
import org.apache.commons.lang.StringEscapeUtils;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

@WebServlet("/CreateMeeting")
@MultipartConfig
public class CreateMeeting extends HttpServlet {
    private Connection connection;

    public CreateMeeting() {
        super();
    }

    public void init() throws ServletException {
        connection = ConnectionHandler.getConnection(getServletContext());
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        doPost(request, response);
    }

    @SuppressWarnings("DuplicatedCode")
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        String title;
        int duration;
        Time time;
        Date date;
        int numberOfParticipants;
        Meeting tempMeeting;

        boolean noSelection = false;
        int counter = 0;

        try {
            title = StringEscapeUtils.escapeJava(request.getParameter("title"));
            duration = Integer.parseInt(StringEscapeUtils.escapeJava(request.getParameter("duration")));
            time = new Time(new SimpleDateFormat("HH:mm").parse(StringEscapeUtils.escapeJava(request.getParameter("time"))).getTime());
            date = new SimpleDateFormat("yyyy-MM-dd").parse(request.getParameter("date"));
            numberOfParticipants = Integer.parseInt(StringEscapeUtils.escapeJava(request.getParameter("numberOfParticipants")));

            if (title == null || duration == 0 || date == null || numberOfParticipants == 0 || title.isEmpty()) throw new Exception();
            if (duration <= 0 || numberOfParticipants < 1) throw new Exception();

            Calendar calendarA = Calendar.getInstance();
            calendarA.setTime(date);
            Calendar calendarB = Calendar.getInstance();
            calendarB.setTime(time);

            calendarA.set(Calendar.HOUR_OF_DAY, calendarB.get(Calendar.HOUR_OF_DAY));
            calendarA.set(Calendar.MINUTE, calendarB.get(Calendar.MINUTE));
            calendarA.set(Calendar.SECOND, calendarB.get(Calendar.SECOND));
            calendarA.set(Calendar.MILLISECOND, calendarB.get(Calendar.MILLISECOND));

            Date result = calendarA.getTime();

            if (result.before(Calendar.getInstance().getTime())) {
                response.getWriter().println("past");
                throw new Exception();
            }

            if(request.getParameterValues("checkbox") == null) noSelection = true;
        } catch(Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        User user = (User) request.getSession().getAttribute("user");
        HashMap<String, Pair<User, Boolean>> userMap;

        UserDAO userDAO = new UserDAO(connection);
        try {
            userMap = userDAO.getHashUsers(user);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        if(session.getAttribute("title") != null) {
            if(title.equals(session.getAttribute("title"))) counter = (int) session.getAttribute("counter");
            else {
                session.setAttribute("title", title);
                session.setAttribute("counter", 0);
            }
        } else {
            session.setAttribute("title", title);
            session.setAttribute("counter", 0);
        }

        ArrayList<String> selectedUsers;

        if(!noSelection) {
            selectedUsers = new ArrayList<>(Arrays.asList(request.getParameterValues("checkbox")));

            for(String username : selectedUsers){
                if(userMap.containsKey(username)){
                    userMap.get(username).set_2(Boolean.TRUE);
                }
            }
        } else selectedUsers = new ArrayList<>();

        tempMeeting = new Meeting(user.getUsername(), title, date, time, duration, numberOfParticipants);

        if(selectedUsers.size() > tempMeeting.getNumberOfParticipants() - 1 || selectedUsers.size() <= 0) {
            counter++;
            session.setAttribute("counter", counter);

            if(counter >= 3) {
                session.removeAttribute("title");
                session.removeAttribute("counter");
                response.getWriter().println("terminate");
            } else if(noSelection) response.getWriter().println("zero");

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        try{
            MeetingDAO meetingDAO = new MeetingDAO(connection);
            meetingDAO.createMeeting(user, tempMeeting, userMap);

            session.removeAttribute("title");
            session.removeAttribute("counter");
        } catch (Exception exception) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
