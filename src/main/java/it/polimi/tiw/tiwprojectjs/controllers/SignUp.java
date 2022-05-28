package it.polimi.tiw.tiwprojectjs.controllers;

import it.polimi.tiw.tiwprojectjs.dao.UserDAO;
import it.polimi.tiw.tiwprojectjs.utilities.ConnectionHandler;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.validator.routines.EmailValidator;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

@WebServlet("/SignUp")
@MultipartConfig
public class SignUp extends HttpServlet {
    private Connection connection;

    public SignUp() {
        super();
    }

    public void init() throws ServletException {
        connection = ConnectionHandler.getConnection(getServletContext());
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String email;
        String username;
        String password;
        String passwordRepeated;

        try {
            email = StringEscapeUtils.escapeJava(request.getParameter("email"));
            username = StringEscapeUtils.escapeJava(request.getParameter("username"));
            password = StringEscapeUtils.escapeJava(request.getParameter("password"));
            passwordRepeated = StringEscapeUtils.escapeJava(request.getParameter("repeatPassword"));

            if (email == null || username == null || password == null || passwordRepeated == null) throw new Exception();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing credential values");
            return;
        }

        if (email.isEmpty() || username.isEmpty() || password.isEmpty() || passwordRepeated.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("One or more fields are empty");
            return;
        }

        if(!EmailValidator.getInstance().isValid(email)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("The inserted email is not valid");
            return;
        }

        if (!password.equals(passwordRepeated)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("The two passwords do not match");
            return;
        }

        //create User in db
        UserDAO userDAO = new UserDAO(connection);

        try {
            userDAO.createUser(email, username, password);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

            if (e.getMessage().contains("Duplicate")) response.getWriter().println("The specified username and/or email is already registered");
            else response.getWriter().println("The database couldn't keep up with you /:(");
            return;
        }

        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().println("The new user was successfully registered!");
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
        doPost(request, response);
    }
}
