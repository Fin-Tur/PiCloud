package de.turtle.PiCloud.services;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import de.turtle.models.User;

public class UserActionsTest extends UserServiceTest{
    
    @Test
    @DisplayName("Should register User")
    void shouldRegisterUser(){
        
        when(repo.existsByUsername(anyString())).thenReturn(false);
        when(repo.save(any(User.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });

        User user = userService.registerUser("Name", "secure_password");

        assertNotNull(user);
        assertEquals("Name", user.getUsername());
        assertEquals("hashed_secure_password", user.getHashedPassword());
        verify(repo).save(user);

    }
    
    @Test
    @DisplayName("Should reject Registration password length")
    void shouldRejectRegistrationPassword(){

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> userService.registerUser("name", "test"));

        assertTrue(exception.getMessage().contains("Password must be at least 6 characters long"));

    }

    @Test
    @DisplayName("Should reject Registration username already exists")
    void shouldRejectRegristrationUsername(){

        when(repo.existsByUsername(anyString())).thenReturn(true);
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> userService.registerUser("name", "test12345"));
        assertTrue(exception.getMessage().contains("Username already exists"));
    }

    @Test
    @DisplayName("Should authenticate User")
    void shouldauthenticateUser(){
        when(repo.findByUsernameAndEnabled(anyString(), anyBoolean())).thenAnswer(invocation -> {
            User user = new User("testUser", "hashed_password");
            return Optional.of(user);
        });

        Boolean ans = userService.authenticateUser("testUser", "password");

        assertTrue(ans);
    }

    @Test
    @DisplayName("Should reject Authentification password")
    void shouldRejectAuthPassword(){
        when(repo.findByUsernameAndEnabled(anyString(), anyBoolean())).thenAnswer(invocation -> {
            User user = new User("testUser", "hashed_password123");
            return Optional.of(user);
        });

        Boolean ans = userService.authenticateUser("testUser", "password");

        assertTrue(!ans);
    }

    @Test
    @DisplayName("Should Reject Authentification username")
    void ShouldRejectAuthUsername(){
        when(repo.findByUsernameAndEnabled(anyString(), anyBoolean())).thenReturn(Optional.empty());
        Boolean ans = userService.authenticateUser("test", "pw123456");
        assertTrue(!ans);
    }

}

