package org.rishichirchi.resources;

import org.rishichirchi.dto.requests.LoginRequest;
import org.rishichirchi.dto.requests.SignupRequest;
import org.rishichirchi.dto.responses.LoginResponse;
import org.rishichirchi.dto.responses.SignupResponse;
import org.rishichirchi.entity.User;
import org.rishichirchi.services.EmailService;
import org.rishichirchi.services.UserService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    @Inject
    UserService userService;
    
    @Inject
    EmailService emailService;

    @POST
    @Path("/signup")
    public Response signup(SignupRequest request) {
        System.out.println("Signup request received for email: " + request.email());
        
        try {
            User newUser = userService.createUser(request.email(), request.password());
            System.out.println("User created successfully: " + newUser.email + ", ID: " + newUser.id);
            
            // Send verification email
            System.out.println("Sending verification email to: " + newUser.email + " with token: " + newUser.validationToken);
            emailService.sendVerificationEmail(newUser.email, newUser.validationToken);
            System.out.println("Verification email sent successfully");
            
            SignupResponse response = new SignupResponse(
                newUser.id,
                newUser.email,
                "Please check your email to validate your account",
                true
            );
            
            System.out.println("Returning signup response: " + response.toString());
            return Response.ok(response).build();
        } catch (IllegalArgumentException e) {
            System.out.println("Signup failed - IllegalArgumentException: " + e.getMessage());
            SignupResponse errorResponse = new SignupResponse(
                null,
                request.email(),
                e.getMessage(),
                false
            );
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(errorResponse).build();
        } catch (Exception e) {
            System.out.println("Signup failed - Exception: " + e.getMessage());
            e.printStackTrace();
            SignupResponse errorResponse = new SignupResponse(
                null,
                request.email(),
                "An error occurred during signup",
                false
            );
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(errorResponse).build();
        }
    }

    @POST
    @Path("/login")
    public Response login(LoginRequest request){
        System.out.println("Login request received for email: " + request.email());
        
        User user = userService.authenticateUser(request.email(), request.password());
        System.out.println("Authentication result: " + (user != null ? "SUCCESS" : "FAILED"));

        if (user == null) {
            System.out.println("Login failed - invalid credentials for: " + request.email());
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Invalid credentials").build();
        }

        String loginMessage = userService.getLoginMessage(user);
        System.out.println("Login successful for user: " + user.email + ", emailValidated: " + user.emailValidated);
        
        LoginResponse response = new LoginResponse(
            user.id,
            user.email,
            user.emailValidated,
            loginMessage,
            true
        );
        
        System.out.println("Returning login response: " + response.toString());
        return Response.ok(response).build();
    }

    @GET
    @Path("/verify")
    public Response verifyEmail(@QueryParam("token") String token) {
        if (token == null || token.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Verification token is required").build();
        }

        boolean isVerified = userService.verifyEmail(token);
        
        if (isVerified) {
            return Response.ok()
                    .entity("Email verified successfully! You can now access the portal.")
                    .build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Invalid or expired verification token")
                    .build();
        }
    }

    @POST
    @Path("/resend-verification")
    public Response resendVerification(@QueryParam("email") String email) {
        System.out.println("Resend verification request received");
        System.out.println("Email parameter: " + email);
        
        if (email == null || email.trim().isEmpty()) {
            System.out.println("Email is null or empty");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Email is required").build();
        }

        System.out.println("Attempting to resend verification for email: " + email);
        boolean canResend = userService.resendVerificationEmail(email);
        System.out.println("Can resend result: " + canResend);
        
        if (canResend) {
            // Get user to send email with new token
            User user = User.find("email", email).firstResult();
            System.out.println("Found user for resend: " + (user != null ? user.email : "null"));
            
            if (user != null) {
                System.out.println("Sending verification email to: " + user.email + " with token: " + user.validationToken);
                emailService.sendVerificationEmail(user.email, user.validationToken);
                System.out.println("Verification email sent successfully");
            }
            
            return Response.ok()
                    .entity("Verification email sent successfully")
                    .build();
        } else {
            System.out.println("Cannot resend - user not found or already verified");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("User not found or already verified")
                    .build();
        }
    }

    @GET
    @Path("/validate/{userId}")
    public Response validateUser(@PathParam("userId") Long userId) {
        System.out.println("Validating user with ID: " + userId);
        
        if (userId == null) {
            System.out.println("User ID is null");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("User ID is required").build();
        }

        User user = userService.getUserById(userId);
        System.out.println("Found user: " + (user != null ? user.email : "null"));
        
        if (user == null) {
            System.out.println("User not found for ID: " + userId);
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("User not found").build();
        }

        // Return current user data for session validation
        LoginResponse response = new LoginResponse(
            user.id,
            user.email,
            user.emailValidated,
            "User validated",
            true
        );
        
        System.out.println("Returning user data: " + user.email + ", emailValidated: " + user.emailValidated);
        return Response.ok(response).build();
    }
}
