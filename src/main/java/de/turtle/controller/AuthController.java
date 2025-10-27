package de.turtle.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.turtle.models.AuthDTOs;
import de.turtle.models.User;
import de.turtle.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;


@RestController
@CrossOrigin("*")
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final String SESSION_USER_KEY = "authenticated_user";
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTOs.RegisterRequest request) {
        try {
            if (request.getUsername() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(new  AuthDTOs.AuthResponse(false, "Username and password are required"));
            }
            
            User user = userService.registerUser(request.getUsername(), request.getPassword());
            logger.info("User registered successfully: {}", request.getUsername());
            
            return ResponseEntity.ok(new  AuthDTOs.AuthResponse(true, "User registered successfully"));
            
        } catch (IllegalArgumentException e) {
            logger.warn("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new  AuthDTOs.AuthResponse(false, e.getMessage()));
        } catch (Exception e) {
            logger.error("Registration error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new  AuthDTOs.AuthResponse(false, "Registration failed"));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody  AuthDTOs.LoginRequest request, HttpServletRequest httpRequest) {
        try {
            if (request.getUsername() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(new  AuthDTOs.AuthResponse(false, "Username and password are required"));
            }
            
            boolean authenticated = userService.authenticateUser(request.getUsername(), request.getPassword());
            
            if (authenticated) {
                HttpSession session = httpRequest.getSession(true);
                session.setAttribute(SESSION_USER_KEY, request.getUsername());
                session.setMaxInactiveInterval(24 * 60 * 60); //24 hours
                
                logger.info("User logged in successfully: {}", request.getUsername());
                return ResponseEntity.ok(new  AuthDTOs.AuthResponse(true, "Login successful", request.getUsername()));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new  AuthDTOs.AuthResponse(false, "Invalid username or password"));
            }
            
        } catch (Exception e) {
            logger.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new  AuthDTOs.AuthResponse(false, "Login failed"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                String username = (String) session.getAttribute(SESSION_USER_KEY);
                session.invalidate();
                logger.info("User logged out successfully: {}", username);
            }
            return ResponseEntity.ok(new  AuthDTOs.AuthResponse(true, "Logout successful"));
        } catch (Exception e) {
            logger.error("Logout error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new  AuthDTOs.AuthResponse(false, "Logout failed"));
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkAuthentication(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                String username = (String) session.getAttribute(SESSION_USER_KEY);
                if (username != null) {
                    return ResponseEntity.ok(new  AuthDTOs.AuthResponse(true, "User is authenticated", username));
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new  AuthDTOs.AuthResponse(false, "Not authenticated"));
        } catch (Exception e) {
            logger.error("Authentication check error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new  AuthDTOs.AuthResponse(false, "Authentication check failed"));
        }
    }
    
    //Helper method to check if user is authenticated
    public static boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return session.getAttribute(SESSION_USER_KEY) != null;
        }
        return false;
    }
    
    //Helper method to get current user
    public static String getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return (String) session.getAttribute(SESSION_USER_KEY);
        }
        return null;
    }
    
}