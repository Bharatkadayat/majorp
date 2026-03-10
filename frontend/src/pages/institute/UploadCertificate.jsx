import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import {
  Upload,
  FileText,
  User,
  BookOpen,
  Award,
  Loader,
  CheckCircle,
  XCircle,
  Plus,
  X
} from "lucide-react";

import {
  issueCertificate,
  isActiveInstitute,
  getInstituteBasicInfo
} from "../../utils/contract";

import { uploadToIPFS, generateFileHash } from "../../utils/ipfs";

const UploadCertificate = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [submitting,setSubmitting] = useState(false);

  const [error,setError] = useState(null);
  const [success,setSuccess] = useState(null);

  const [selectedFile,setSelectedFile] = useState(null);
  const [fileHash,setFileHash] = useState("");

  const [skills,setSkills] = useState([]);
  const [currentSkill,setCurrentSkill] = useState("");

  const [formData,setFormData] = useState({
    studentName:"",
    studentId:"",
    studentWallet:"",
    course:"",
    grade:"",
    credits:"",
    duration:""
  });


  useEffect(()=>{

    verifyInstitute();

  },[]);



  const verifyInstitute = async()=>{

    try{

      const active = await isActiveInstitute();

      if(!active){

        setError("Your institute is not active");
        return;

      }

      setLoading(false);

    }catch(err){

      setError("Institute verification failed");

    }

  };



  const handleInputChange = (e)=>{

    const {name,value} = e.target;

    setFormData(prev=>({...prev,[name]:value}));

  };



  const handleFileSelect = async(e)=>{

    const file = e.target.files[0];

    if(!file) return;

    setSelectedFile(file);

    const hash = await generateFileHash(file);

    setFileHash(hash);

  };



  const addSkill = ()=>{

    const skill = currentSkill.trim();
    if(!skill){
      setError("Enter a skill before adding");
      return;
    }
    if(skills.includes(skill)){
      setError("Skill already added");
      return;
    }
    setError(null);
    setSkills([...skills,skill]);
    setCurrentSkill("");

  };



  const removeSkill = (skill)=>{

    setSkills(skills.filter(s=>s!==skill));

  };



  const handleSubmit = async(e)=>{

    e.preventDefault();

    try{

      setSubmitting(true);
      setError(null);

      if(!selectedFile){
        throw new Error("Please upload certificate file");
      }

      if(!ethers.utils.isAddress(formData.studentWallet)){
        throw new Error("Invalid student wallet");
      }

      const ipfs = await uploadToIPFS(selectedFile);
      console.log("[UPLOAD] IPFS upload success:", ipfs.IpfsHash);

      const result = await issueCertificate(

        formData.studentName,
        formData.course,
        ipfs.IpfsHash,
        fileHash,
        formData.studentWallet,
        formData.studentId || "",
        formData.grade || "",
        Number(formData.credits || 0),
        formData.duration || "",
        skills

      );

      setSuccess({
        tx:result.hash,
        ipfs:ipfs.IpfsHash,
        certificateId: result.certificateId
      });
      console.log("[UPLOAD] Certificate issued:", {
        txHash: result.hash,
        certificateId: result.certificateId,
        studentWallet: formData.studentWallet,
        fileHash
      });

      setTimeout(()=>{
        navigate("/institute/success", {
          state: {
            certificateId: result.certificateId,
            fileHash,
            ipfsHash: ipfs.IpfsHash,
            studentName: formData.studentName,
            course: formData.course,
            transactionHash: result.hash
          }
        });
      },1200);

    }catch(err){

      console.error(err);
      const msg = String(err?.reason || err?.data?.message || err?.message || "");
      if (msg.toLowerCase().includes("certificate exists")) {
        setError("Certificate already exists on-chain for this file hash. Use a different file or update content before issuing.");
      } else {
        setError(msg || "Failed to issue certificate");
      }

    }finally{

      setSubmitting(false);

    }

  };



  if(loading){

    return(

      <div className="flex justify-center items-center min-h-[60vh]">

        <Loader className="w-10 h-10 animate-spin text-blue-600"/>

      </div>

    );

  }



  return(

  <div className="page-shell">

  <h1 className="page-title text-2xl md:text-3xl">
  Issue Certificate
  </h1>



{success && (

  <div className="panel-card bg-emerald-50 border-emerald-200 p-4 rounded-xl">

  <CheckCircle className="text-green-600 mb-2"/>

  <p>Certificate issued successfully</p>
  <p className="text-xs">ID: {success.certificateId}</p>

  <p className="text-xs">TX: {success.tx}</p>

  <p className="text-xs">IPFS: {success.ipfs}</p>

  </div>

  )}

  {error ? (
  <div className="panel-card bg-rose-50 border-rose-200 p-4 rounded-xl text-rose-700 flex items-start gap-2">
  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
  <p>{error}</p>
  </div>
  ) : null}



<form onSubmit={handleSubmit} className="panel-card p-6 space-y-6">


{/* STUDENT */}

<div>

<h2 className="font-semibold mb-3 flex items-center">
<User className="w-4 h-4 mr-2"/>
Student
</h2>

<input
name="studentName"
placeholder="Student Name"
value={formData.studentName}
onChange={handleInputChange}
className="soft-input"
/>

<input
name="studentId"
placeholder="Student ID"
value={formData.studentId}
onChange={handleInputChange}
className="soft-input"
/>

<input
name="studentWallet"
placeholder="Student Wallet"
value={formData.studentWallet}
onChange={handleInputChange}
className="soft-input font-mono text-sm"
/>

</div>



{/* COURSE */}

<div>

<h2 className="font-semibold mb-3 flex items-center">
<BookOpen className="w-4 h-4 mr-2"/>
Course
</h2>

<input
name="course"
placeholder="Course Title"
value={formData.course}
onChange={handleInputChange}
className="soft-input"
/>

<input
name="grade"
placeholder="Grade"
value={formData.grade}
onChange={handleInputChange}
className="soft-input"
/>

<input
name="credits"
placeholder="Credits"
value={formData.credits}
onChange={handleInputChange}
className="soft-input"
/>

<input
name="duration"
placeholder="Duration"
value={formData.duration}
onChange={handleInputChange}
className="soft-input"
/>

</div>



{/* SKILLS */}

<div>

<h2 className="font-semibold mb-3 flex items-center">
<Award className="w-4 h-4 mr-2"/>
Skills
</h2>

<div className="flex space-x-2">

<input
value={currentSkill}
onChange={(e)=>setCurrentSkill(e.target.value)}
onKeyDown={(e)=>{
if(e.key==="Enter"){
e.preventDefault();
addSkill();
}
}}
placeholder="Add skill"
className="soft-input"
/>

<button type="button" onClick={addSkill} className="soft-button-primary px-3 py-2">
<Plus/>
</button>

</div>

<div className="flex flex-wrap gap-2 mt-3">

{skills.map(skill=>(
<span key={skill} className="badge badge-info inline-flex items-center gap-1">

{skill}

<button type="button" onClick={()=>removeSkill(skill)}>
<X/>
</button>

</span>
))}

</div>

</div>



{/* FILE */}

<div>

<h2 className="font-semibold mb-3 flex items-center">
<FileText className="w-4 h-4 mr-2"/>
Certificate File
</h2>

<input type="file" onChange={handleFileSelect} className="soft-input" />

{selectedFile && (
<p className="text-sm">
{selectedFile.name}
</p>
)}

</div>



<button
type="submit"
disabled={submitting}
className="soft-button-primary px-6 py-2"
>

{submitting ? "Issuing..." : "Issue Certificate"}

</button>


</form>

</div>

);

};

export default UploadCertificate;
