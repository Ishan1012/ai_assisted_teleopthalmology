package com.clearsight.spring.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "scans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scan {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String originalFilename;

    private String diagnosis;

    private Double confidence;

    private Boolean isPathological;

    private String riskLevel;

    private String recommendation;

    private String pipelineJson;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
