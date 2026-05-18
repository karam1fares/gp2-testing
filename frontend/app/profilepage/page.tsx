"use client";
import React, { useContext, useRef ,useState } from "react";
import AvatarSelector from "../components/AvatarSelector"; 
import UserProfileSprite from "../components/UserProfileSprite"; // New component
import UserContext from "../components/UserContext";
import BackArrow from "../components/BackArrow";
import "./style.css"; 
import LogInInputs from "../components/LogInInputs";
import Link from "next/dist/client/link";
import Swal from "sweetalert2";
const ProfilePage = () => {
  const [avatarClicked, setAvatarClicked] = useState(false);
  const avatarClickedToggle = () => {  setAvatarClicked(!avatarClicked);};
const {setUserData, userName, id ,avatarUrl,email} = useContext(UserContext);
const userNameRef =useRef<HTMLInputElement>(null);
const emailRef = useRef<HTMLInputElement>(null);
const [ChangeUserInfo, setChangeUserInfo] = useState({
    userName: userName,
    email: email,
    userRole: ""
});
const handleDataChange = () => {
    setChangeUserInfo({
      userName:  userNameRef.current ? userNameRef.current.value : "",
      email: emailRef.current ? emailRef.current.value : "",
      userRole: ChangeUserInfo.userRole, 
    });
};
const handleSaveChanges = async () => {
    try {
        const url = `http://localhost:8080/jamrik/changeData/${encodeURIComponent(userName)}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userName: ChangeUserInfo.userName,
                email: ChangeUserInfo.email,
                role: ChangeUserInfo.userRole,
                avatar: avatarUrl,
            }),
        });

        if (response.ok) {
            const updatedUser = await response.json();
                setUserData({
                userName: updatedUser.userName,
                id:id,
                email: updatedUser.email,
                avatarUrl:avatarUrl
            });

            Swal.fire({ text: "Profile updated successfully!", icon: "success" });
        } else {
            const error = await response.text();
            Swal.fire({ text: "Update failed: " + error, icon: "error" });
        }
    } catch (error) {
        console.error("Connection error:", error);
    }
};
  return (
      <div className="profilePage">
          <div className="userAvatar"  onClick={() => avatarClickedToggle()}>
            <UserProfileSprite scale={2} />
          </div>
          {avatarClicked &&
        <div className="avatarSection" >
          <AvatarSelector avatarClickedToggle={avatarClickedToggle}/> 
        </div>
        }
            <BackArrow to="/dashboard" />
              <div className="userIdProfilePage">{id}</div>
        
          <div className="UserProfileInfoContainer">
            <div>
            <p className="profileTitle">My Profile</p>
            <p className="profileSubtitle">Manage your profile information</p>
            </div>
            <div className="profileInputFieldsContainer">
        <LogInInputs onValueChange={handleDataChange} ref={userNameRef} label="User Name" iconSrc="/icons/usericon.png" iconName="user icon" inputType="text" inputName="userName" placeholder="Change your user name" initialValue={userName} />
        <LogInInputs onValueChange={handleDataChange} ref={emailRef} label="Email" iconSrc="/icons/mailicon.png" iconName="mail icon" inputType="email" inputName="email" placeholder="Mohammed Ahmad@gmail.com" initialValue={email}/>
               </div>
                <div className="selectContainer">
                <label className="inputLabel">User Role</label>
                <select className="selectField"
                 name="userRole" 
                   value={ChangeUserInfo.userRole}
                   onChange={(e) => setChangeUserInfo({...ChangeUserInfo, userRole: e.target.value})}
                  style={{ color: ChangeUserInfo.userRole === "" ? "#A9A9A9" : "#000000" }}
                        >
                  <option value="" disabled>Select Role</option>
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Logistics Officer">Logistics Officer</option>
                    <option value="Customs Broker">Customs Broker</option>
                </select>

              </div>
              <Link href="/changepasswordpage" className="changePasswordLink">Change Password</Link>

          <button className="submitChangesBtn" type="submit" onClick={handleSaveChanges}>Save Changes</button>
          <hr className="hr"/>
          <button className="logOutBtn" type="submit" >Log Out</button>
          </div>
        
        </div>
  );
};

export default ProfilePage;