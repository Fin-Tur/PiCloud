package de.turtle.config;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import de.turtle.models.ExceptionDTO;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    //Extract Field Errors if validation exception
    private Map<String, String> extractFieldErrors(Exception ex) {
        Map<String, String> errors = new HashMap<>();

        switch (ex) {
            case MethodArgumentNotValidException e -> e.getBindingResult().getAllErrors().forEach((error) -> {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();
                errors.put(fieldName, errorMessage);
            });
            case ConstraintViolationException e -> e.getConstraintViolations().forEach((violation) -> {
                String propertyPath = violation.getPropertyPath().toString();
                String message = violation.getMessage();
                errors.put(propertyPath, message);
            });
            default -> {

            }
        }
        return errors;
    }

    //Catches @Valid in Controller methods
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = extractFieldErrors(ex);
        logger.error("Error occured caused by Args Validation");
        return ResponseEntity.badRequest().body(new ExceptionDTO("Argument Violation", errors));
    }

    //Catches Constraints (@Validated)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ExceptionDTO> handleConstraintViolationException(ConstraintViolationException ex) {
        Map<String, String> errors = extractFieldErrors(ex);
        logger.error("Error occured caused by Constraint Violation");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ExceptionDTO("Constraint Violation", errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ExceptionDTO> handleIllegalArgException(Exception ex) {
        logger.error("Error occured due to Illegal args: " + ex.getMessage());
        return ResponseEntity.badRequest().body(new ExceptionDTO("Illegal Args Error occured"));
       
    }

    //GenereC (unspecific)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionDTO> handleGlobalException(Exception ex) {  
        logger.error("Error occured due to Illegal args: " + ex.getMessage());
        return ResponseEntity.badRequest().body(new ExceptionDTO("Exception occured " + ex.getMessage()));
    }
    
}
