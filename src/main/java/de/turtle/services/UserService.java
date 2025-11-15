package de.turtle.services;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import de.turtle.models.User;
import de.turtle.models.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class UserService {
    
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @Autowired
    private UserRepository userRepository;
    

    @Transactional
    public User registerUser(String username, String password) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        String hashedPassword = passwordEncoder.encode(password);
        
        User user = new User(username, hashedPassword);
        User savedUser = userRepository.save(user);
        
        log.info("User registered successfully: {}", username);
        return savedUser;
    }
    

    public boolean authenticateUser(String username, String password) {
        if (username == null || password == null) {
            return false;
        }
        
        Optional<User> userOpt = userRepository.findByUsernameAndEnabled(username, true);
        if (userOpt.isEmpty()) {
            log.warn("Authentication failed: User entered wrong pasword!");
            return false;
        }
        
        User user = userOpt.get();
        boolean matches = passwordEncoder.matches(password, user.getHashedPassword());
        
        if (matches) {
            log.info("User authenticated successfully: {}", username);
        } else {
            log.warn("Authentication failed: Wrong password for user: {}", username);
        }
        
        return matches;
    }
    

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }
    

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    

    @Transactional
    public boolean setUserEnabled(String username, boolean enabled) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        user.setEnabled(enabled);
        userRepository.save(user);
        
        log.info("User {} {}: {}", enabled ? "enabled" : "disabled", "successfully", username);
        return true;
    }

}