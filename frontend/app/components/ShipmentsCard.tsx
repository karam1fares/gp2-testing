import { stat } from "fs";
import "./ShipmentsCard.css";
type ShipmentsCardProps = {
    shipmentName: string;
    referenceNumber: string;
    status?: string;
    handleDeleteShipment:(id: string) => void;
    isSelected?: boolean;
    handleClick: (id: string) => void;
}
const ShipmentsCard = ({shipmentName, referenceNumber,status, handleDeleteShipment,isSelected,handleClick }: ShipmentsCardProps & { handleClick: (id: string) => void }) => {
    const handleStatusChange = async (newStatus: string) => {
    try {
        const url = `http://localhost:8080/jamrik/shipments/changeStatus/${encodeURIComponent(referenceNumber)}?status=${encodeURIComponent(newStatus)}`;
        
        const response = await fetch(url, {
            method: "POST", 
        });

        if (response.ok) {
            const updatedShipment = await response.json();
            alert(`Status updated to ${newStatus}`);
        } else {
            alert("Failed to update status.");
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
};
    return (
        <div className={`shipmentCardContainer ${isSelected ? 'selected' : ''}`} onClick={() => {handleClick(referenceNumber || "");}} style={{ cursor: isSelected ? "default" : "pointer" }}>
            <p>{shipmentName}</p>
                <p className="shipmentCardTitle">{referenceNumber}</p>
                {(isSelected) && (
                    <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between" , marginTop: "3px"}}>
                        <div className="shipmentCardStatus" onClick={() => {
                               if (status === "In Progress") {
                                    handleStatusChange("Done");
                                } else if (status === "Done") {
                                    handleStatusChange("In Progress");
                                }
                                }}>
                            Status: {status}
                        </div>
                        <button className="shipmentCardStatus" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShipment(referenceNumber || "");
                        }} style={{backgroundColor: "transparent", border: "none", color: "red", cursor: "pointer"}}>
                            Delete Shipment
                        </button>
                    </div>
                )}
            </div>
    );
}
export default ShipmentsCard;