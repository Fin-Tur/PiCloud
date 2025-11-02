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
import de.turtle.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;


@RestController
@CrossOrigin("*")
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDTOs.RegisterRequest request) {
        try {
            if (request.getUsername() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(new  AuthDTOs.AuthResponse(false, "Username and password are required"));
            }
            
            userService.registerUser(request.getUsername(), request.getPassword());
            logger.info("User registered successfully: {}", request.getUsername());
            
            return ResponseEntity.ok(new AuthDTOs.AuthResponse(true, "User registered successfully"));
            
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
    public ResponseEntity<?> login(@RequestBody AuthDTOs.LoginRequest request, HttpServletRequest httpRequest) {
        try {
            if (request.getUsername() == null || request.getPassword() == null) {
                return ResponseEntity.badRequest().body(new AuthDTOs.AuthResponse(false, "Username and password are required"));
            }
            
            boolean authenticated = userService.authenticateUser(request.getUsername(), request.getPassword());
            
            if (authenticated) {
                // Minimale Lösung: Einfach Session-Attribute setzen
                HttpSession session = httpRequest.getSession(true);
                session.setAttribute("username", request.getUsername());
                session.setAttribute("authenticated", true);
                
                logger.info("User logged in successfully: {}", request.getUsername());
                return ResponseEntity.ok(new AuthDTOs.AuthResponse(true, "Login successful", request.getUsername()));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthDTOs.AuthResponse(false, "Invalid username or password"));
            }
            
        } catch (Exception e) {
            logger.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthDTOs.AuthResponse(false, "Login failed"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        try {
            HttpSession session = httpRequest.getSession(false);
            String username = null;
            
            if (session != null) {
                username = (String) session.getAttribute("username");
                session.invalidate(); // Session komplett löschen
            }
            
            logger.info("User logged out successfully: {}", username);
            return ResponseEntity.ok(new AuthDTOs.AuthResponse(true, "Logout successful"));
        } catch (Exception e) {
            logger.error("Logout error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthDTOs.AuthResponse(false, "Logout failed"));
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkAuthentication(HttpServletRequest httpRequest) {
        try {
            HttpSession session = httpRequest.getSession(false);
            
            if (session != null) {
                String username = (String) session.getAttribute("username");
                Boolean authenticated = (Boolean) session.getAttribute("authenticated");
                
                if (Boolean.TRUE.equals(authenticated) && username != null) {
                    return ResponseEntity.ok(new AuthDTOs.AuthResponse(true, "User is authenticated", username));
                }
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthDTOs.AuthResponse(false, "Not authenticated"));
        } catch (Exception e) {
            logger.error("Authentication check error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthDTOs.AuthResponse(false, "Authentication check failed"));
        }
    }

    public static boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Boolean authenticated = (Boolean) session.getAttribute("authenticated");
            return Boolean.TRUE.equals(authenticated);
        }
        return false;
    }
    
    public static String getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && Boolean.TRUE.equals(session.getAttribute("authenticated"))) {
            return (String) session.getAttribute("username");
        }
        return null;
    }
    
}