package com.donation.report.donation_system.controller;

import com.donation.report.donation_system.entity.User;
import com.donation.report.donation_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow your JS frontend to connect
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // LOGIN
    @PostMapping("/login")
    public Map<String,Object> loginUser(@RequestBody Map<String,String> payload) {
        Map<String,Object> response = new HashMap<>();
        String username = payload.get("username");
        String password = payload.get("password");

        User user = userRepository.findByUsername(username);
        if(user != null && user.getPassword().equals(password)) {
            response.put("success", true);
            response.put("message", "Login successful!");
        } else {
            response.put("success", false);
            response.put("message", "Invalid username or password");
        }
        return response;
    }

    // SIGNUP
    @PostMapping("/signup")
    public Map<String,Object> signupUser(@RequestBody Map<String,String> payload) {
        Map<String,Object> response = new HashMap<>();
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        if(userRepository.findByUsername(username) != null) {
            response.put("success", false);
            response.put("message", "Username already exists");
            return response;
        }
        if(userRepository.findByEmail(email) != null) {
            response.put("success", false);
            response.put("message", "Email already exists");
            return response;
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Signup successful!");
        return response;
    }
}
