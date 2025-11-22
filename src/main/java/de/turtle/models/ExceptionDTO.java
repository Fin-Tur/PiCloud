package de.turtle.models;

import java.time.LocalDateTime;
import java.util.Map;

public class ExceptionDTO {
    
    private boolean success;
    private String message;
    private Map<String, String> errors;
    private LocalDateTime timestamp;

    public ExceptionDTO(String message){
        this.success = false;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ExceptionDTO(String message, Map<String, String> errors) {
        this.success = false;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Map<String, String> getErrors() { return errors; }
    public void setErrors(Map<String, String> errors) { this.errors = errors; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
