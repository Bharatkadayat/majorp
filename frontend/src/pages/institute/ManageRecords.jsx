import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, Award, Calendar, Eye, XCircle } from "lucide-react";
import { getIssuerCertificates, getContract } from "../../utils/contract";

const ManageRecords = () => {
  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [certificates,setCertificates] = useState([]);
  const [error,setError] = useState(null);

  useEffect(()=>{

    loadCertificates();

  },[]);



  const loadCertificates = async()=>{

    try{

      setLoading(true);

      const certs = await getIssuerCertificates();

      setCertificates(certs);

    }catch(err){

      console.error(err);
      setError("Failed to load certificates");

    }finally{

      setLoading(false);

    }

  };



  const revokeCertificate = async(id)=>{

    try{

      const contract = await getContract();

      const tx = await contract.revokeCertificate(id);

      await tx.wait();

      alert("Certificate revoked successfully");

      loadCertificates();

    }catch(err){

      console.error(err);
      alert("Failed to revoke certificate");

    }

  };



  if(loading){

    return(

      <div className="flex justify-center items-center min-h-[60vh]">

        <Loader className="w-10 h-10 animate-spin text-blue-600"/>

      </div>

    );

  }



  if(error){

    return(

      <div className="text-center p-10 text-red-500">

        {error}

      </div>

    );

  }



  return(

  <div className="page-shell">

  <h1 className="page-title hero-title-animated text-2xl md:text-3xl">
  Issued Certificates
  </h1>



  {certificates.length === 0 ?(

    <div className="bg-white p-8 rounded-xl shadow text-center">

      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3"/>

      <p className="text-gray-500">
        No certificates issued yet
      </p>

    </div>

  ):(

    <div className="space-y-4">

      {certificates.map(cert=>(
      
      <div
      key={cert.id}
      className="panel-card p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >

      <div className="min-w-0">

      <p className="font-bold break-words">
      {cert.course}
      </p>

      <p className="text-sm text-gray-500">
      {cert.studentName}
      </p>

      <p className="text-xs text-gray-400 flex items-center mt-1">
      <Calendar className="w-3 h-3 mr-1"/>
      {cert.issuedAt.toLocaleDateString()}
      </p>
      <p className="mono-wrap mt-1">ID: {cert.id}</p>

      {cert.grade && (
      <p className="text-xs text-gray-500">
      Grade: {cert.grade}
      </p>
      )}

      </div>



      <div className="flex items-center flex-wrap gap-3">

      <a
      href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600"
      >

      <Eye className="w-5 h-5"/>

      </a>
      <button
      onClick={()=>navigate(`/certificate/${cert.id}`)}
      className="soft-button-muted text-xs"
      >
      Details
      </button>


      {!cert.revoked && (

      <button
      onClick={()=>revokeCertificate(cert.id)}
      className="soft-button-muted text-red-600"
      >

      <XCircle className="w-5 h-5"/>

      </button>

      )}

      {cert.revoked && (

      <span className="text-xs text-red-500">
      Revoked
      </span>

      )}

      </div>


      </div>

      ))}

    </div>

  )}

  </div>

  );

};

export default ManageRecords;
