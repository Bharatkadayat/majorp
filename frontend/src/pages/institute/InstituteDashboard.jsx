import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader,
  Calendar,
  Fingerprint,
  TrendingUp,
  Building2,
  Users,
  Mail,
  Phone,
  Globe,
  Hash,
  User,
  BookOpen
} from "lucide-react";

import {
  getContract,
  getIssuerCertificates,
  getCertificateActivity
} from "../../utils/contract";

const InstituteDashboard = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  const [instituteData,setInstituteData] = useState({
    name:"",
    id:"",
    email:"",
    website:"",
    walletAddress:"",
    studentCount:0,
    certificatesIssued:0,
    facultyCount:0,
    programCount:0,
    establishedYear:0,
    accreditation:"",
    description:"",
    motto:"",
    contactPerson:"",
    contactEmail:"",
    contactPhone:"",
    contactPosition:"",
    twitter:"",
    linkedin:"",
    isActive:false,
    registeredAt:null
  });

  const [recentCertificates,setRecentCertificates] = useState([]);
  const [activity,setActivity] = useState([]);

  const [stats,setStats] = useState({
    totalCertificates:0,
    verifiedCertificates:0,
    revokedCertificates:0,
    totalStudents:0
  });

  useEffect(()=>{
    loadInstituteData();
  },[]);

  const loadInstituteData = async()=>{

    try{

      setLoading(true);

      const contract = await getContract();

      const signer = await contract.signer.getAddress();

      console.log("Loading institute:", signer);

      const owner = await contract.owner();

      if(owner.toLowerCase() === signer.toLowerCase()){
        navigate("/admin");
        return;
      }

      const basic = await contract.getInstituteBasicInfo(signer);

      if(basic[5].toNumber() === 0){
        setError("This wallet is not registered as institute");
        return;
      }

      const contact = await contract.getInstituteContactInfo(signer);
      const details = await contract.getInstituteDetails(signer);
      const social = await contract.getInstituteSocialInfo(signer);

      const certificates = await getIssuerCertificates(signer);

      let verified = 0;
      let revoked = 0;
      certificates.forEach((cert) => {
        if (cert.revoked) revoked++;
        else verified++;
      });
      const recent = certificates.slice(0, 5);
      const recentActivity = await getCertificateActivity(8);

      setInstituteData({

        name:basic[0],
        id:basic[1],
        email:basic[2],
        website:basic[3],
        walletAddress:signer,

        studentCount:details[4].toNumber(),
        certificatesIssued:basic[6].toNumber(),
        facultyCount:details[5].toNumber(),
        programCount:details[6].toNumber(),

        establishedYear:details[0].toNumber(),
        accreditation:details[1],
        description:details[2],
        motto:details[3],

        contactPerson:contact[0],
        contactEmail:contact[1],
        contactPhone:contact[2],
        contactPosition:contact[3],

        twitter:social[0],
        linkedin:social[1],

        isActive:basic[4],
        registeredAt:new Date(basic[5].toNumber()*1000)

      });

      setStats({

        totalCertificates:certificates.length,
        verifiedCertificates:verified,
        revokedCertificates:revoked,
        totalStudents:details[4].toNumber()

      });

      setRecentCertificates(recent);
      setActivity(recentActivity);

    }
    catch(err){

      console.error(err);
      setError("Failed to load institute data");

    }
    finally{

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

  if(error){

    return(

      <div className="text-center p-10 text-red-500">
        {error}
      </div>

    );

  }

  return(

  <div className="space-y-8">

  <div className="bg-white p-6 rounded-xl shadow">

  <h1 className="text-2xl font-bold flex items-center">

  <Building2 className="w-6 h-6 mr-2"/>

  {instituteData.name}

  </h1>

  <p className="text-sm text-gray-500">
  Institute Dashboard
  </p>
  <div className="flex gap-2 mt-3">
    <button onClick={() => navigate("/institute/upload")} className="soft-button-primary text-xs">Issue One</button>
    <button onClick={() => navigate("/institute/batch")} className="soft-button-muted text-xs">Batch Issue</button>
  </div>

  </div>

  <div className="grid md:grid-cols-4 gap-6">

  <StatCard
  title="Certificates"
  value={stats.totalCertificates}
  icon={Award}
  />

  <StatCard
  title="Verified"
  value={stats.verifiedCertificates}
  icon={CheckCircle}
  />

  <StatCard
  title="Revoked"
  value={stats.revokedCertificates}
  icon={XCircle}
  />

  <StatCard
  title="Students"
  value={stats.totalStudents}
  icon={Users}
  />

  </div>

  <div className="bg-white p-6 rounded-xl shadow">

  <h2 className="font-bold mb-4">
  Recent Certificates
  </h2>

  {recentCertificates.length===0?(
  <p className="text-gray-500">No certificates issued</p>
  ):(
  recentCertificates.map((cert,i)=>(
  <div
  key={i}
  className="flex justify-between items-center border-b py-3"
  >

  <div>

  <p className="font-bold">
  {cert.course}
  </p>

  <p className="text-sm text-gray-500">
  {cert.studentName}
  </p>

  </div>

  <a
  href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`}
  target="_blank"
  rel="noreferrer"
  className="text-blue-600"
  >

  <ExternalLink className="w-5 h-5"/>

  </a>
  <button
  onClick={() => navigate(`/certificate/${cert.id}`)}
  className="text-xs text-blue-600"
  >
  Details
  </button>

  </div>
  ))
  )}

  </div>

  <div className="bg-white p-6 rounded-xl shadow">
  <h2 className="font-bold mb-4">
  Recent On-Chain Activity
  </h2>

  {activity.length===0 ? (
    <p className="text-gray-500">No activity yet</p>
  ) : (
    <div className="space-y-3">
    {activity.map((a) => (
      <div key={`${a.txHash}-${a.certificateId}`} className="border rounded-lg p-3">
        <p className="font-semibold text-sm">
          {a.type === "issued" ? "Issued certificate" : "Revoked certificate"}
        </p>
        <p className="text-xs text-gray-500 break-all">Certificate ID: {a.certificateId}</p>
        {a.studentName ? <p className="text-xs text-gray-500">Student: {a.studentName}</p> : null}
        {a.course ? <p className="text-xs text-gray-500">Course: {a.course}</p> : null}
        <p className="text-xs text-gray-500 break-all">TX: {a.txHash}</p>
        {a.timestamp ? <p className="text-xs text-gray-500">At: {a.timestamp.toLocaleString()}</p> : null}
      </div>
    ))}
    </div>
  )}
  </div>

  </div>

  );

};

const StatCard = ({title,value,icon:Icon})=>{

  return(

  <div className="bg-white p-6 rounded-xl shadow flex justify-between">

  <div>

  <p className="text-sm text-gray-500">
  {title}
  </p>

  <p className="text-2xl font-bold">
  {value}
  </p>

  </div>

  <Icon className="w-6 h-6 text-blue-600"/>

  </div>

  );

};

export default InstituteDashboard;
