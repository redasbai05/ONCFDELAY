package com.oncf.auth;

import com.oncf.model.Agent;
import com.oncf.model.Voyageur;
import com.oncf.repository.AgentRepository;
import com.oncf.repository.VoyageurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final VoyageurRepository voyageurRepository;
    private final AgentRepository agentRepository;

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var voyageur = voyageurRepository.findByEmail(email);
        if (voyageur.isPresent()) {
            Voyageur v = voyageur.get();
            return new User(v.getEmail(), v.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_VOYAGEUR")));
        }

        var agent = agentRepository.findByEmail(email);
        if (agent.isPresent()) {
            Agent a = agent.get();
            return new User(a.getEmail(), a.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_AGENT")));
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
