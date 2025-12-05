package com.tiendagorras.crm_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data; 

/**
 * Entidad que representa una Gorra en la base de datos.
 */
@Entity
@Data 
public class Gorra {

    // Clave primaria de la tabla
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Propiedades del Producto (Gorra)
    private String nombre; 
    private String marca;
    private String color;
    private Double precio;
    private Integer stock;
    private String imagenUrl; 
}