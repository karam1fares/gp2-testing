"use client";
import LogInStructure from "../components/LogInStructure";
import LogInInputs from "../components/LogInInputs";
import Button from "../components/Button";
import HaveAccount from "../components/HaveAccount";
import { useState ,useRef, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import "./page.css";
import UserContext from "../components/UserContext";
import LogInInputsErrorHandler from "../components/LogInInputsErrorHandler";
import Swal from "sweetalert2";
const SignUpPage = () => {
  const [signUpDataForm, setSignUpDataForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleDataChange = () => {
    setSignUpDataForm({
      fullName:  fullNameRef.current ? fullNameRef.current.value : "",
      email: emailRef.current ? emailRef.current.value : "",
      password: passwordRef.current ? passwordRef.current.value : "",
      confirmPassword: confirmPasswordRef.current ? confirmPasswordRef.current.value : "",
      userRole: signUpDataForm.userRole,
    });
  };
  const [noErrors, setNoErrors] = useState(false);
  const router = useRouter();
  const { setUserData, avatarUrl} = useContext(UserContext);

  const noErrorsToggle = () => {if(noErrors) {
      setNoErrors(false);
  } else {
      setNoErrors(true);
  }};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);
    if (!noErrors) {
        return;
    }
    try {
            const response = await fetch("http://localhost:8080/jamrik/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: signUpDataForm.fullName,
                    email: signUpDataForm.email,
                    role: signUpDataForm.userRole,
                    password: signUpDataForm.password,
                    confirmPassword: signUpDataForm.confirmPassword,
                    avatar:0,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setUserData({
                    userName: data.userName,
                    id: data.id,
                    email: data.email,
                    avatarUrl: avatarUrl,
                });
                router.push("/DashBoard");
            } else {
                const errorText = await response.text();
                Swal.fire({ text: "Registration failed: " + errorText, icon: "error" });
            }
        } catch (error) {
            console.error("Network error:", error);
            Swal.fire({ text: "Cannot connect to the server.", icon: "error" });
        }
};
    return (
        <div className="SignUpPage">
            <LogInStructure />
                <div className="whiteBoxSignup">
                <div>
                <p className="subTitle">Create an account</p>
                <p className="underSubtitle">Enter your information to set up your logistics account</p>
              </div>
              
              {showErrors && (
                <LogInInputsErrorHandler
                  fullName={signUpDataForm.fullName}
                  email={signUpDataForm.email}
                  password={signUpDataForm.password}
                  confirmPassword={signUpDataForm.confirmPassword}
                  userRole={signUpDataForm.userRole}
                  noErrors={noErrorsToggle}
                />
              )}
              <form onSubmit={handleSubmit} noValidate>

              <div className="SignUpPageInputsContainer">
              <LogInInputs onValueChange={handleDataChange} ref={fullNameRef} label="User Name" iconSrc="/icons/usericon.png" iconName="user icon" inputType="text" inputName="userName" placeholder="Mohammed Ahmad" />
              <LogInInputs onValueChange={handleDataChange} ref={emailRef} label="Email" iconSrc="/icons/mailicon.png" iconName="mail icon" inputType="email" inputName="email" placeholder="Mohammed Ahmad@gmail.com" />
              <LogInInputs onValueChange={handleDataChange} ref={passwordRef} label="Password" iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="password" placeholder="Enter your password" />
              <LogInInputs onValueChange={handleDataChange} ref={confirmPasswordRef} label="Confirm Password" iconSrc="/icons/lockicon.png" iconName="lock icon" inputType="password" inputName="confirmPassword" placeholder="Confirm your password" />
              </div>

              <div className="selectContainer">
                <label className="inputLabel">User Role</label>
                <select className="selectField"
                 name="userRole" 
                  value={signUpDataForm.userRole}
                  onChange={(e) => setSignUpDataForm({...signUpDataForm, userRole: e.target.value})}
                  style={{ color: signUpDataForm.userRole === "" ? "#A9A9A9" : "#000000" }}
                        >
                  <option value="" disabled>Select Role</option>
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Logistics Officer">Logistics Officer</option>
                    <option value="Customs Broker">Customs Broker</option>
                </select>

              </div>
              
              <Button iconSrc="/icons/createAccountIcon.png" iconName="sign up icon" buttonType="submit" buttonDesc="Create Account" /> 
              </form>

              <hr className="hr"/>
              <HaveAccount leftSide="Already have an account?" rightSide="Sign in" To="/LogInPage" />
              </div>
        </div>
    );
};

export default SignUpPage;