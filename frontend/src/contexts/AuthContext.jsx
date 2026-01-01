
import { createContext } from "react";
import axios, { HttpStatusCode } from "axios";
import { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL:"http://localhost:8000/api/v1/users"
})

export const AuthProvider = ({children})=>{
    const authContext = useContext(AuthContext);

    const [userData,setUserData] = useState(authContext);
    //instance of router
    const router = useNavigate();

    const handleRegister = async(name,username,password)=>{
        try{
            let request = await client.post("/register",{
                name:name,
                username:username,
                password:password
            })


            if(request.status===HttpStatusCode.CREATED){
                return request.data.message || "registration successful";
            }else{

            }
        }catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || "Something went wrong";

    if (status === httpStatus.CONFLICT) {
      return "User already exists"; // handle 409 gracefully
    } else if (status === httpStatus.BAD_REQUEST) {
    return "Please fill in all fields";
    } else {
      return message; // fallback for other errors
    }
}
    }

    const handleLogin = async(username,password)=>{
        try{
            let request = await client.post("/login",{
                username:username,
                password:password
            });


        if(request.status === 200){

        const token = request.data.token || request.data.jwt || request.data.accessToken;

        if (!token) {
            console.error("No token found in response:", request.data);
            return;
        }
        localStorage.setItem("token",token);
        router("/home");
    }
        }catch(err){
            console.error("Login failed:", err.response?.data || err.message);
        }

    }

    const getHistoryOfUser = async()=>{
        try{
            let request = await client.get("/get_all_activity",{
                params:{
                    token:localStorage.getItem("token")
                }
            });
            return request.data
        }catch(err){
            throw err;
        }
    }

    const addToUserHistory = async(meetingCode) =>{
        try{
            let request = await client.post("/add_to_activity",{
                token:localStorage.getItem("token"),
                meeting_code:meetingCode
            });
            return request
        }catch(e){
            throw e;
        }
    }
    const data = {
        userData, setUserData,addToUserHistory,getHistoryOfUser,handleRegister,handleLogin
    }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}