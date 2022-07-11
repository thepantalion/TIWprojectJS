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

@WebServlet("/VerifyMeeting")
@MultipartConfig
public class VerifyMeeting extends HttpServlet {
    public VerifyMeeting() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        doPost(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        String title;
        int duration;
        Time time;
        Date date;
        int numberOfParticipants;

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
        } catch(Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        response.setStatus(HttpServletResponse.SC_OK);
    }
}
