package org.rishichirchi.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class User extends PanacheEntity{
    @Column(unique = true, nullable = false, length = 100)
    public String email;
    
    @Column(nullable = false, length = 255)
    public String password;
    
    
    @Column(nullable = false)
    public boolean emailValidated = false;
    
    @Column(length = 36) // UUID length
    public String validationToken;
    
    public LocalDateTime tokenExpiresAt;
    
    @Column(nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
    
    public LocalDateTime updatedAt;
    
    @Column(nullable = false)
    public boolean active = true;
}
