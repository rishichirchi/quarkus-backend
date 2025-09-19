package org.rishichirchi.dto.responses;

// For signup
public record SignupResponse(
        Long id,
        String email,
        String message,
        boolean success) {
}
