package com.clearsight.spring.repository;

import com.clearsight.spring.entity.Scan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanRepository extends MongoRepository<Scan, String> {
    List<Scan> findByUserIdOrderByCreatedAtDesc(String userId);
}
