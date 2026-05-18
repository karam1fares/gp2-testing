package com.example.demo.classes;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name="DOCUMENTS")
@NoArgsConstructor
public class Document {
    @Id
    private String documentName;
    @Column(nullable=false)
    private String documentType;
    @Column(nullable=false,unique=true)
    private String documentUrl;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "shipment_referenceNumber", referencedColumnName = "referenceNumber")
    @JsonIgnore
    private Shipment shipment;
    private String content;
    public Document(String documentName, String documentType, Shipment shipment) {
        this.documentName=documentName;
        this.documentType=documentType;
        this.shipment=shipment;
    }
}