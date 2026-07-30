package com.clearsight.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningResponseDto {
    private String diagnosis;
    private Double confidence;
    private Boolean isPathological;
    private String riskLevel;
    private String recommendation;
    private String pipelineJson;
}
