package com.clearsight.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanResponseDto {
    private String id;
    private String userId;
    private String originalFilename;
    private String diagnosis;
    private Double confidence;
    private Boolean isPathological;
    private String riskLevel;
    private String recommendation;
    private String pipelineJson;
    private LocalDateTime createdAt;
}
