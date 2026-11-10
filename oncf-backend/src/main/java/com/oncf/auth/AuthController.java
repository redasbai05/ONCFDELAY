package com.oncf.auth;

import com.oncf.dto.AuthResponse;
import com.oncf.dto.LoginRequest;
import com.oncf.dto.RegisterRequest;
import com.oncf.model.Agent;
import com.oncf.model.Voyageur;
import com.oncf.repository.AgentRepository;
import com.oncf.repository.VoyageurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final VoyageurRepository voyageurRepository;
    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (voyageurRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already in use"));
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        Voyageur voyageur = Voyageur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(encodedPassword)
                .telephone(request.getTelephone())
                .build();
        voyageur = voyageurRepository.save(voyageur);
        String token = jwtTokenProvider.generateToken(voyageur.getEmail(), "VOYAGEUR", voyageur.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponse.builder()
                        .token(token)
                        .email(voyageur.getEmail())
                        .role("VOYAGEUR")
                        .nom(voyageur.getNom())
                        .prenom(voyageur.getPrenom())
                        .id(voyageur.getId())
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        var voyageurOpt = voyageurRepository.findByEmail(request.getEmail());
        if (voyageurOpt.isPresent()) {
            Voyageur v = voyageurOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), v.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
            String token = jwtTokenProvider.generateToken(v.getEmail(), "VOYAGEUR", v.getId());
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .email(v.getEmail())
                    .role("VOYAGEUR")
                    .nom(v.getNom())
                    .prenom(v.getPrenom())
                    .id(v.getId())
                    .build());
        }

        var agentOpt = agentRepository.findByEmail(request.getEmail());
        if (agentOpt.isPresent()) {
            Agent a = agentOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), a.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
            String token = jwtTokenProvider.generateToken(a.getEmail(), "AGENT", a.getId());
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .email(a.getEmail())
                    .role("AGENT")
                    .nom(a.getNom())
                    .prenom(a.getPrenom())
                    .id(a.getId())
                    .build());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
    }
}
