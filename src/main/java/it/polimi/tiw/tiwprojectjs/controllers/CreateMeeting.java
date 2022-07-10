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

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        String title;
        int duration;
        Time time;
        Date date;
        int numberOfParticipants;
        Meeting tempMeeting;
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

            if (result.before(Calendar.getInstance().getTime())) throw new Exception();
        } catch(Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("count");
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

        ArrayList<String> selectedUsers = new ArrayList<>(Arrays.asList(request.getParameterValues("checkbox")));

        for(String username : selectedUsers){
            if(userMap.containsKey(username)){
                userMap.get(username).set_2(Boolean.TRUE);
            }
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

        tempMeeting = new Meeting(user.getUsername(), title, date, time, duration, numberOfParticipants);

        if(selectedUsers.size() > tempMeeting.getNumberOfParticipants() - 1 || selectedUsers.size() <= 0) {
            counter++;

            if(counter >= 3) {
                session.removeAttribute("title");
                session.removeAttribute("counter");
            }

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

    /* CREATEMEETING
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();

        if(request.getParameterValues("selectedUsers") == null){
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,"Missing valid parameters.");
        }

        User user = (User) session.getAttribute("user");
        Meeting tempMeeting = (Meeting) session.getAttribute("tempMeeting");
        HashMap<String, Pair<User, Boolean>> userMap = (HashMap<String, Pair<User, Boolean>>) session.getAttribute("userMap");

        ArrayList<String> selectedUsers = new ArrayList<>(Arrays.asList(request.getParameterValues("selectedUsers")));

        for(String username : userMap.keySet()){
            userMap.get(username).set_2(Boolean.FALSE);
        }

        for(String username : selectedUsers){
            if(userMap.containsKey(username)){
                userMap.get(username).set_2(Boolean.TRUE);
            }
        }

        session.setAttribute("userMap", userMap);

        if(selectedUsers.size() > tempMeeting.getNumberOfParticipants() - 1 || selectedUsers.size() <= 0){
            int counter = (int) session.getAttribute("counter");
            counter++;
            session.setAttribute("counter", counter);

            if(counter <= 2){
                session.setAttribute("errorMessage", "You selected too many users. Please unselect at least " + (selectedUsers.size()- tempMeeting.getNumberOfParticipants()+1) + " users.");
                response.sendRedirect(getServletContext().getContextPath() + "/Registry");
                return;
            } else {
                response.sendRedirect(getServletContext().getContextPath() + "/Undo");
                return;
            }
        }

        try{
            MeetingDAO meetingDAO = new MeetingDAO(connection);
            meetingDAO.createMeeting(user, tempMeeting, userMap);
        } catch (Exception exception) {
            exception.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "There was a problem with the database. :(");
            return;
        }

        response.sendRedirect(getServletContext().getContextPath() + "/Home");
    }

     */ //CREATEMEETING

    /* NEWMEETING
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();

        String title;
        int duration;
        Time time;
        Date date;
        int numberOfParticipants;

        User user = (User) request.getSession().getAttribute("user");

        try {
            title = StringEscapeUtils.escapeJava(request.getParameter("title"));
            duration = Integer.parseInt(StringEscapeUtils.escapeJava(request.getParameter("duration")));
            time = new Time(new SimpleDateFormat("HH:mm").parse(StringEscapeUtils.escapeJava(request.getParameter("time"))).getTime());
            date = new SimpleDateFormat("yyyy-MM-dd").parse(request.getParameter("date"));
            numberOfParticipants = Integer.parseInt(StringEscapeUtils.escapeJava(request.getParameter("numberOfParticipants")));

            if (title == null || duration == 0 || date == null || numberOfParticipants == 0 || title.isEmpty()) throw new Exception();
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Incorrect param values");
            return;
        }

        if (duration <= 0 || numberOfParticipants < 1){
            sendError("The numbers entered are not correct.", request, response);
            return;
        }

        Calendar calendarA = Calendar.getInstance();
        calendarA.setTime(date);
        Calendar calendarB = Calendar.getInstance();
        calendarB.setTime(time);

        calendarA.set(Calendar.HOUR_OF_DAY, calendarB.get(Calendar.HOUR_OF_DAY));
        calendarA.set(Calendar.MINUTE, calendarB.get(Calendar.MINUTE));
        calendarA.set(Calendar.SECOND, calendarB.get(Calendar.SECOND));
        calendarA.set(Calendar.MILLISECOND, calendarB.get(Calendar.MILLISECOND));

        Date result = calendarA.getTime();

        if (result.before(Calendar.getInstance().getTime())){
            sendError("You cannot enter a prior date to today.", request, response);
            return;
        }

        Meeting tempMeeting = new Meeting(user.getUsername(), title, date, time, duration, numberOfParticipants);
        request.getSession().setAttribute("tempMeeting", tempMeeting);
        request.getSession().setAttribute("counter", 0);
        request.getSession().setAttribute("userMap", new HashMap<String, Pair<User, Boolean>>());

        response.sendRedirect(getServletContext().getContextPath() + "/Registry");
    }
     */
}
