
package com.naluluxe.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EstadoController {

    @GetMapping("/estado")
    public Map<String, Object> consultarEstado() {

        return Map.of(
            "aplicacion", "NALU LUXE",
            "estado", "ACTIVO",
            "mensaje", "Backend funcionando correctamente",
            "fecha", LocalDateTime.now().toString()
        );
    }
}
