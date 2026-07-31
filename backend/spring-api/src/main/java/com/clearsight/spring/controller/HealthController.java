package com.clearsight.spring.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("api is live");
    }
}
