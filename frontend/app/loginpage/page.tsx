"use client";
import { useState, useRef } from "react";
import React from "react";
import "./page.css";
import LogInInputs from "../components/LogInInputs";
import LogInStructure from "../components/LogInStructure";
import Button from "../components/Button";
import HaveAccount from "../components/HaveAccount";
import { useRouter } from "next/navigation";
import UserContext from "../components/UserContext";
import { useContext } from "react";
import LogInInputsErrorHandler from "../components/LogInInputsErrorHandler";
import Link from "next/link";
import Swal from "sweetalert2";

const LogInPage = () => {
    const [LogInDataForm, setLogInDataForm] = useState({
        userName: "",
        password: "",
    });
    const [showErrors, setShowErrors] = useState(false);
    const userNameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    
    const [noErrors, setNoErrors] = useState(false);
    const router = useRouter();
    const { setUserData } = useContext(UserContext);

    const noErrorsToggle = () => {
        setNoErrors(prev => !prev);
    };

    // Keep state sync on type change events
    const handleDataChange = () => {
        setLogInDataForm({
            userName: userNameRef.current ? userNameRef.current.value : "",
            password: passwordRef.current ? passwordRef.current.value : "",
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowErrors(true);
        
        const currentUsername = userNameRef.current ? userNameRef.current.value.trim() : "";
        const currentPassword = passwordRef.current ? passwordRef.current.value : "";

        if (!noErrors) {
            return;
        }
        
        try {
            const urlEncodedData = new URLSearchParams();
            urlEncodedData.append("username", currentUsername);
            urlEncodedData.append("password", currentPassword);

            console.log("Sending authentication payload to backend...");

            const response = await fetch("http://localhost:8080/jamrik/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: urlEncodedData.toString(),
            });
            console.log("Received response from backend:", response);

            if (response.ok) {
                // Backend's formLogin success handler currently returns a simple success message.
                // Populate minimal user context using the submitted username so the frontend remains functional.
                console.log("Login successful, setting user context and redirecting...");
                setUserData({
                    userName: currentUsername,
                    id: "",
                    email: "",
                    avatarUrl: "0",
                });
                console.log("User context set:", { userName: currentUsername, id: "", email: "", avatarUrl: "0" });
                Swal.fire({
                    title: "Success!",
                    text: "Logged in successfully",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                console.log("Redirecting to dashboard...");
                router.push("/dashboard");
            } else {
                const errorMsg = await response.text();
                Swal.fire({ text: errorMsg || "Invalid credentials", icon: "error" });
            }
        } catch (error) {
            console.error("Connection error:", error);
            Swal.fire({ text: "Backend server is not running or connection refused!", icon: "error" });
        }
    };

    return (
        <div className="LogInPage">
            <LogInStructure />
            <div className="whiteBoxLogin">
                <div>
                    <p className="subTitle">Welcome back</p>
                    <p className="underSubtitle">Enter your credentials to access your account</p>
                </div>
                
                {showErrors && (
                    <LogInInputsErrorHandler
                        fullName={LogInDataForm.userName}
                        password={LogInDataForm.password}
                        noErrors={noErrorsToggle}
                    />
                )}
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className="LogInPageInputsContainer">
                        <LogInInputs 
                            onValueChange={handleDataChange} 
                            ref={userNameRef} 
                            label="User Name" 
                            iconSrc="/icons/mailicon.png" 
                            iconName="mail icon" 
                            inputType="text" 
                            inputName="userName" 
                            placeholder="Mohammed Ahmad" 
                        />
                        <LogInInputs 
                            onValueChange={handleDataChange} 
                            ref={passwordRef} 
                            label="Password" 
                            iconSrc="/icons/lockicon.png" 
                            iconName="lock icon" 
                            inputType="password" 
                            inputName="password" 
                            placeholder="Enter your password" 
                        />
                    </div>
                    
                    <div>
                        <p className="forgotPassword">
                            <Link href="/changepasswordpage" className="forgotPassword">Forgot Password?</Link>
                        </p>
                    </div>
                    
                    <Button iconSrc="/icons/signInIcon.png" iconName="sign in icon" buttonType="submit" buttonDesc="Sign In" />
                </form>
                
                <hr className="hr"/>
                <HaveAccount leftSide="Don't have an account?" rightSide="Sign up" To="/signuppage" />
            </div>
        </div>
    );
};

export default LogInPage;