package com.example.demo.controllers;

import com.example.demo.DTOs.ShipmentDTO;
import com.example.demo.classes.Document;
import com.example.demo.classes.Shipment;
import com.example.demo.services.ShipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/jamrik/shipments")
public class ShipmentController {
    private final ShipmentService shipmentService;
    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping("/newShipment")
    public Shipment createNewShipment(@RequestBody ShipmentDTO sDTO,
                                      Authentication auth){
        return shipmentService.createNewShipment(sDTO,auth.getName());
    }
    @PostMapping("/changeStatus/{referenceNumber}")
    public Shipment changeShipmentStatus(@PathVariable String referenceNumber,
                                         @RequestParam String status){
        return shipmentService.setShipmentStatus(referenceNumber,status);
    }
    @GetMapping("/searchShipment")
    public Optional<Shipment> searchShipment(@RequestParam String ReferenceNumber){
        return shipmentService.search(ReferenceNumber);
    }
    @DeleteMapping("/deleteShipment")
    public Shipment deleteShipment(@RequestParam String referenceNumber){
        return shipmentService.delete(referenceNumber);
    }
    @GetMapping("/searchAll")
    public List<Shipment> searchAll(){
        return shipmentService.searchAll();
    }
    @GetMapping("/searchAllDocs")
    public List<Document> searchAllDocuments(@RequestParam String referenceNumber){
        return shipmentService.searchDocs(referenceNumber);
    }

}
