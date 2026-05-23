"use client";
import "./page.css";
import MainStructure from "../components/MainStructure";
import Image from "next/image";
import ShipmentCalendar from "../components/ShipmentCalendar";
import ContentTitle from "../components/ContentTitle";
import { useState, useContext } from "react";
import { LanguageContext } from "../components/LanguageContext";
import CurrencyConverter from "../components/CurrencyConverter";
const DashBoard = () => {
    const { t } = useContext(LanguageContext);
    const [featureExplanationPressed, setFeatureExplanationPressed] = useState(false);
    const featuresExplanation = [
        {
            title: t("New Shipment"),
            description: t("Digitize your invoices, packing lists, and certificates to start a new shipment clearance process and get a automated customs declaration Form or report with any errors in the submitted documents, along with an estimated cost of the shipment."),
            iconSrc: "/icons/blackNew.png",
        },
        {
            title: t("Issues Detected"),
            description: t("Get real-time alerts on potential issues in your shipments, such as documentation errors, missing information, or mismatched data."),
            iconSrc:"/icons/blackWarning.png",
        },
        {
            title: t("HS Codes"),
            description: t("Get the HS codes for your products and the Customs Duty information for this specific product."),
            iconSrc: "/icons/blackSearch.png",
        },
        {
            title: t("Validation Page"),
            description: t("Validate your shipment documents before submission to ensure they meet customs requirements and avoid delays or penalties you can use this feature from the validation page if you don't want to add the documents to a specific shipment."),
            iconSrc: "/icons/blackmainCircle.png",
        }
    ];
    const [explanationDataNeeded, setExplanationDataNeeded] = useState({
        title: "",
        description: "",
        iconSrc: "",
    });
    return (
        <MainStructure>
        <div className="dashboardContainer">
            
            <ContentTitle title={t("Dashboard Overview")} subTitle={t("Real-time visibility into your logistics operations")} />

            <div className="dashboardCardsContainer">

                <div className="dashboardTopCards">

                    <div className="dashboardFeatureExplanationCardsBox">
                        <p className="dashboardFeatureExplanationCardsTitle">{t("Features Explanation")}</p>
                        <div className="featureExplanationCardsContainer">
                            {featuresExplanation.map((feature, index) => (<>
                                <div onClick={()=>{setFeatureExplanationPressed(!featureExplanationPressed); setExplanationDataNeeded(feature)}} key={index} className="featureExplanationItemCard">
                                    <p className="featureExplanationTitle">{feature.title}</p>
                                    <Image src={feature.iconSrc} alt={feature.title} width={24} height={24} />
                                </div>
                                <hr/>
                                </>
                            ))}

                        </div>
                    </div>


                        <div className="dashboardFeatureExplanationCardsBox">
                            <CurrencyConverter/>
                    </div>
                
                </div>

                {featureExplanationPressed && (
                    <div className="dashboardBottomCard">
                        <div>
                            <p className="dashboardBottomCardTitle">{explanationDataNeeded.title}</p>
                            <p className="dashboardBottomCardSubtitle">{explanationDataNeeded.description}</p>
                        </div>

                    </div>
                )}

            </div>

            <div className="calendar">
                <ShipmentCalendar />
            </div>

        </div>
        </MainStructure>
    );
}
export default DashBoard;