
package com.naluluxe.config;

import com.naluluxe.security.FiltroSesion;
import com.naluluxe.service.LoginService;

import jakarta.servlet.DispatcherType;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            LoginService loginService
    ) throws Exception {

        http
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(
                    (request, response, error) ->
                        response.sendError(
                            HttpStatus.UNAUTHORIZED.value(),
                            "Inicia sesión para continuar."
                        )
                )
            )
            .addFilterBefore(
                new FiltroSesion(loginService),
                AnonymousAuthenticationFilter.class
            )
            .authorizeHttpRequests(auth -> auth

                .dispatcherTypeMatchers(
                    DispatcherType.ERROR
                ).permitAll()

                .requestMatchers("/error")
                .permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/estado",
                    "/api/catalogo/**"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/registro",
                    "/api/auth/verificar-correo",
                    "/api/auth/reenviar-registro",
                    "/api/auth/login",
                    "/api/auth/verificar-login",
                    "/api/auth/recuperar-clave",
                    "/api/auth/restablecer-clave",
                    "/api/consultas"
                ).permitAll()

                // Solo administradores.
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // Cualquier usuario autenticado puede
                // presentar su propia invitación.
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/invitaciones-admin/aceptar"
                ).authenticated()

                .requestMatchers(
                    "/api/auth/me",
                    "/api/auth/logout",
                    "/api/perfil",
                    "/api/perfil/**",
                    "/api/direcciones",
                    "/api/direcciones/**",
                    "/api/pedidos",
                    "/api/pedidos/**"
                ).authenticated()

                .anyRequest().denyAll()
            );

        return http.build();
    }
}
