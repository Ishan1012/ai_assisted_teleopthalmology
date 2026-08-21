package com.clearsight.spring.controller;

import com.clearsight.spring.dto.ScanResponseDto;
import com.clearsight.spring.dto.ScreeningResponseDto;
import com.clearsight.spring.entity.Scan;
import com.clearsight.spring.entity.User;
import com.clearsight.spring.repository.ScanRepository;
import com.clearsight.spring.repository.UserRepository;
import com.clearsight.spring.service.FastApiClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scans")
public class ScanController {

    private final ScanRepository scanRepository;
    private final UserRepository userRepository;
    private final FastApiClientService fastApiClientService;

    public ScanController(ScanRepository scanRepository,
                          UserRepository userRepository,
                          FastApiClientService fastApiClientService) {
        this.scanRepository = scanRepository;
        this.userRepository = userRepository;
        this.fastApiClientService = fastApiClientService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadScan(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
        }

        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        ScreeningResponseDto screeningResult = fastApiClientService.screenScan(file);
        screeningResult.populateDerivedFields();

        String pipelineJsonStr = null;
        if (screeningResult.getPipelineJson() != null) {
            pipelineJsonStr = screeningResult.getPipelineJson().toString();
        }

        Scan scan = Scan.builder()
                .userId(currentUser.getId())
                .originalFilename(file.getOriginalFilename())
                .diagnosis(screeningResult.getDiagnosis())
                .confidence(screeningResult.getConfidence())
                .isPathological(screeningResult.getIsPathological())
                .riskLevel(screeningResult.getRiskLevel())
                .recommendation(screeningResult.getRecommendation())
                .pipelineJson(pipelineJsonStr)
                .build();

        Scan savedScan = scanRepository.save(scan);

        return ResponseEntity.ok(mapToScanResponseDto(savedScan));
    }

    @PostMapping("/report")
    public ResponseEntity<?> generateReport(@org.springframework.web.bind.annotation.RequestBody com.clearsight.spring.dto.ReportRequestDto requestDto) {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        com.clearsight.spring.dto.ClinicalReportResponseDto reportResponse = fastApiClientService.generateReport(requestDto);
        return ResponseEntity.ok(reportResponse);
    }

    @GetMapping
    public ResponseEntity<?> getUserScans() {
        User currentUser = getCurrentAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        List<Scan> scans = scanRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        List<ScanResponseDto> dtos = scans.stream()
                .map(this::mapToScanResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }

        String email = authentication.getName();
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.orElse(null);
    }

    private ScanResponseDto mapToScanResponseDto(Scan scan) {
        return ScanResponseDto.builder()
                .id(scan.getId())
                .userId(scan.getUserId())
                .originalFilename(scan.getOriginalFilename())
                .diagnosis(scan.getDiagnosis())
                .confidence(scan.getConfidence())
                .isPathological(scan.getIsPathological())
                .riskLevel(scan.getRiskLevel())
                .recommendation(scan.getRecommendation())
                .pipelineJson(scan.getPipelineJson())
                .createdAt(scan.getCreatedAt())
                .build();
    }
}
