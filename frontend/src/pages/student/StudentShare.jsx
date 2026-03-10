import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader,
  QrCode,
  Copy,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  ChevronRight
} from "lucide-react";

import { getStudentCertificates } from "../../utils/contract";

const StudentShare = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [certificates,setCertificates] = useState([]);
  const [selectedCert,setSelectedCert] = useState(null);
  const [showQR,setShowQR] = useState(false);
  const [shareEmail,setShareEmail] = useState("");



  useEffect(()=>{

    loadCertificates();

  },[]);



  const loadCertificates = async()=>{

    try{

      setLoading(true);

      const certs = await getStudentCertificates();

      const verifiedCerts = certs.filter(c=>!c.revoked);

      setCertificates(verifiedCerts);

      if(verifiedCerts.length>0){
        setSelectedCert(verifiedCerts[0]);
      }

    }catch(err){

      console.error(err);

    }finally{

      setLoading(false);

    }

  };



  const CertificateSelector = ({cert,isSelected,onClick})=>(

    <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl transition ${
      isSelected
      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
      : "panel-card"
    }`}
    >

    <div className="flex justify-between">

    <div>

    <p className="font-bold">
    {cert.course}
    </p>

    <p className="text-sm">
    {cert.instituteName}
    </p>

    <p className="text-xs">
    {cert.issuedAt.toLocaleDateString()}
    </p>

    </div>

    {isSelected && <ChevronRight/>}

    </div>

    </button>

  );



  if(loading){

    return(

      <div className="flex justify-center items-center min-h-[60vh]">

        <Loader className="w-12 h-12 animate-spin text-blue-600"/>

      </div>

    );

  }



  return(

  <div className="page-shell">

  <h1 className="page-title">
  Share Certificate
  </h1>



  <div className="grid lg:grid-cols-3 gap-8">

  {/* LEFT LIST */}

  <div>

  <h2 className="font-bold mb-4">
  Select Certificate
  </h2>

  <div className="space-y-3">

  {certificates.map(cert=>(

    <CertificateSelector
    key={cert.id}
    cert={cert}
    isSelected={selectedCert?.id===cert.id}
    onClick={()=>setSelectedCert(cert)}
    />

  ))}

  </div>

  </div>



  {/* RIGHT PANEL */}

  <div className="lg:col-span-2">

  {selectedCert && (

  <div className="space-y-6">

  <div className="panel-card p-4">
    <p className="text-xs text-slate-500">Certificate ID</p>
    <p className="mono-wrap mt-1">{selectedCert.id}</p>
  </div>

  {/* QR */}

  <div className="panel-card p-6">

  <div className="flex justify-between mb-4">

  <h2 className="font-bold">
  QR Code
  </h2>

  <button
  onClick={()=>setShowQR(!showQR)}
  className="soft-button-muted text-sm px-3 py-1.5"
  >
  {showQR ? "Hide":"Show"} QR
  </button>

  </div>

  {showQR &&(

    <div className="flex justify-center">

    <div className="w-44 h-44 bg-slate-100 border border-slate-200 flex items-center justify-center rounded-xl">

    <QrCode className="w-16 h-16"/>

    </div>

    </div>

  )}

  </div>



  {/* LINK */}

  <div className="panel-card p-6">

  <h2 className="font-bold mb-3">
  Shareable Link
  </h2>

  <div className="flex space-x-2">

  <input
  readOnly
  value={`${window.location.origin}/verify?id=${selectedCert.id}`}
  className="soft-input flex-1 font-mono text-xs md:text-sm"
  />

  <button
  onClick={()=>{

    navigator.clipboard.writeText(`${window.location.origin}/verify?id=${selectedCert.id}`);

    alert("Link copied");

  }}
  className="soft-button-primary px-4"
  >

  <Copy/>

  </button>

  </div>

  </div>



  {/* SOCIAL */}

  <div className="panel-card p-6">

  <h2 className="font-bold mb-4">
  Social Share
  </h2>

  <div className="flex space-x-3">

  <button className="soft-button bg-sky-500 text-white p-3 rounded-xl">
  <Twitter/>
  </button>

  <button className="soft-button bg-blue-700 text-white p-3 rounded-xl">
  <Facebook/>
  </button>

  <button className="soft-button bg-cyan-600 text-white p-3 rounded-xl">
  <Linkedin/>
  </button>

  </div>

  </div>



  {/* EMAIL */}

  <div className="panel-card p-6">

  <h2 className="font-bold mb-4">
  Share via Email
  </h2>

  <div className="flex space-x-2">

  <input
  type="email"
  value={shareEmail}
  onChange={(e)=>setShareEmail(e.target.value)}
  placeholder="Email address"
  className="soft-input flex-1"
  />

  <button
  onClick={()=>{

    if(shareEmail){

      alert(`Link sent to ${shareEmail}`);

      setShareEmail("");

    }

  }}
  className="soft-button-primary px-4"
  >

  Send

  </button>

  </div>

  </div>

  </div>

  )}

  </div>

  </div>

  </div>

  );

};

export default StudentShare;
