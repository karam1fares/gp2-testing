package com.example.demo.services;

import com.example.demo.classes.Document;
import com.example.demo.classes.Shipment;
import com.example.demo.repositories.DocumentRepository;
import com.example.demo.repositories.ShipmentRepository;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class HSCodeAIService {
    //Autowiring via constructor injection
    private final ChatClient chatclient;
    private final DocumentService documentService;
    private final ShipmentRepository shipmentRepo;
    private final ShipmentService shipmentService;

    public HSCodeAIService(ChatClient.Builder builder, @Lazy DocumentService documentService,
                           ShipmentRepository shipmentRepo,
                           ShipmentService shipmentService) {
        this.chatclient = builder.build();
        this.documentService = documentService;
        this.shipmentRepo = shipmentRepo;
        this.shipmentService = shipmentService;

    }

    public String getHSCode(String productName, String description) {
        //exception handling the request to not crash in case of an internal error
        try {
            ChatResponse response = chatclient.prompt()
                    //system prompt
                    .system("""
                            You are an HS Code expert, give me the 11 digit HS code 
                            based on the information on the jordanian customs website,
                            only return the correct code with no explanation""")
                    .user(u -> u.text("Product: {name}, Description: {desc}")//user request
                            .param("name", productName).param("desc", description))
                    .call()
                    .chatResponse();
            // If Gemini blocks the answer, response will be valid but result will be empty
            if (response.getResult() == null || response == null) {
                return "Gemini blocked this response. MetaData: " + response.getMetadata().toString();
            }
            return response.getResult().getOutput().getText();
        } catch (Exception e) {
            // This will print the full error in docker logs
            e.printStackTrace();
            return "Internal Error: " + e.getMessage();
        }
    }

    public String analyze(String referenceNumber){
        Shipment shipment=shipmentRepo.findByReferenceNumber(referenceNumber)
                .orElseThrow(()-> new RuntimeException("Shipment not found"));
        List<Document> docs=shipmentService.searchDocs(referenceNumber);
        List<String> content=new ArrayList<>();
        for(Document d:docs){
            content.add(d.getContent());
        }
        //combine each docs contents into one string
        String combinedContent = String.join("\n", content);
        //no prompt, AI knows what to do
        return this.chatclient.prompt()
                .user(combinedContent)
                .call()
                .content();
    }

    public String validate(List<MultipartFile> docs) {
        List<String> allExtractedTexts = new ArrayList<>();
        for (MultipartFile file : docs) {
            try {
                String rawText = documentService.extractTextFromDocument(file);
                allExtractedTexts.add(rawText);
            } catch (IOException e) {
                System.err.println("Failed to extract text");
            }
        }
            String combinedContent = String.join("\n", allExtractedTexts);
            return this.chatclient.prompt()
                    .user(combinedContent)
                    .call()
                    .content();
        }

      }


