"use client";
import MainStructure from "../components/MainStructure"; 
import "./page.css";
import ContentTitle from "../components/ContentTitle";
import Image from "next/image";
import ShipmentsCard from "../components/ShipmentsCard";
import { useState ,useEffect, useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import { toast } from "sonner";
import Button from "../components/Button"; // Or simply use native buttons
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
                const response = await fetch("http://localhost:8080/jamrik/shipments/searchAll", { credentials: "include" }); 
                
                if (response.ok) {
                    const data = await response.json();
                    setAllShipments(data);
                    if (data && data.length > 0) {
                        setClickedShipmentData(data[0]);
                    }
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
    if (window.confirm(t("Are you sure you want to delete this shipment?"))) {
        const toastId = toast.loading(t("Deleting shipment..."));
        try {
            const url = `http://localhost:8080/jamrik/shipments/deleteShipment?referenceNumber=${referenceNumber}`;
            
            const response = await fetch(url, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                setAllShipments(prev => prev.filter(s => s.referenceNumber !== referenceNumber));
                toast.success(t("Shipment deleted successfully."), { id: toastId });
            } else {
                const error = await response.text();
                toast.error(t("Delete failed: ") + error, { id: toastId });
            }
        } catch (error) {
            console.error("Connection error:", error);
            toast.error(t("Could not connect to the server."), { id: toastId });
        }
    }
};
    const [allDocuments, setAllDocuments] = useState<any[]>([]);

    const fetchDocuments = async () => {
    if (!clickedShipmentData?.referenceNumber) return;
    try {
        const url = `http://localhost:8080/jamrik/shipments/searchAllDocs?referenceNumber=${clickedShipmentData.referenceNumber}`;
        const response = await fetch(url, { credentials: "include" });
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
        if (window.confirm(t("Are you sure you want to delete this document?"))) {
            const toastId = toast.loading(t("Deleting document..."));
            try {
                const url = `http://localhost:8080/jamrik/documents/delete/${encodeURIComponent(clickedShipmentData.referenceNumber)}?documentName=${encodeURIComponent(documentName)}`;
                const response = await fetch(url, { method: "DELETE", credentials: "include" });

                if (response.ok) {
                    setAllDocuments(prev => prev.filter(doc => doc.documentName !== documentName));
                    toast.success(t("Document deleted successfully."), { id: toastId });
                } else {
                    const error = await response.text();
                    toast.error(t("Delete failed: ") + error, { id: toastId });
                }
            } catch (error) {
                console.error("Connection error:", error);
                toast.error(t("Could not connect to the server."), { id: toastId });
            }
        }
    };
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadShipmentReference, setUploadShipmentReference] = useState("");
    const [uploadFileName, setUploadFileName] = useState("");
    const [uploadFileType, setUploadFileType] = useState("");
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const handleAddDocument = (shipmentReference: string) => {
        setUploadShipmentReference(shipmentReference);
        setUploadFileName("");
        setUploadFileType("");
        setUploadFile(null);
        setIsUploadModalOpen(true);
    };

    const handleCustomUpload = async () => {
        if (!uploadFileName || !uploadFileType || !uploadFile) {
            toast.warning(t("Please fill in all fields and select a file"));
            return;
        }
        if (uploadFile.size > 10 * 1024 * 1024) {
            toast.warning(t("Please upload a file smaller than 10MB"));
            return;
        }
        const fileName = uploadFile.name.toLowerCase();
        if (!fileName.endsWith(".pdf") && !fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
            toast.warning(t("Please upload PDF or Word files only"));
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("fileName", uploadFileName);
        formData.append("fileType", uploadFileType);

        const toastId = toast.loading(t("Uploading document..."));
        try {
            const response = await fetch(`http://localhost:8080/jamrik/documents/uploadOne/${encodeURIComponent(uploadShipmentReference)}`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to upload document");
            }
            toast.success(t("Your document has been processed and saved successfully."), { id: toastId });
            setIsUploadModalOpen(false);
            fetchDocuments();
        } catch (error) {
            toast.error(`${t("Upload failed")}: ${error instanceof Error ? error.message : error}`, { id: toastId });
        }
    };
const [aiResultContent, setAiResultContent] = useState(t("AI analysis results will appear here after you analyze the documents."));
const handleAnalyzeDocuments = async () => {
    // 1. Safety Guard: Check if a valid shipment is actively selected
    if (!clickedShipmentData?.referenceNumber || clickedShipmentData.referenceNumber === "shipment reference number") {
        toast.warning(t("Please select a valid shipment from the tracking list first."));
        return;
    }

    // 2. Safety Guard: Check if the shipment actually has documents attached to analyze
    if (allDocuments.length === 0) {
        toast.warning(t("This shipment has no uploaded documents to analyze. Please add documents first."));
        return;
    }

    // 3. Update UI to a processing state and open the loading blocker overlay
    setAiResultContent(t("Analyzing documents... Please wait."));
    
    const toastId = toast.loading(t("Running cross-document consistency checks and HS code validation..."));

    try {
        // 4. Construct URL targeted directly at your shipment's reference ID
        const url = `http://localhost:8080/jamrik/codes/analyzeDocs/${encodeURIComponent(clickedShipmentData.referenceNumber)}`;
        
        const response = await fetch(url, {
            method: "GET", // Using GET since backend mapping is GetMapping
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(t("The AI analysis engine encountered an unexpected error."));
        }

        // Backend returns a plain string result for analysis; read as text
        const text = await response.text();
        
        toast.success(t("Analysis complete!"), { id: toastId });

        // Bind the string response data into the UI state
        setAiResultContent(text);

    } catch (error) {
        const fallbackErrorMessage = error instanceof Error ? error.message : t("Could not communicate with the analysis server.");
        
        // Reset state back to a clean alert if the backend drops/fails
        setAiResultContent(t("Failed to run analysis. Check connection protocols."));
        
        toast.error(fallbackErrorMessage, { id: toastId });
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

        {/* Custom Document Upload Modal */}
        {isUploadModalOpen && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "10px", width: "400px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1C398E", margin: 0 }}>{t("Add Document")}</h2>
                    <input 
                        type="text" 
                        placeholder={t("Document Name")} 
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
                    />
                    <select 
                        value={uploadFileType}
                        onChange={(e) => setUploadFileType(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%" }}
                    >
                        <option value="" disabled>{t("Select Document Type")}</option>
                        <option value="Commercial Invoice">{t("Commercial Invoice")}</option>
                        <option value="Packing List">{t("Packing List")}</option>  
                        <option value="Bill of Lading">{t("Bill of Lading")}</option>
                        <option value="Certificate of Origin">{t("Certificate of Origin")}</option>
                        <option value="Other">{t("Other")}</option>
                    </select>
                    <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        style={{ width: "100%" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button 
                            onClick={() => setIsUploadModalOpen(false)}
                            style={{ padding: "10px 20px", backgroundColor: "#ccc", color: "#333", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {t("Cancel")}
                        </button>
                        <button 
                            onClick={handleCustomUpload}
                            style={{ padding: "10px 20px", backgroundColor: "#1C398E", color: "#fff", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {t("Upload")}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </MainStructure>
    );
}
export default Shipments;