package it.polimi.tiw.tiwprojectjs.dao;

import it.polimi.tiw.tiwprojectjs.beans.User;
import it.polimi.tiw.tiwprojectjs.utilities.Pair;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

public class UserDAO {
    private final Connection connection;

    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    public User checkCredentials(String username, String password) throws SQLException {
        String query = "SELECT  idUser, username, email FROM db_tiw_project.user WHERE username = ? AND password = ?";
        try (PreparedStatement preparedStatement = connection.prepareStatement(query)){
            preparedStatement.setString(1, username);
            preparedStatement.setString(2, password);

            try (ResultSet result = preparedStatement.executeQuery()){
                if(!result.isBeforeFirst()) return null;
                else {
                    result.next();
                    User user = new User();
                    user.setId(result.getInt("idUser"));
                    user.setUsername(result.getString("username"));
                    user.setEmail(result.getString("email"));
                    return user;
                }
            }
        }
    }

    public void createUser(String email, String username, String password) throws SQLException {
        String query = "INSERT into db_tiw_project.user (email, username, password) VALUES(?, ?, ?)";
        try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, email);
            preparedStatement.setString(2, username);
            preparedStatement.setString(3, password);
            preparedStatement.executeUpdate();
        }
    }

    public ArrayList<String> addNewUsers(User creator) throws SQLException {
        ArrayList<String> userList = new ArrayList<>();
        String query = "SELECT idUser, username, email FROM db_tiw_project.user WHERE username <> ?";

        try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, creator.getUsername());

            try (ResultSet result = preparedStatement.executeQuery()){
                while(result.next()) userList.add(result.getString("username"));
            }
        }

        return userList;
    }

    public HashMap<String, Pair<User, Boolean>> addNewUsers(User creator, HashMap<String, Pair<User, Boolean>> userMap) throws SQLException {
        String query = "SELECT idUser, username, email FROM db_tiw_project.user WHERE username <> ?";

        try (PreparedStatement preparedStatement = connection.prepareStatement(query)) {
            preparedStatement.setString(1, creator.getUsername());

            try (ResultSet result = preparedStatement.executeQuery()){
                while(result.next()){
                    if(!userMap.containsKey(result.getString("username"))) {
                        User user = new User();
                        user.setId(result.getInt("idUser"));
                        user.setUsername(result.getString("username"));
                        user.setEmail(result.getString("email"));

                        userMap.put(result.getString("username"), new Pair<>(user, Boolean.FALSE));
                    }
                }
            }
        }

        return userMap;
    }
}
