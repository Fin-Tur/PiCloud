package de.turtle.PiCloud.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import de.turtle.models.UserRepository;
import de.turtle.services.UserService;


@DisplayName("user-Service Test")
public class UserServiceTest {
    
    @Mock
    UserRepository repo;

    @Mock
    BCryptPasswordEncoder pwEnc;

    @InjectMocks
    UserService userService;

    @BeforeEach
    void setUp(){

        MockitoAnnotations.openMocks(this);
        
        ReflectionTestUtils.setField(userService, "passwordEncoder", pwEnc);

        when(pwEnc.encode(anyString())).thenAnswer(invocation -> {
            return "hashed_" + invocation.getArgument(0);
        });

        when(pwEnc.matches(anyString(), anyString())).thenAnswer(invocation -> {
            return ("hashed_" + invocation.getArgument(0)).equals(invocation.getArgument(1));
        });
    }
}
