
package com.naluluxe.security;

import com.naluluxe.entity.Usuario;
import com.naluluxe.service.LoginService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class FiltroSesion extends OncePerRequestFilter {

    private final LoginService loginService;

    public FiltroSesion(LoginService loginService) {
        this.loginService = loginService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String autorizacion =
            request.getHeader("Authorization");

        if (autorizacion != null &&
            autorizacion.startsWith("Bearer ")) {

            String token = autorizacion.substring(7);

            Usuario usuario =
                loginService.usuarioDesdeToken(token);

            if (usuario != null) {

                String rol = usuario.getRol().getNombre();

                var autoridades = List.of(
                    new SimpleGrantedAuthority(
                        "ROLE_" + rol
                    )
                );

                var autenticacion =
                    new UsernamePasswordAuthenticationToken(
                        usuario.getCorreo(),
                        null,
                        autoridades
                    );

                SecurityContextHolder
                    .getContext()
                    .setAuthentication(autenticacion);
            }
        }

        chain.doFilter(request, response);
    }
}
