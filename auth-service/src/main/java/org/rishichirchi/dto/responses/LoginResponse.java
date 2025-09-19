package org.rishichirchi.dto.responses;

public record LoginResponse(
        Long id,
        String email,
        boolean emailValidated,
        String message,
        boolean loginSuccess) {
}
