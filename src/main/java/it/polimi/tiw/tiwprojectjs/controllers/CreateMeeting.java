package it.polimi.tiw.tiwprojectjs.controllers;

import it.polimi.tiw.tiwprojectjs.beans.Meeting;
import it.polimi.tiw.tiwprojectjs.beans.User;
import it.polimi.tiw.tiwprojectjs.dao.MeetingDAO;
import it.polimi.tiw.tiwprojectjs.utilities.ConnectionHandler;
import it.polimi.tiw.tiwprojectjs.utilities.Pair;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

@WebServlet("/CreateMeeting")
public class CreateMeeting extends HttpServlet {
    private Connection connection;

    public CreateMeeting() {
        super();
    }


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        doPost(request, response);
    }

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
}