package com.clearsight.spring.dto;

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
public class ClinicalReportResponseDto {
    private String prediction;

    @JsonProperty("confidence_percentage")
    private Double confidencePercentage;

    private String report;
    private String summary;
    private List<SourceChunkDto> sources;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SourceChunkDto {
        private String title;
        private String source;
        private Integer chunkIndex;
        private String excerpt;
        private Double score;
    }
}
