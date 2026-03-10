import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader,
  Calendar,
  Fingerprint,
  BadgeCheck,
  Share2,
  Download,
  TrendingUp
} from "lucide-react";

import { getStudentCertificates } from "../../utils/contract";

const StudentDashboard = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [certificates,setCertificates] = useState([]);
  const [wallet,setWallet] = useState("");

  const [stats,setStats] = useState({
    total:0,
    verified:0,
    revoked:0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(()=>{

    loadCertificates();

  },[]);



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

      setCertificates(certs.slice(0,4));
      setNotifications(
        certs.slice(0, 5).map((c) => ({
          id: c.id,
          text: c.revoked
            ? `${c.course} certificate was marked revoked`
            : `${c.course} certificate is active and verified`,
          issuedAt: c.issuedAt,
          revoked: c.revoked
        }))
      );

      setStats({
        total:certs.length,
        verified,
        revoked
      });

      if(certs.length>0){
        setWallet(certs[0].student);
      }

    }catch(err){

      console.error(err);

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
  Student Dashboard
  </h1>



  {/* STATS */}

  <div className="grid md:grid-cols-3 gap-6">

    <StatCard
      title="Certificates"
      value={stats.total}
      icon={FileText}
    />

    <StatCard
      title="Verified"
      value={stats.verified}
      icon={CheckCircle}
    />

    <StatCard
      title="Revoked"
      value={stats.revoked}
      icon={XCircle}
    />

  </div>



  {/* QUICK ACTIONS */}

  <div className="grid md:grid-cols-3 gap-4">

    <Action
      title="View Certificates"
      icon={Award}
      onClick={()=>navigate("/student/records")}
    />

    <Action
      title="Share Certificate"
      icon={Share2}
      onClick={()=>navigate("/student/share")}
    />

    <Action
      title="Verify Certificate"
      icon={CheckCircle}
      onClick={()=>navigate("/verify")}
    />

  </div>



  {/* RECENT CERTIFICATES */}

  <div>

  <div className="flex justify-between mb-4">

  <h2 className="font-bold">
  Recent Certificates
  </h2>

  <button
  onClick={()=>navigate("/student/records")}
  className="text-blue-600 text-sm"
  >
  View All
  </button>

  </div>



  {certificates.length===0 ?(

    <div className="bg-white p-8 rounded-xl shadow text-center">

      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3"/>

      <p className="text-gray-500">
      No certificates issued yet
      </p>

    </div>

  ):(

    <div className="space-y-3">

    {certificates.map(cert=>(

      <div
      key={cert.id}
      className="panel-card p-4 md:p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
      >

      <div className="min-w-0">

      <p className="font-bold text-slate-900 truncate">
      {cert.course}
      </p>

      <p className="text-sm text-slate-600 truncate">
      {cert.instituteName}
      </p>

      <p className="text-xs text-gray-400 flex items-center mt-1">

      <Calendar className="w-3 h-3 mr-1"/>

      {cert.issuedAt.toLocaleDateString()}

      </p>
      <p className="mono-wrap mt-1">ID: {cert.id}</p>

      </div>



      <div className="flex items-center flex-wrap gap-2 md:gap-3">

      {!cert.revoked ?(

        <span className="status-ok">

        <BadgeCheck className="w-4 h-4 mr-1"/>

        Verified

        </span>

      ):(
        <span className="status-warn">
        Revoked
        </span>
      )}



      <a
      href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600"
      >

      <ExternalLink className="w-4 h-4"/>

      </a>
      <button
      onClick={()=>navigate(`/certificate/${cert.id}`)}
      className="soft-button-muted text-xs"
      >
      Details
      </button>

      </div>


      </div>

    ))}

    </div>

  )}

  </div>

  <div className="panel-card p-5">
    <h2 className="font-bold text-slate-900 mb-3">Notifications</h2>
    {notifications.length === 0 ? (
      <p className="text-sm text-slate-500">No notifications yet.</p>
    ) : (
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-xl border border-slate-200 p-3">
            <p className={`text-sm ${n.revoked ? "text-rose-700" : "text-emerald-700"}`}>{n.text}</p>
            <p className="text-xs text-slate-500 mt-1">{n.issuedAt.toLocaleString()}</p>
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

  <div className="panel-card p-6">

  <div className="flex justify-between">

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

  </div>

  );

};



const Action = ({title,icon:Icon,onClick})=>{

  return(

  <button
  onClick={onClick}
  className="panel-card p-4 flex items-center space-x-3 hover:shadow-md transition"
  >

  <Icon className="w-5 h-5 text-blue-600"/>

  <span>
  {title}
  </span>

  </button>

  );

};

export default StudentDashboard;
