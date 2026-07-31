package com.clearsight.spring.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ScreeningResponseDto {

    @JsonAlias({"prediction", "diagnosis"})
    private String diagnosis;

    @JsonAlias({"glaucoma_probability", "confidence_percentage", "confidence"})
    private Double confidence;

    @JsonProperty("is_pathological")
    @JsonAlias({"is_pathological", "isPathological"})
    private Boolean isPathological;

    @JsonProperty("risk_level")
    @JsonAlias({"risk_level", "riskLevel"})
    private String riskLevel;

    private String recommendation;

    @JsonAlias({"pipeline", "pipelineJson"})
    private Object pipelineJson;

    public void populateDerivedFields() {
        if (diagnosis == null && recommendation != null) {
            if (recommendation.toUpperCase().contains("HIGH RISK") || recommendation.toUpperCase().contains("GLAUCOMA")) {
                diagnosis = "Glaucoma Indicated";
            } else {
                diagnosis = "Normal / Control";
            }
        }
        if (isPathological == null && diagnosis != null) {
            isPathological = diagnosis.toLowerCase().contains("glaucoma");
        }
        if (riskLevel == null) {
            if (Boolean.TRUE.equals(isPathological)) {
                riskLevel = "High Risk";
            } else {
                riskLevel = "Low Risk";
            }
        }
        if (confidence == null) {
            confidence = Boolean.TRUE.equals(isPathological) ? 0.898 : 0.95;
        }
    }
}
