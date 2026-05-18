package com.example.demo.configurations;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
        //Tells Spring Security to check WebConfig mappings for CORS rules
        .cors(Customizer.withDefaults())
        .csrf(csrf->csrf.disable())
        .authorizeHttpRequests(auth->auth
         .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
         .requestMatchers("/jamrik/register").permitAll()
         .anyRequest().authenticated()
          )
          //Configure Form Login to handle React API requests
          .formLogin(form->form
          .loginProcessingUrl("/jamrik/login")
          .successHandler((request, response,
                           authentication)->{
          response.setStatus(HttpServletResponse.SC_OK);
          response.getWriter().write("{\"message\": \"Login successful\"}");
          })
          .failureHandler((request,response,
                           exception)->{
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.getWriter().write("{\"error\": \"Invalid credentials\"}");
          })
          .permitAll()
          )
          //Configure Logout to return 200 OK instead of a 302 redirect
          .logout(logout->logout
           .logoutUrl("/jamrik/logout")
           .logoutSuccessHandler((request, response,
                                  authentication)->{
           response.setStatus(HttpServletResponse.SC_OK);
           response.getWriter().write("{\"message\": \"Logout successful\"}");
           })
           .permitAll()
           );
        return http.build();
    }
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}