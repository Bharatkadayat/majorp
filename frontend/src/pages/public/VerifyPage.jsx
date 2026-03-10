import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyCertificate } from "../../utils/contract";
import { generateFileHash } from "../../utils/ipfs";
import { Html5QrcodeScanner } from "html5-qrcode";

import {
  Search,
  Loader,
  CheckCircle,
  XCircle,
  QrCode,
  ExternalLink
} from "lucide-react";

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [certificateId,setCertificateId] = useState("");
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState(null);
  const [error,setError] = useState(null);
  const [showScanner,setShowScanner] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedHash, setUploadedHash] = useState("");
  const [integrityMessage, setIntegrityMessage] = useState("");
  const [integrityType, setIntegrityType] = useState(""); // ok | warn | danger



  const handleVerify = async (id) => {

    const certId = id || certificateId || uploadedHash;
    console.log("[VERIFY] Requested certId:", certId);

    if(!certId){

      setError("Enter certificate ID");
      return;

    }

    try{

      setLoading(true);
      setError(null);
      setIntegrityMessage("");
      setIntegrityType("");

      const cert = await verifyCertificate(certId);

      setResult(cert);
      console.log("[VERIFY] Verification success:", {
        student: cert.studentName,
        course: cert.course,
        revoked: cert.revoked,
        ipfsHash: cert.ipfsHash
      });

      if (uploadedHash) {
        if (uploadedHash.toLowerCase() === String(cert.fileHash || "").toLowerCase()) {
          setIntegrityType("ok");
          setIntegrityMessage("File integrity match: uploaded PDF hash matches blockchain record.");
        } else {
          setIntegrityType("danger");
          setIntegrityMessage("Possible tampering detected: uploaded PDF hash does not match blockchain file hash.");
        }
      }

    }

    catch(err){

      console.error(err);
      console.error("[VERIFY] Verification failed for certId:", certId);
      if (uploadedHash && certId === uploadedHash) {
        setError("Certificate record not found for uploaded file hash. Possible fake/edited certificate or not issued on this network.");
        setIntegrityType("danger");
        setIntegrityMessage("Fraud alert: uploaded certificate hash is not registered on-chain.");
      } else {
        setError("Certificate not found");
      }

    }

    finally{

      setLoading(false);

    }

  };

  const handleFileVerify = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setResult(null);
    setError(null);
    setIntegrityMessage("");
    setIntegrityType("");
    const hash = await generateFileHash(file);
    setUploadedHash(hash);
    setCertificateId(hash);
    console.log("[VERIFY] Uploaded file hash:", hash);
    await handleVerify(hash);
  };



  // QR scanner
  useEffect(()=>{

    if(!showScanner) return;

    const scanner = new Html5QrcodeScanner(

      "qr-reader",
      { fps:10, qrbox:250 },
      false

    );

    scanner.render(

      (decodedText)=>{

        setCertificateId(decodedText);
        setShowScanner(false);
        handleVerify(decodedText);

      },

      (error)=>{
        if (String(error || "").includes("No MultiFormat Readers")) {
          return;
        }
        console.debug("[QR]", error);

      }

    );

    return () => {
      scanner.clear().catch(() => {});
    };

  },[showScanner]);

  useEffect(() => {
    const certIdFromQuery = searchParams.get("id");
    if (certIdFromQuery) {
      setCertificateId(certIdFromQuery);
      handleVerify(certIdFromQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);



  return(

  <div className="page-shell py-8">

  <div className="text-center space-y-2">
    <h1 className="page-title bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent animate-pulse-glow">
      Public Verify
    </h1>
    <p className="page-subtitle">
      Admin, Institute, Student, or any public user can verify any certificate on-chain.
    </p>
  </div>



  {/* SEARCH */}

  <div className="panel-card p-4 md:p-5 flex flex-col md:flex-row gap-2">

  <input
  value={certificateId}
  onChange={(e)=>setCertificateId(e.target.value)}
  placeholder="Enter Certificate ID"
  className="soft-input flex-1 font-mono text-sm"
  />

  <button
  onClick={()=>handleVerify()}
  className="soft-button-primary md:min-w-[130px]"
  >

  {loading ? <Loader className="animate-spin w-4 h-4"/> : "Verify"}

  </button>

  <button
  onClick={()=>setShowScanner(!showScanner)}
  className="soft-button-muted md:min-w-[90px]"
  >

  <QrCode className="w-4 h-4"/> Scan

  </button>

  </div>

  <div className="panel-card p-4 md:p-5 space-y-2">
    <p className="text-sm text-slate-700 font-semibold">Auto Verify by Uploading Certificate PDF</p>
    <label className="soft-button-muted cursor-pointer inline-flex">
      Upload PDF
      <input
        type="file"
        className="hidden"
        accept=".pdf,application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileVerify(f).catch((err) => setError(err.message));
        }}
      />
    </label>
    {uploadedFile ? (
      <div className="text-xs text-slate-600 space-y-1">
        <p>File: {uploadedFile.name}</p>
        <p className="font-mono break-all">Computed Hash: {uploadedHash}</p>
      </div>
    ) : null}
  </div>



  {/* QR SCANNER */}

  {showScanner && (

  <div className="panel-card p-4 rounded-2xl">

  <div id="qr-reader"></div>

  </div>

  )}



  {/* ERROR */}

  {error && (

  <div className="panel-card bg-rose-50 border-rose-200 p-4 rounded-xl text-rose-700 flex items-center">

  <XCircle className="mr-2"/>

  {error}

  </div>

  )}

  {integrityMessage ? (
    <div
      className={`panel-card p-4 rounded-xl flex items-center ${
        integrityType === "ok"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : integrityType === "danger"
            ? "bg-rose-50 border-rose-200 text-rose-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
      }`}
    >
      {integrityType === "ok" ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
      {integrityMessage}
    </div>
  ) : null}



  {/* RESULT */}

  {result && (

  <div className="panel-card p-5 md:p-7 space-y-6">

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

  <h2 className="text-xl md:text-2xl font-bold">

  Certificate Details

  </h2>

  {result.revoked ?(

  <span className="status-warn">

  <XCircle className="mr-1"/>

  Revoked

  </span>

  ):(
  <span className="status-ok">

  <CheckCircle className="mr-1"/>

  Verified

  </span>
  )}

  </div>



  <Info label="Student" value={result.studentName}/>
  <Info label="Student ID / USN" value={result.studentId || "N/A"}/>
  <Info label="Course" value={result.course}/>
  <Info label="Institute" value={result.instituteName}/>
  <Info label="Issue Date" value={result.issuedAt.toLocaleDateString()}/>
  <Info label="Grade" value={result.grade || "N/A"}/>
  <Info label="Credits" value={String(result.credits ?? "N/A")}/>
  <Info label="Duration" value={result.duration || "N/A"}/>
  <Info label="Skills" value={(result.skills || []).join(", ") || "N/A"}/>
  <Info label="IPFS Hash" value={result.ipfsHash}/>
  <Info label="File Hash" value={result.fileHash}/>
  <button
  onClick={()=>navigate(`/certificate/${certificateId}`)}
  className="soft-button-muted text-sm"
  >
  Open full details page
  </button>



  {/* CERTIFICATE PREVIEW */}

  {!result.revoked && (

  <div className="space-y-3">

  <h3 className="font-semibold">

  Certificate Preview

  </h3>



  <div className="border border-slate-200 rounded-xl overflow-hidden">

  <iframe
  src={`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`}
  width="100%"
  height="500"
  title="Certificate Preview"
  />

  </div>



  <a
  href={`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`}
  target="_blank"
  rel="noreferrer"
  className="soft-button-primary"
  >

  Open Full Certificate

  <ExternalLink className="ml-2 w-4 h-4"/>

  </a>

  </div>

  )}

  </div>

  )}

  </div>

  );

};



const Info = ({label,value})=>(

<div className="panel-card p-3">

<p className="text-xs text-slate-500">
{label}
</p>

<p className="font-medium break-all text-slate-800">
{value}
</p>

</div>

);

export default VerifyPage;
