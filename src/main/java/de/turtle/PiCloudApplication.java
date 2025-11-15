package de.turtle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "de.turtle.models")
public class PiCloudApplication {

	public static void main(String[] args) {
		SpringApplication.run(PiCloudApplication.class, args);
		
	}

}
