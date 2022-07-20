package it.polimi.tiw.tiwprojectjs.filters;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class LoginFilter implements Filter {

    public LoginFilter(){
        super();
    }

    @Override public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        String loginPath = httpServletRequest.getServletContext().getContextPath() + "/index.html";
        HttpSession session = httpServletRequest.getSession();

        System.out.print("Login checker filter executing ...\n");

        if (session.isNew() || session.getAttribute("user") == null) {
            httpServletResponse.setStatus(403);
            httpServletResponse.sendRedirect(loginPath);
            return;
        }

        chain.doFilter(request, response);
    }

    @Override public void destroy() {
        Filter.super.destroy();
    }
}
