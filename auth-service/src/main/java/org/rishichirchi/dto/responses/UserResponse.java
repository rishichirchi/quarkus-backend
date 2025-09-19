package org.rishichirchi.dto.responses;

public record UserResponse(
        Long id,
        String email,
        boolean emailValidated,
        String message) {
}
