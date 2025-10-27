package de.turtle.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API calls
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )
            .authorizeHttpRequests(auth -> auth
                //Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/login.html").permitAll()
                .requestMatchers("/login.js").permitAll()
                .requestMatchers("/style.css").permitAll()
                .requestMatchers("/h2-console/**").permitAll() // For development
                
                //Protected endpoints
                .requestMatchers("/api/**").authenticated()
                .requestMatchers("/index.html").authenticated()
                .requestMatchers("/script.js").authenticated()
                .requestMatchers("/").authenticated()
                
                //Default fallback
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) //Disable default form login
            .httpBasic(basic -> basic.disable()) //Disable HTTP Basic auth
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())); //Allow H2 console
            
        return http.build();
    }
}