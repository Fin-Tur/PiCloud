package de.turtle.models;

import jakarta.validation.constraints.NotBlank;

public class AuthDTOs {
    
    //Request DTOs
    public static class LoginRequest {
        @NotBlank (message = "Username can not be empty")
        private String username;

        @NotBlank (message = "Password can not be empty")
        private String password;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class RegisterRequest {
        
        @NotBlank (message = "Username can not be empty")
        private String username;

        @NotBlank (message = "Password can not be empty")
        private String password;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    //Response DTO
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String username;
        
        public AuthResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        
        public AuthResponse(boolean success, String message, String username) {
            this.success = success;
            this.message = message;
            this.username = username;
        }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}
