import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { getContract } from "../../utils/contract";
import { clearAuthSession, saveAuthRole, walletLogin } from "../../utils/authApi";
import { Wallet, ShieldCheck, Building2, GraduationCap, AlertCircle, Sparkles } from "lucide-react";

const LoginPage = () => {

  const navigate = useNavigate();

  const [selectedRole,setSelectedRole] = useState("admin");
  const [walletAddress,setWalletAddress] = useState("");
  const [error,setError] = useState("");

  const handleLogin = async () => {

    try{
      clearAuthSession();

      if(!walletAddress){
        setError("Enter wallet address");
        return;
      }
      if(!ethers.utils.isAddress(walletAddress)){
        setError("Invalid wallet address");
        return;
      }

      const contract = await getContract();
      const connectedWallet = await contract.signer.getAddress();
      console.log("[LOGIN] Connected wallet:", connectedWallet);
      if (connectedWallet.toLowerCase() !== walletAddress.toLowerCase()) {
        setError("Entered wallet does not match connected MetaMask account");
        console.error("[LOGIN] Wallet mismatch", { entered: walletAddress, connected: connectedWallet });
        return;
      }

      const owner = await contract.owner();

      // ADMIN LOGIN
      if(selectedRole === "admin"){

        if(walletAddress.toLowerCase() === owner.toLowerCase()){
          await walletLogin(contract, walletAddress);
          saveAuthRole("admin");
          console.log("[LOGIN] Role resolved: admin");
          navigate("/admin");
        }else{
          setError("This wallet is not admin");
          console.error("[LOGIN] Admin login failed: not owner");
        }

        return;
      }


      // INSTITUTE LOGIN
      if(selectedRole === "institute"){

        try{

          const info = await contract.getInstituteBasicInfo(walletAddress);

          const isActive = info[4];

          if(isActive){
            await walletLogin(contract, walletAddress);
            saveAuthRole("institute");
            console.log("[LOGIN] Role resolved: institute");
            navigate("/institute");
          }else{
            setError("Institute not active");
            console.error("[LOGIN] Institute login failed: inactive");
          }

        }catch{
          setError("Institute not registered");
          console.error("[LOGIN] Institute login failed: not registered");
        }

        return;
      }


      // STUDENT LOGIN
      if(selectedRole === "student"){

        await walletLogin(contract, walletAddress);
        saveAuthRole("student");
        console.log("[LOGIN] Role resolved: student");
        navigate("/student");
        return;

      }

    }

    catch(err){

      console.error(err);
      setError("Login failed");

    }

  };


  return (

  <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">

  <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950" />
  <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.25)_1px,transparent_0)] [background-size:28px_28px]" />
  <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-cyan-500/30 blur-3xl animate-blob" />
  <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-blue-500/25 blur-3xl animate-blob animation-delay-2000" />
  <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-cyan-300 animate-pulse" />
  <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-blue-300 animate-pulse" />

  <div className="relative w-full max-w-2xl p-6 md:p-8 space-y-6 rounded-3xl border border-cyan-200/20 bg-white/10 backdrop-blur-xl shadow-2xl animate-scale-in">

  <div className="text-center space-y-3">
    <p className="inline-flex items-center gap-2 text-xs text-cyan-100/90">
      <Sparkles className="w-4 h-4 text-cyan-300" />
      Secure Wallet Signature Authentication
    </p>
    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-200 via-blue-100 to-emerald-200 bg-clip-text text-transparent">
      Wallet Login
    </h1>
    <p className="text-cyan-50/80">
      Connect the same MetaMask account and role wallet to continue securely.
    </p>
  </div>


  {/* ROLE SELECT */}

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

  <button
  onClick={()=>setSelectedRole("admin")}
  className={`soft-button justify-start border ${
  selectedRole==="admin" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white/90 border-slate-200 text-slate-700"
  }`}
  >
  <ShieldCheck className="w-4 h-4" />
  Admin
  </button>

  <button
  onClick={()=>setSelectedRole("institute")}
  className={`soft-button justify-start border ${
  selectedRole==="institute" ? "bg-cyan-50 border-cyan-300 text-cyan-700" : "bg-white/90 border-slate-200 text-slate-700"
  }`}
  >
  <Building2 className="w-4 h-4" />
  Institute
  </button>

  <button
  onClick={()=>setSelectedRole("student")}
  className={`soft-button justify-start border ${
  selectedRole==="student" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white/90 border-slate-200 text-slate-700"
  }`}
  >
  <GraduationCap className="w-4 h-4" />
  Student
  </button>

  </div>


  {/* WALLET INPUT */}

  <input
  type="text"
  placeholder="Enter wallet address"
  value={walletAddress}
  onChange={(e)=>setWalletAddress(e.target.value)}
  className="soft-input font-mono text-sm bg-white/95"
  />


  {/* LOGIN BUTTON */}

  <button
  onClick={handleLogin}
  className="w-full soft-button-primary py-3 shadow-lg"
  >
  <Wallet className="w-4 h-4" />
  Login to Dashboard
  </button>


  {error && (

  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm flex items-center gap-2">
  <AlertCircle className="w-4 h-4 shrink-0" />
  {error}
  </div>

  )}

  </div>

  </div>

  );

};

export default LoginPage;
 