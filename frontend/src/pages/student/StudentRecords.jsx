import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Loader,
  Search,
  ChevronRight,
  ExternalLink
} from "lucide-react";

import { getStudentCertificates } from "../../utils/contract";

const StudentRecords = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [certificates,setCertificates] = useState([]);
  const [filteredCerts,setFilteredCerts] = useState([]);
  const [searchTerm,setSearchTerm] = useState("");

  const [stats,setStats] = useState({
    total:0,
    verified:0,
    revoked:0
  });

  useEffect(()=>{

    loadCertificates();

  },[]);

  useEffect(()=>{

    const filtered = certificates.filter(cert =>
      cert.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.instituteName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCerts(filtered);

  },[searchTerm,certificates]);



  const loadCertificates = async()=>{

    try{

      setLoading(true);

      const certs = await getStudentCertificates();

      let verified = 0;
      let revoked = 0;

      certs.forEach(c=>{

        if(c.revoked){
          revoked++;
        }else{
          verified++;
        }

      });

      setCertificates(certs);
      setFilteredCerts(certs);

      setStats({
        total:certs.length,
        verified,
        revoked
      });

    }catch(err){

      console.error("Error loading certificates:",err);

    }finally{

      setLoading(false);

    }

  };



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
  My Certificates
  </h1>



  {/* STATS */}

  <div className="grid md:grid-cols-3 gap-4">

  <Stat title="Total Certificates" value={stats.total}/>
  <Stat title="Verified" value={stats.verified}/>
  <Stat title="Revoked" value={stats.revoked}/>

  </div>



  {/* SEARCH */}

  <div className="relative panel-card p-3">

  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>

  <input
  type="text"
  placeholder="Search certificates..."
  value={searchTerm}
  onChange={(e)=>setSearchTerm(e.target.value)}
  className="soft-input pl-9"
  />

  </div>



  {/* CERTIFICATE LIST */}

  {filteredCerts.length===0 ?(

    <div className="bg-white p-8 rounded-xl shadow text-center">

      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3"/>

      <p className="text-gray-500">
      No certificates found
      </p>

    </div>

  ):(

    <div className="space-y-4">

    {filteredCerts.map(cert=>(

      <div
      key={cert.id}
      className="panel-card p-5 md:p-6 flex flex-col md:flex-row md:justify-between gap-4"
      >

      <div className="min-w-0">

      <p className="font-bold text-slate-900 truncate">
      {cert.course}
      </p>

      <p className="text-sm text-slate-600 truncate">
      {cert.instituteName}
      </p>

      <p className="text-xs text-gray-400">
      Issued: {cert.issuedAt.toLocaleDateString()}
      </p>
      <p className="text-xs text-gray-400 break-all">
      ID: {cert.id}
      </p>

      <p className="text-xs mt-1">

      {cert.revoked ?(

        <span className="text-red-500">
        Revoked
        </span>

      ):(
        <span className="text-green-600">
        Verified
        </span>
      )}

      </p>

      </div>



      <div className="flex items-center flex-wrap gap-2 md:gap-4">

      <a
      href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600"
      >

      <ExternalLink className="w-5 h-5"/>

      </a>

      <button
      onClick={()=>navigate(`/certificate/${cert.id}`)}
      className="soft-button-muted text-sm"
      >

      Details

      </button>

      </div>


      </div>

    ))}

    </div>

  )}

  </div>

  );

};



const Stat = ({title,value})=>(

  <div className="panel-card p-4">

  <p className="text-sm text-gray-500">
  {title}
  </p>

  <p className="text-xl font-bold">
  {value}
  </p>

  </div>

);

export default StudentRecords;
