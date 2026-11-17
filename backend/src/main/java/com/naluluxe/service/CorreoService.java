
package com.naluluxe.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${nalu.mail.enabled:false}")
    private boolean correoHabilitado;

    @Value("${nalu.mail.dev-console:false}")
    private boolean modoConsola;

    @Value("${nalu.mail.from:}")
    private String remitente;

    public void enviarCodigoRegistro(
            String destinatario,
            String codigo
    ) {
        enviar(
            destinatario,
            codigo,
            "Verificación de registro"
        );
    }

    public void enviarCodigoLogin(
            String destinatario,
            String codigo
    ) {
        enviar(
            destinatario,
            codigo,
            "Verificación de inicio de sesión"
        );
    }

    public void enviarCodigoRecuperacion(
            String destinatario,
            String codigo
    ) {
        enviar(
            destinatario,
            codigo,
            "Recuperación de contraseña"
        );
    }

    private void enviar(
            String destinatario,
            String codigo,
            String operacion
    ) {
        if (correoHabilitado) {
            if (mailSender == null ||
                remitente == null ||
                remitente.isBlank()) {

                throw new IllegalStateException(
                    "La configuración SMTP está incompleta."
                );
            }

            SimpleMailMessage mensaje =
                new SimpleMailMessage();

            mensaje.setFrom(remitente);
            mensaje.setTo(destinatario);

            mensaje.setSubject(
                "NALÚ LUXE - " + operacion
            );

            mensaje.setText(
                "Hola,\n\n" +
                "Tu código de NALÚ LUXE es: " +
                codigo + "\n\n" +
                "Operación: " + operacion + "\n" +
                "El código vence en 10 minutos.\n" +
                "No lo compartas.\n\n" +
                "Si no solicitaste esta operación, " +
                "puedes ignorar este mensaje.\n\n" +
                "NALÚ LUXE"
            );

            mailSender.send(mensaje);
            return;
        }

        if (modoConsola) {
            System.out.println(
                "\n====================================\n" +
                "NALÚ LUXE - MODO LOCAL\n" +
                "Operación: " + operacion + "\n" +
                "Destinatario: " + destinatario + "\n" +
                "Código OTP: " + codigo + "\n" +
                "====================================\n"
            );
            return;
        }

        throw new IllegalStateException(
            "El envío de correos no está configurado."
        );
    }
}
