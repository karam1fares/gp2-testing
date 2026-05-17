"use client";
import MainStructure from "../components/MainStructure"; 
import "./page.css";
import ContentTitle from "../components/ContentTitle";
import Image from "next/image";
import ShipmentsCard from "../components/ShipmentsCard";
import { useState ,useEffect, useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import Swal from "sweetalert2";
const Shipments = () => {
    const { t } = useContext(LanguageContext);
    const [allShipments, setAllShipments] = useState([
        {
            shipmentName: "Create Shipment",
            referenceNumber: "shipment reference number",
            status: "Shipment Status",
        }
    ]);

    useEffect(() => {
        const fetchShipments = async () => {
            try {
                const response = await fetch("http://localhost:8080/jamrik/shipments/searchAll"); 
                
                if (response.ok) {
                    const data = await response.json();
                    setAllShipments(data);
                } else {
                    console.error("Failed to fetch shipments");
                }
            } catch (error) {
                console.error("Connection error:", error);
            }
        };

        fetchShipments();
    }, []);

    const [clickedShipmentData, setClickedShipmentData] = useState(
        {
            shipmentName: allShipments[0].shipmentName,
            referenceNumber: allShipments[0].referenceNumber,
            status: allShipments[0].status,
        }
    );
    const handleShipmentClick = (referenceNumber: string) => {
        const clickedShipment = allShipments.find(shipment => shipment.referenceNumber === referenceNumber);
        if (clickedShipment) {
            setClickedShipmentData(clickedShipment);
        }
    };
    const handleDeleteShipment = async (referenceNumber: string) => {
    const result = await Swal.fire({
        title: t("Are you sure you want to delete this shipment?"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ad0000",
        confirmButtonText: "Yes, delete it" 
    });
    
    if (result.isConfirmed) {
        try {
            const url = `http://localhost:8080/jamrik/shipments/deleteShipment?referenceNumber=${referenceNumber}`;
            
            const response = await fetch(url, {
                method: "DELETE",
            });

            if (response.ok) {
                setAllShipments(prev => prev.filter(s => s.referenceNumber !== referenceNumber));
                Swal.fire({ text: t("Shipment deleted successfully."), icon: "success" });
            } else {
                const error = await response.text();
                Swal.fire({ text: t("Delete failed: ") + error, icon: "error" });
            }
        } catch (error) {
            console.error("Connection error:", error);
            Swal.fire({ text: t("Could not connect to the server."), icon: "error" });
        }
    }
};
    const [allDocuments, setAllDocuments] = useState<any[]>([]);

    const fetchDocuments = async () => {
    if (!clickedShipmentData?.referenceNumber) return;
    try {
        const url = `http://localhost:8080/jamrik/shipments/searchAllDocs?referenceNumber=${clickedShipmentData.referenceNumber}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            setAllDocuments(Array.isArray(data) ? data : [data]);
        } else {
            console.error("Failed to fetch documents");
            setAllDocuments([]);
        }
    } catch (error) {
        console.error("Connection error:", error);
        setAllDocuments([]);
    }
};
useEffect(() => {
    fetchDocuments();
}, [clickedShipmentData?.referenceNumber]);

    const handleDeleteDocument = async (documentName: string) => {
        const result = await Swal.fire({
            title: t("Are you sure you want to delete this document?"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ad0000",
            confirmButtonText: t("Yes, delete it")
        });

        if (result.isConfirmed) {
            try {
                const url = `http://localhost:8080/jamrik/documents/delete/${encodeURIComponent(clickedShipmentData.referenceNumber)}?documentName=${encodeURIComponent(documentName)}`;
                const response = await fetch(url, { method: "DELETE" });

                if (response.ok) {
                    setAllDocuments(prev => prev.filter(doc => doc.documentName !== documentName));
                    Swal.fire({ text: t("Document deleted successfully."), icon: "success" });
                } else {
                    const error = await response.text();
                    Swal.fire({ text: t("Delete failed: ") + error, icon: "error" });
                }
            } catch (error) {
                console.error("Connection error:", error);
                Swal.fire({ text: t("Could not connect to the server."), icon: "error" });
            }
        }
    };
    const handleAddDocument = (shipmentReference: string) => {
    Swal.fire({
        title: t("Add Document"),
        html: `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <input type="text" id="documentName" class="swal2-input" placeholder="${t("Document Name")}">
            <select id="documentType" class="swal2-input" style="margin-top: 8px; width: 260px;">
                <option value="" disabled selected>${t("Select Document Type")}</option>
                <option value="Commercial Invoice">${t("Commercial Invoice")}</option>
                <option value="Packing List">${t("Packing List")}</option>  
                <option value="Bill of Lading">${t("Bill of Lading")}</option>
                <option value="Certificate of Origin">${t("Certificate of Origin")}</option>
                <option value="Other">${t("Other")}</option>
            </select>
            <input type="file" id="documentFile" class="swal2-file" style="width: 260px; margin-top: 8px;">
        </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: t("Upload"),
        cancelButtonText: t("Cancel"),
        showLoaderOnConfirm: true, // Enables standard SweetAlert loading spinner
        
        preConfirm: async () => {
            const documentName = (document.getElementById("documentName") as HTMLInputElement).value;
            const documentType = (document.getElementById("documentType") as HTMLSelectElement).value;
            const documentFileInput = document.getElementById("documentFile") as HTMLInputElement;
            const documentFile = documentFileInput.files ? documentFileInput.files[0] : null;

            // 1. Validation Check
            if (!documentName || !documentType || !documentFile) {
                Swal.showValidationMessage(t("Please fill in all fields and select a file"));
                return false;
            }

            // 2. Pack everything cleanly into a Multipart FormData payload
            const formData = new FormData();
            formData.append("file", documentFile);
            formData.append("fileName", documentName);
            formData.append("fileType", documentType);

            try {
                // 3. Make the API Call to your Spring Boot uploadOne route
                const response = await fetch(`http://localhost:8080/jamrik/documents/uploadOne/${encodeURIComponent(shipmentReference)}`, {
                    method: "POST",
                    body: formData, // Passing formData automatically sets content-type to multipart/form-data
                });

                if (!response.ok) {
                    throw new Error("Failed to upload document");
                }

                return await response.json(); // Pass server response down to the .then() block
            } catch (error) {
                Swal.showValidationMessage(`${t("Upload failed")}: ${error instanceof Error ? error.message : error}`);
                return false;
            }
        },
        allowOutsideClick: () => !Swal.isLoading() // Prevents closing the modal mid-upload
    }).then((result) => {
        // 4. Handle Final UI Success Notification
        if (result.isConfirmed) {
            Swal.fire({
                icon: "success",
                title: t("Uploaded!"),
                text: t("Your document has been processed and saved successfully."),
                confirmButtonColor: "#3085d6"
            });
            fetchDocuments();
            // Pro-Tip: Call your data refreshing hook/function here if you want 
            // the shipment's document list view to update automatically on the page!
        }
    });
};
const [aiResultContent, setAiResultContent] = useState(t("AI analysis results will appear here after you analyze the documents."));
const handleAnalyzeDocuments = async () => {
    // 1. Safety Guard: Check if a valid shipment is actively selected
    if (!clickedShipmentData?.referenceNumber || clickedShipmentData.referenceNumber === "shipment reference number") {
        Swal.fire({
            text: t("Please select a valid shipment from the tracking list first."),
            icon: "warning"
        });
        return;
    }

    // 2. Safety Guard: Check if the shipment actually has documents attached to analyze
    if (allDocuments.length === 0) {
        Swal.fire({
            text: t("This shipment has no uploaded documents to analyze. Please add documents first."),
            icon: "warning"
        });
        return;
    }

    // 3. Update UI to a processing state and open the loading blocker overlay
    setAiResultContent(t("Analyzing documents... Please wait."));
    
    Swal.fire({
        title: t("Analyzing Clearance Manifests"),
        text: t("Running cross-document consistency checks and HS code validation..."),
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading(); // Native SweetAlert spinner loader
        }
    });

    try {
        // 4. Construct URL targeted directly at your shipment's reference ID
        const url = `http://localhost:8080/jamrik/codes/analyzeDocs/${encodeURIComponent(clickedShipmentData.referenceNumber)}`;
        
        const response = await fetch(url, {
            method: "GET" // Using GET since backend mapping is GetMapping
        });

        if (!response.ok) {
            throw new Error(t("The AI analysis engine encountered an unexpected error."));
        }

        // 5. Read the response payload (Assuming your backend returns a JSON object with an 'analysis' field)
        const data = await response.json();
        
        Swal.close(); // Turn off loading overlay

        // 6. Bind the string response data right into your UI state text container
        // Fits dynamically into: {aiResultContent} inside your return template block
        setAiResultContent(data.analysis || JSON.stringify(data));


    } catch (error) {
        Swal.close();
        const fallbackErrorMessage = error instanceof Error ? error.message : t("Could not communicate with the analysis server.");
        
        // Reset state back to a clean alert if the backend drops/fails
        setAiResultContent(t("Failed to run analysis. Check connection protocols."));
        
        Swal.fire({
            title: t("Engine Failure"),
            text: fallbackErrorMessage,
            icon: "error"
        });
    }
};
    return (
        <MainStructure>
        <div className="ShipmentsContainer">
            <ContentTitle title={t("Shipment Tracking")} subTitle={t("View and manage your shipments")} />
            <div style={{gap: "16px", display: "flex", flexDirection: "row", flexWrap: "wrap", margin:"16px 0px"}}>
            <div className="allShipmentsTableContainer">
                <div >
                <p className="allShipmentsTittle">{t("All Shipments")}</p>
                <p className="allShipmentsNumber">{allShipments.length} {t("shipments")}</p>
                </div>

                <hr/>
                {allShipments.map((shipment) => (
                    <ShipmentsCard 
                        key={shipment.referenceNumber}
                        shipmentName={shipment.shipmentName}
                        referenceNumber={shipment.referenceNumber}
                        status={shipment.status}
                        handleClick={() => handleShipmentClick(shipment.referenceNumber)}
                        handleDeleteShipment={() => handleDeleteShipment(shipment.referenceNumber)}
                    />
                ))}
            </div>
            <div className="selectedShipmentContainer">
                <ShipmentsCard 
                    shipmentName={clickedShipmentData.shipmentName}
                    referenceNumber={clickedShipmentData.referenceNumber}
                    status={clickedShipmentData.status}
                    isSelected={true}
                    handleClick={() => {}}
                    handleDeleteShipment={() => handleDeleteShipment(clickedShipmentData.referenceNumber)}
                />
                <div className="selectedShipmentUploadedDocumentsContainer">
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                <p className="uploadedDocumentsTitle">{t("Uploaded Documents")}</p>
                <button className="addDocumentButton" onClick={()=>handleAddDocument(clickedShipmentData.referenceNumber)}>
               {t("Add Document")}
                </button>
                </div>
                     <div className="uploadedFilesList">
              {allDocuments.map((doc, index) => (
              <div key={`${doc.documentName}-${index}`} className="uploadedFileCard">
                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start",  padding: "8px 0px 8px 8px"}}>
              <span className="fileNameText">{doc.documentType || "Document"}:</span><span> {doc.documentName}</span>
                </div>
              <button 
                className="removeFileBtn" 
                onClick={() => handleDeleteDocument(doc.documentName)}
              >
                ✖️
              </button>
            </div>
           ))}
           
            </div>
                </div>
                <div className="AiResultsContainer">
                <p className="aiResultsTitle">{t("AI Analysis Results")}</p>
                <div className="aiResultsContent">
                    {aiResultContent}
                </div>
                </div>

                <div className="ShipmentBtnsContainer">
                <button className="analyzeShipmentDocumentsButton" onClick={handleAnalyzeDocuments}>
                    {t("Analyze Documents")}
                </button>
                <button className="generateFormButton">{t("Generate Customs Declaration Form")}</button>
                </div>
            </div>
        </div>
        </div>
      </MainStructure>
    );
}
export default Shipments;