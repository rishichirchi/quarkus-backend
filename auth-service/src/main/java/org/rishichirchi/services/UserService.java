package org.rishichirchi.services;

import org.rishichirchi.entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;
import java.time.LocalDateTime;
import java.util.UUID;

@ApplicationScoped
public class UserService {
    
    @Transactional
    public User createUser(String email, String plainTextPassword){
        if(User.find("email", email).firstResult() != null){
            throw new IllegalArgumentException("Email already in use");
        }
        
        User user = new User();
        user.email = email;
        user.password = hashPassword(plainTextPassword);
        user.validationToken = UUID.randomUUID().toString();
        user.tokenExpiresAt = LocalDateTime.now().plusHours(24);
        user.createdAt = LocalDateTime.now();
        
        user.persist(); // Panache method to save
        return user;
    }
    
    private String hashPassword(String plainText) {
        return BCrypt.hashpw(plainText, BCrypt.gensalt(12));
    }
    
    public boolean verifyPassword(String plainText, String hashedPassword) {
        return BCrypt.checkpw(plainText, hashedPassword);
    }
    
    @Transactional
    public User authenticateUser(String email, String password) {
        User user = User.find("email", email).firstResult();
        if (user == null) {
            return null; // User not found
        }
        
        if (!user.active) {
            return null; // Account disabled
        }
        
        if (!verifyPassword(password, user.password)) {
            return null; // Invalid password
        }
        
        return user;
    }
    
    public String getLoginMessage(User user) {
        if (!user.emailValidated) {
            return "You need to validate your email to access the portal";
        }
        return "Your email is validated. You can access the portal";
    }
    
    @Transactional
    public boolean verifyEmail(String token) {
        User user = User.find("validationToken", token).firstResult();
        if (user == null) {
            return false; // Token not found
        }
        
        if (user.tokenExpiresAt != null && user.tokenExpiresAt.isBefore(LocalDateTime.now())) {
            return false; // Token expired
        }
        
        if (user.emailValidated) {
            return true; // Already validated
        }
        
        // Mark email as validated and clear token
        user.emailValidated = true;
        user.validationToken = null;
        user.tokenExpiresAt = null;
        user.updatedAt = LocalDateTime.now();
        
        return true; // Successfully verified
    }
    
    @Transactional
    public boolean resendVerificationEmail(String email) {
        User user = User.find("email", email).firstResult();
        if (user == null || user.emailValidated) {
            return false; // User not found or already validated
        }
        
        // Generate new token
        user.validationToken = UUID.randomUUID().toString();
        user.tokenExpiresAt = LocalDateTime.now().plusHours(24);
        user.updatedAt = LocalDateTime.now();
        
        return true; // Ready to send new email
    }
    
    public User getUserById(Long id) {
        if (id == null) {
            return null;
        }
        return User.findById(id);
    }
}
