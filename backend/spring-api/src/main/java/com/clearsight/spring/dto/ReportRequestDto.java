package com.clearsight.spring.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportRequestDto {
    private String prediction;

    @JsonProperty("glaucoma_probability")
    @JsonAlias({"glaucoma_probability", "confidence"})
    private Double glaucomaProbability;

    @JsonProperty("confidence_percentage")
    @JsonAlias({"confidence_percentage", "confidencePercentage"})
    private Double confidencePercentage;

    @JsonProperty("is_pathological")
    @JsonAlias({"is_pathological", "isPathological"})
    private Boolean isPathological;

    @JsonProperty("cup_to_disc_ratio_summary")
    @JsonAlias({"cup_to_disc_ratio_summary", "cupToDiscRatioSummary"})
    private String cupToDiscRatioSummary;

    private String recommendation;

    @JsonProperty("reduced_features")
    private List<Double> reducedFeatures;

    @JsonProperty("rule_firing_strengths")
    private List<Double> ruleFiringStrengths;

    @JsonProperty("membership_degrees")
    private List<List<Double>> membershipDegrees;

    @JsonProperty("patient_age")
    private Integer patientAge;

    @JsonProperty("patient_notes")
    private String patientNotes;
}
