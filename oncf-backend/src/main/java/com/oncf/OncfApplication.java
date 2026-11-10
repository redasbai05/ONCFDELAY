package com.oncf;

import com.oncf.model.Agent;
import com.oncf.repository.AgentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class OncfApplication {
    public static void main(String[] args) {
        SpringApplication.run(OncfApplication.class, args);
    }

    @Bean
    CommandLineRunner seedAgent(AgentRepository agentRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (agentRepository.findByEmail("agent@oncf.ma").isEmpty()) {
                Agent agent = Agent.builder()
                        .nom("Admin")
                        .prenom("ONCF")
                        .email("agent@oncf.ma")
                        .password(passwordEncoder.encode("admin123"))
                        .matricule("AG-001")
                        .build();
                agentRepository.save(agent);
                System.out.println("=== Agent created: agent@oncf.ma / admin123 ===");
            }
        };
    }
}
