package com.example.demo.controllers;
import com.example.demo.DTOs.DocumentMetadata;
import com.example.demo.classes.Document;
import com.example.demo.services.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

//this controller is solely responsible for file uploads, and other file related features
@RestController
//is the url correct or is it just part of the shipments?
@RequestMapping("/jamrik/documents")
public class DocumentController {
    private final DocumentService documentService;
    public DocumentController(DocumentService documentService){
        this.documentService = documentService;
    }
    @PostMapping(value="/upload/{referenceNumber}",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocuments(@PathVariable String referenceNumber,
                                @RequestPart("files") List<MultipartFile> files,
                                @RequestPart("metadata") List<DocumentMetadata> metadata) {
        if (files.isEmpty()) {
           return ResponseEntity.badRequest().body("Please upload at leat 1 document.");
        }
        documentService.processAndSaveDocument(referenceNumber,files,metadata);
        return ResponseEntity.ok("processing started for documents.");
    }
    @DeleteMapping("/delete/{referenceNumber}")
    public ResponseEntity<?> deleteDocument(@PathVariable String referenceNumber
            ,@RequestParam String documentName){
         documentService.deleteDocument(referenceNumber,documentName);
         return ResponseEntity.noContent().build();
    }
    @GetMapping("/searchDocument/{referenceNumber}")
    public Optional<Document> searchDocument(@PathVariable String referenceNumber
            ,@RequestParam String documentName){
        return documentService.search(referenceNumber,documentName);
    }
    @PostMapping(value="/uploadOne/{referenceNumber}",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadOneDocument(@PathVariable String referenceNumber,
                                              @RequestParam("file") MultipartFile file,
                                               @RequestParam String fileName,
                                               @RequestParam String fileType){
        return documentService.uploadOneDoc(referenceNumber,file,fileName,fileType);


    }

}