package org.rishichirchi.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Map;

@ApplicationScoped
public class EmailService {
    
    @ConfigProperty(name = "email.service.url", defaultValue = "http://localhost:8000")
    String emailServiceUrl;
    
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        // Extract name from email (part before @) or use "User"
        String recipientName = toEmail.contains("@") ? 
            toEmail.substring(0, toEmail.indexOf("@")) : "User";
        
        // Create request payload
        Map<String, String> emailRequest = Map.of(
            "email", toEmail,
            "name", recipientName,
            "token", verificationToken
        );
        
        try (Client client = ClientBuilder.newClient()) {
            Response response = client.target(emailServiceUrl)
                .path("/send-verification")
                .request(MediaType.APPLICATION_JSON)
                .post(Entity.json(emailRequest));
            
            if (response.getStatus() == 200) {
                System.out.println("Email sent successfully via email service");
            } else {
                String errorMessage = response.readEntity(String.class);
                System.err.println("Failed to send email: " + errorMessage);
                throw new RuntimeException("Email sending failed: " + errorMessage);
            }
        } catch (Exception e) {
            System.err.println("Failed to call email service: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Email service call failed", e);
        }
    }
}
