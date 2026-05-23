"use client";
import BackArrow from "../components/BackArrow";
import "./page.css";
import LogInInputs from "../components/LogInInputs";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
const ChangePasswordPage = () => {
    const router = useRouter();
    const userNameRef = useRef<HTMLInputElement>(null);
    const oldPasswordRef = useRef<HTMLInputElement>(null);
    const newPasswordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const [ChangePasswordInfo, setChangePasswordInfo] = useState({
        userName: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const handleDataChange = () => {
        setChangePasswordInfo({
          userName: userNameRef.current ? userNameRef.current.value : "",
          oldPassword: oldPasswordRef.current ? oldPasswordRef.current.value : "",
          newPassword: newPasswordRef.current ? newPasswordRef.current.value : "",
          confirmPassword: confirmPasswordRef.current ? confirmPasswordRef.current.value : "",
        });
    };
    const handleChangePassword = async () => {
        if (ChangePasswordInfo.oldPassword === "" || ChangePasswordInfo.newPassword === "" || ChangePasswordInfo.confirmPassword === "") {
            Swal.fire({ text: "All fields are required.", icon: "warning" });
            return;
        }else if (ChangePasswordInfo.newPassword !== ChangePasswordInfo.confirmPassword) {
            Swal.fire({ text: "New password and confirm password do not match.", icon: "warning" });
            return;
        }else if (!/[A-Z]/.test(ChangePasswordInfo.newPassword)) {
            Swal.fire({ text: "New password must contain at least one uppercase letter.", icon: "warning" });
            return;
        }else if (ChangePasswordInfo.newPassword.length < 8) {
            Swal.fire({ text: "New password must be at least 8 characters long.", icon: "warning" });
            return;
        }else if (!/[0-9]/.test(ChangePasswordInfo.newPassword)) {
            Swal.fire({ text: "New password must contain at least one number.", icon: "warning" });
            return;
        }else if (!/[!@#$%^&*]/.test(ChangePasswordInfo.newPassword)) {
            Swal.fire({ text: "New password must contain at least one special character (!@#$%^&*).", icon: "warning" });
            return;
        }else{
        try {
            const url = `http://localhost:8080/jamrik/changePassword/${encodeURIComponent(ChangePasswordInfo.userName)}`;
            const response = await fetch(url, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: ChangePasswordInfo.userName,
                    currentPassword: ChangePasswordInfo.oldPassword,
                    newPassword: ChangePasswordInfo.newPassword,
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to change password");
            }
            Swal.fire({ text: "Password changed successfully.", icon: "success" }).then(() => {
                router.push("/dashboard");
            });
        } catch (error) {
            console.error("Error changing password:", error);
            Swal.fire({ text: "Failed to change password.", icon: "error" });
        }
    }
};
    return (
        <div className="ChangePasswordPage">
        <div className="whiteBoxChangePassword">
            <BackArrow to="/dashboard"/>
            <h1 className="subTitle">Change Password</h1>
            <LogInInputs onValueChange={handleDataChange} ref={userNameRef} label="User Name" iconSrc="/icons/usericon.png" iconName="user icon" inputType="text" inputName="userName" placeholder="Enter user name" />
            <LogInInputs onValueChange={handleDataChange} ref={oldPasswordRef} label="Old Password" iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="oldPassword" placeholder="Enter old password" />
            <LogInInputs onValueChange={handleDataChange} ref={newPasswordRef} label="New Password" iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="newPassword" placeholder="Enter new password" />
            <LogInInputs onValueChange={handleDataChange} ref={confirmPasswordRef} label="Confirm Password" iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="confirmPassword" placeholder="Confirm new password" />
            <button className="save-button" onClick={handleChangePassword}>Save Changes</button>
        </div>
        </div>
    );
}
export default ChangePasswordPage;