package com.example.demo.repositories;
import com.example.demo.classes.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document,String> {
    Optional<Document> findByDocumentName(String referenceNumber,String documentName);
    @Query("SELECT d FROM Document d WHERE d.shipment.referenceNumber = :refNum")
    List<Document> findByReferenceNumber(String referenceNumber);

}
