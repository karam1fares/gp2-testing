"use client";
import "./page.css";
import MainStructure from "../components/MainStructure";
import ContentTitle from "../components/ContentTitle";
import {useRef, useState, useContext } from "react";
import DocumentsCard from "../components/DocumentsCard";
import { useRouter } from "next/navigation";
import LogInInputs from "../components/LogInInputs";
import { LanguageContext } from "../components/LanguageContext";
import { toast } from "sonner";

type UploadedDocs = {
  [key: string]: File[];
};
const NewShipment = () => {
  const { t } = useContext(LanguageContext);
  const [allDocuments, setAllDocuments] = useState<UploadedDocs>({
    "Commercial Invoice": [],
    "Certificate of Origin": [],
    "Airway Bill": [],
    "Packing List": [],
    "Proforma Invoice": [],
  });

  const [activeType, setActiveType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadTrigger = (docType: string) => {
    setActiveType(docType);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && activeType) {
      const selectedFile = files[0];

      if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error(t("Please upload a file smaller than 10MB"));
          e.target.value = "";
          return;
      }
      
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith(".pdf") && !fileName.endsWith(".doc") && !fileName.endsWith(".docx")) {
          toast.error(t("Please upload PDF or Word files only"));
          e.target.value = "";
          return;
      }

      setAllDocuments(prev => ({
        ...prev,
        [activeType]: [...prev[activeType], selectedFile]
      }));

      e.target.value = "";
    }
  };

  const cardData = [
    { name: "Commercial Invoice", desc: "Standard commercial invoice", icon: "/icons/CommercialInvoice.png" },
    { name: "Certificate of Origin", desc: "Proof of goods origin", icon: "/icons/CertificateOfOrigin.png" },
    { name: "Airway Bill", desc: "Air freight document", icon: "/icons/AirwayBill.png" },
    { name: "Packing List", desc: "Detailed packing info", icon: "/icons/PackingList.png" },
    { name: "Proforma Invoice", desc: "Preliminary bill of sale", icon: "/icons/ProformaInvoice.png" },
  ];

  const removeFile = (docName: string, fileIndex: number) => {
  setAllDocuments(prev => ({
    ...prev,
    [docName]: prev[docName].filter((_, index) => index !== fileIndex)
  }));
};
const shipmentNameRef = useRef<HTMLInputElement>(null);
const shipmentReferenceNumberRef = useRef<HTMLInputElement>(null);
const shipmentStatusRef = useRef<HTMLDivElement>(null);
const [shipmentData, setShipmentData] = useState({
  shipmentName: "",
  shipmentReferenceNumber: "",
  shipmentStatus: ""
});
const handleDataChange = () => {  
  setShipmentData({
    shipmentName: shipmentNameRef.current ? shipmentNameRef.current.value : "",
    shipmentReferenceNumber: shipmentReferenceNumberRef.current ? shipmentReferenceNumberRef.current.value : "",
    shipmentStatus: shipmentStatusRef.current ? (shipmentStatusRef.current.querySelector('input[name="shipmentStatusGroup"]:checked') as HTMLInputElement)?.value || "In Progress" : "In Progress",
  });
};
const [createShipmentPressed, setCreateShipmentPressed] = useState(false);
const router = useRouter();
const handleSubmit1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalFiles = Object.values(allDocuments).flat().length;
    if (totalFiles === 0) {
        toast.error(t("Please upload at least one document before creating the shipment."));
        return;
    }else{setCreateShipmentPressed(!createShipmentPressed);}
       
};
const handleSubmit2 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shipmentData.shipmentName || !shipmentData.shipmentReferenceNumber || !shipmentData.shipmentStatus) {
        toast.error(t("Please fill in all shipment details before submitting."));
        return;
    }

    const toastId = toast.loading(t("Creating shipment..."));
    try {
        const response = await fetch(`http://localhost:8080/jamrik/shipments/newShipment`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                shipmentName: shipmentData.shipmentName,
                referenceNumber: shipmentData.shipmentReferenceNumber,
                status: shipmentData.shipmentStatus,
            })
        });

        if (response.redirected) {
             toast.error(t("Please log in to create shipments."), { id: toastId });
             router.push("/loginpage");
             return;
        }

        if (response.ok) {
            await response.json();            
            
            const success = await handleFileUploadsForCreatingShipment(allDocuments, shipmentData.shipmentReferenceNumber);
            
            if (success) {
              toast.success(t("Shipment created successfully!"), { id: toastId });
              router.push("/shipments");
            } else {
              toast.error(t("Shipment created, but documents failed to upload."), { id: toastId });
              router.push("/shipments");
            }
        } else {
            try {
                const errorData = await response.json();
                toast.error(errorData.error || t("Failed to create shipment."), { id: toastId });
            } catch {
                const errorText = await response.text();
                toast.error(errorText || t("Failed to create shipment."), { id: toastId });
            }
        }
    } catch (error) {
        console.error("Connection error:", error);
        toast.error(t("Could not connect to the server."), { id: toastId });
    }
};

const handleFileUploadsForCreatingShipment = async (documents: UploadedDocs, shipmentId: string) => {
    try {
        const url = `http://localhost:8080/jamrik/documents/upload/${encodeURIComponent(shipmentId)}`;

        const formData = new FormData();
        const metadata: { name: string; type: string }[] = [];

        // Append each file under the single key 'files' and build metadata array
        Object.entries(documents).forEach(([docType, fileArray]) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((file) => {
              formData.append("files", file);
              metadata.push({ name: file.name, type: docType });
            });
          }
        });

        // Attach metadata as a JSON part so Spring can bind to @RequestPart("metadata")
        formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));

        // Send the request without setting manual Content-Type headers
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          body: formData, // Browser handles boundaries automatically
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Upload failed:", error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("Connection error:", error);
        return false;
    }
};
    return (
      <MainStructure>
        <div className="NewShipmentContainer">
        <ContentTitle title={t("Create New Shipment")} subTitle={t("Set origin and destination, then upload required documents")} />
        
        <div className="documentUploadProcess">
            <div className="documentUploadProcessInfo">
                    <p>{t("Documents Uploaded")}</p>
            </div>

            <hr/>

         <div className="uploadedFilesList">
          {Object.entries(allDocuments).map(([docName, files]) => 
          files.map((file, index) => (
            <div key={`${docName}-${index}`} className="uploadedFileCard">
                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start",  padding: "8px 0px 8px 8px"}}>
              <span className="fileNameText">{t(docName)}:</span><span> {file.name}</span>
                </div>
              <button 
                className="removeFileBtn" 
                onClick={() => !createShipmentPressed ?removeFile(docName, index) : null }
              >
                ✖️
              </button>
            </div>
        ))
        )}
      </div>
    </div>

        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
      />


        <div className="documentUploadContainer">
            <div className="documentUploadInfo">
                <p style={{ color:"#171717",fontSize:"20px" , fontWeight: "400" }}>{t("Select Document Type")}</p>
                <p style={{color:"#525252" , fontSize: "16px",marginBottom: "12px", fontWeight: "300" }}>{t("Click on any document type to upload")}</p>
            </div>
            
            <div className="documentsCardsContainer">
        {cardData.map((doc) => (
          <DocumentsCard
            DocumentIcon={doc.icon}
            key={doc.name}
            DocumentName={t(doc.name)}
            DocumentDesc={t(doc.desc)}
            fileCount={allDocuments[doc.name]?.length || 0}
            clickFun={() => !createShipmentPressed ? handleUploadTrigger(doc.name) : null}
          />
        ))}
      </div>


       <button 
     className="createShipmentBtn" 
     onClick={(e) => !createShipmentPressed ? handleSubmit1(e) : null}>
     {t("Create Shipment")}
      </button>

      <div className="createShipmentPopUpOverlay" style={{display: createShipmentPressed ? "flex" : "none"}}>
      <div className="createShipmentPopUp" style={{display:"flex"}}>
        <div>
        <LogInInputs onValueChange={handleDataChange} ref={shipmentNameRef} label={t("Shipment Name")} iconSrc="/icons/mailicon.png" iconName="mail icon" inputType="text" inputName="shipmentName" placeholder={t("Example Shipment")} />
        <LogInInputs onValueChange={handleDataChange} ref={shipmentReferenceNumberRef} label={t("Shipment Reference Number")} iconSrc="/icons/mailicon.png" iconName="mail icon" inputType="text" inputName="shipmentReferenceNumber" placeholder="ORGD9678383" />
        </div>

        <div className="shipmentStatusOptions" ref={shipmentStatusRef} onChange={handleDataChange} style={{display: "flex",marginTop: "20px",gap: "24px", fontSize: "18px"}}>
        <div style={{display: "flex",gap:"8px"}}>
        <label htmlFor="inProgressStatus" className="shipmentDataOption" >{t("In Progress")}</label>
        <input type="radio" id="inProgressStatus" name="shipmentStatusGroup" value="In Progress" defaultChecked />
        </div>

         <div style={{display: "flex",gap:"8px"}}>
        <label htmlFor="doneStatus" className="shipmentDataOption" >{t("Done")}</label>
        <input type="radio" id="doneStatus" name="shipmentStatusGroup" value="Done" />
        </div>
      </div>
      <div style={{marginTop:"20px",display: "flex", gap: "12px",flexDirection: "row", justifyContent: "flex-end"}}>
      <button 
      style={{padding:"8px 16px",backgroundColor:"#ad0000"}}
     className="createShipmentBtn"
     onClick={() => setCreateShipmentPressed(false)}>
     {t("Cancel Shipment")}
      </button>
      <button 
      style={{padding:"8px 16px",backgroundColor:"green"}}
     className="createShipmentBtn"
     onClick={handleSubmit2}>
     {t("Create Shipment")}
      </button>
      </div>
      </div>
      </div>

      </div>


   
         </div>
         </MainStructure>
    );
}
export default NewShipment;