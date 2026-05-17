"use client";
import { createContext, useState, ReactNode } from "react";

type UserData = {
  userName: string;
  id: string;
  email: string;
  avatarUrl: string;
};

type UserContextType = {
  userName: string;
  id: string;
  avatarUrl: string; // 2. Added this to the context type
  email: string; // 2. Added this to the context type
  setUserData: (data: UserData) => void;
};

const UserContext = createContext<UserContextType>({
  userName: "Account Type",
  id: "Demo Account",
  avatarUrl: "0", // 3. Added a default index (the first face)
  email: "", // 3. Added a default email
  setUserData: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // 4. Initialize the state with the avatarUrl
  const [userData, setUserData] = useState<UserData>({ 
    userName: "Account Type", 
    id: "Demo Account",
    email: "",
    avatarUrl: "0",
  });

  return (
    <UserContext.Provider 
      value={{ 
        userName: userData.userName, 
        id: userData.id, 
        avatarUrl: userData.avatarUrl, // 5. Pass it through the provider
        email: userData.email,
        setUserData 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;