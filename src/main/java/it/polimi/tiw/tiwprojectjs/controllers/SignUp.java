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
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing credential value");
            return;
        }

        if (email.isEmpty() || username.isEmpty() || password.isEmpty() || passwordRepeated.isEmpty()) {
            sendError("One or more fields are empty", request, response);
            return;
        }

        if(!EmailValidator.getInstance().isValid(email)) {
            sendError("The inserted email is not valid", request, response);
            return;
        }

        if (!password.equals(passwordRepeated)) {
            sendError("The two passwords do not match", request, response);
            return;
        }

        //create User in db
        UserDAO userDAO = new UserDAO(connection);
        try {
            userDAO.createUser(email, username, password);
        } catch (SQLException e) {
            if (e.getMessage().contains("Duplicate"))
                sendError("The specified username and/or email is already registered", request, response);
            else response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
        }

        String path = getServletContext().getContextPath() + "/index.html";
        response.sendRedirect(path);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
        doPost(request, response);
    }

    private void sendError(String error, HttpServletRequest request, HttpServletResponse response){

        String path = "/index.html";

    }
}
