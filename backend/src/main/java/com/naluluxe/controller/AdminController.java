
package com.naluluxe.controller;

import com.naluluxe.dto.AdminDto;
import com.naluluxe.service.AdminService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/resumen")
    public AdminDto.Resumen resumen() {
        return adminService.resumen();
    }

    @GetMapping("/productos")
    public List<AdminDto.Producto> productos() {
        return adminService.listarProductos();
    }

    @PutMapping("/productos/{id}/inventario")
    public AdminDto.Producto actualizarInventario(
            @PathVariable Long id,
            @Valid @RequestBody
            AdminDto.ActualizarInventario datos
    ) {
        return adminService.actualizarInventario(id, datos);
    }

    @GetMapping("/pedidos")
    public List<AdminDto.Pedido> pedidos() {
        return adminService.listarPedidos();
    }

    @PatchMapping("/pedidos/{id}/estado")
    public AdminDto.Mensaje actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody
            AdminDto.CambiarEstado datos
    ) {
        adminService.actualizarEstado(id, datos);

        return new AdminDto.Mensaje(
            "Estado del pedido actualizado."
        );
    }
}
