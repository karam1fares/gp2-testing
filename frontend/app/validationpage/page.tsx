"use client";
import MainStructure from "../components/MainStructure";
import ContentTitle from "../components/ContentTitle";
import { useEffect, useRef, useState, useContext } from "react";
import Image from "next/image";
import { LanguageContext } from "../components/LanguageContext";
import "./page.css";
import { toast } from "sonner";

const ValidationPage = () => {
    const { t } = useContext(LanguageContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filesData, setFilesData] = useState<{key: string; docType: string; file: File | null}[]>([
        {
            key : "1",
            docType: "",
            file: null
        },
        {
            key : "2",
            docType: "",
            file: null
        }
    ]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const docTypes = [
        { value: "", label: t("Select Document Type") },
        { value: "airwayBill", label: t("Airway Bill") },
        { value: "invoice", label: t("Commercial Invoice") },
        { value: "packingList", label: t("Packing List") },
        { value: "certificateOfOrigin", label: t("Certificate of Origin") },
        { value: "proformaInvoice", label: t("Proforma Invoice") },
    ];

    const handleUploadTrigger = (index: number) => {
        setActiveIndex(index);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleTypeChange = (index: number, newType: string) => {
        setFilesData(prev => {
            const newFilesData = [...prev];
            newFilesData[index] = {
                ...newFilesData[index],
                docType: newType
            };
            return newFilesData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const files = e.target.files;
    if (files && files.length > 0 && activeIndex !== null) {
        const selectedFile = files[0];
        setFilesData(prev => {
            const newFilesData = [...prev];
            newFilesData[activeIndex] = {
                ...newFilesData[activeIndex],
                file: selectedFile
            };
            return newFilesData;
        });

        e.target.value = ""; 
        setActiveIndex(null); 
}};
 const [displayAiResult, setDisplayAiResult] = useState(false);
 const [aiValidationResult, setAiValidationResult] = useState<string>("");
const handleValidate = async () => {
        // 1. Validation Check
        if (filesData[0].file === null || filesData[1].file === null || filesData[0].docType === "" || filesData[1].docType === "") {
            toast.error(t("Please upload both documents and select their types."));
            return;
        }

        // 2. Clear previous results and show a clean processing spinner
        setDisplayAiResult(false);
        setAiValidationResult("");
        
        const toastId = toast.loading(t("AI is validating the documents..."));

        // 3. Assemble Multipart Payload
        const formData = new FormData();
        // Backend expects the part name 'docs' for the multipart list
        formData.append("docs", filesData[0].file);
        formData.append("docs", filesData[1].file);
        
        // // Optional: Sending types if your backend logic expects cross-referencing values
        // formData.append("types", filesData[0].docType);
        // formData.append("types", filesData[1].docType);

        try {
            // 4. API Request to Spring Boot Endpoint
            const response = await fetch("http://localhost:8080/jamrik/codes/validate", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            if (!response.ok) {
                throw new Error("Validation engine service returned an error status.");
            }

            // Expecting either a flat string response or a JSON object containing a result field
            // HSCode validation returns plain text from the backend AI service
            const text = await response.text();
            
            // 5. Update Local State UI
            setAiValidationResult(text);
            setDisplayAiResult(true);

            toast.success(t("Documents processed successfully! Review AI assessment below."), { id: toastId });

        } catch (error) {
            toast.error(error instanceof Error ? error.message : t("Could not communicate with the engine server."), { id: toastId });
        }
    };
   
    return (
        <MainStructure>
        <div className="validationPageContainer">
        <ContentTitle title={t("Validation Page")} subTitle={t("Upload 2 Documents for validation")} />

            <div className="validationPageFileUploadContainer">                
                {filesData.map((fileObj, index) => (
                    <div key={fileObj.key}>
                        <select 
                            value={fileObj.docType} 
                            onChange={(e) => handleTypeChange(index, e.target.value)}
                            className="validationPageSelect">
                            {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <div 
                            className="validationPageFileInputContainer" 
                            onClick={() => handleUploadTrigger(index)} 
                         >

                        {fileObj.file ? (
                           <span className="fileNameLabel">{fileObj.file.name}</span>
                            ) : (
                           <Image src="/icons/plus.png" alt="Upload Icon" width={32} height={32} />
                                  )}
                        </div>
                    </div>
                ))}

            </div>

        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        style={{ display: 'none' }}
      />

      <button className="validationPageValidateButton" onClick={handleValidate}>
        {t("Validate")}
      </button>
      {displayAiResult && (
        <div className="AiValidationResultContainer">
          <p className="validationResultTitle">{t("AI Validation Result")}</p>
          {aiValidationResult.split("\n").map((line, index) => (
            <p key={index} className="validationResultLine">{line}</p>
          ))}
        </div>
      )}

        </div>
        </MainStructure>
    );
}
export default ValidationPage;