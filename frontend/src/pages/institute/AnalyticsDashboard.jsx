import React, { useEffect, useState } from "react";
import { Loader, Award, Users, CheckCircle, XCircle } from "lucide-react";
import { getContract } from "../../utils/contract";

const AnalyticsDashboard = () => {

  const [loading,setLoading] = useState(true);

  const [stats,setStats] = useState({
    totalCertificates:0,
    activeCertificates:0,
    revokedCertificates:0,
    totalStudents:0
  });

  useEffect(()=>{

    loadAnalytics();

  },[]);



  const loadAnalytics = async()=>{

    try{

      setLoading(true);

      const contract = await getContract();
      const signer = await contract.signer.getAddress();

      const certIds = [];

      let index = 0;

      // read certificates issued by this institute
      while(true){

        try{

          const id = await contract.issuerCertificates(signer,index);

          certIds.push(id);

          index++;

        }catch{

          break;

        }

      }

      let active = 0;
      let revoked = 0;

      const studentSet = new Set();

      for(let id of certIds){

        try{

          const cert = await contract.certificates(id);

          if(cert.revoked){
            revoked++;
          }else{
            active++;
          }

          if(cert.student){
            studentSet.add(cert.student);
          }

        }catch(e){

          console.log("Certificate load error",e);

        }

      }

      setStats({

        totalCertificates: certIds.length,
        activeCertificates: active,
        revokedCertificates: revoked,
        totalStudents: studentSet.size

      });

    }catch(err){

      console.error(err);

    }finally{

      setLoading(false);

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

  <div className="space-y-8">

  <h1 className="text-2xl font-bold">
  Institute Analytics
  </h1>



  <div className="grid md:grid-cols-4 gap-6">

    <StatCard
      title="Certificates Issued"
      value={stats.totalCertificates}
      icon={Award}
      color="blue"
    />

    <StatCard
      title="Active Certificates"
      value={stats.activeCertificates}
      icon={CheckCircle}
      color="green"
    />

    <StatCard
      title="Revoked Certificates"
      value={stats.revokedCertificates}
      icon={XCircle}
      color="red"
    />

    <StatCard
      title="Students"
      value={stats.totalStudents}
      icon={Users}
      color="purple"
    />

  </div>



  <div className="bg-white p-6 rounded-xl shadow">

  <h2 className="font-bold mb-4">
  Certificate Distribution
  </h2>

  <Bar
  label="Active"
  value={stats.activeCertificates}
  total={stats.totalCertificates}
  color="bg-green-500"
  />

  <Bar
  label="Revoked"
  value={stats.revokedCertificates}
  total={stats.totalCertificates}
  color="bg-red-500"
  />

  </div>

  </div>

  );

};



const StatCard = ({title,value,icon:Icon,color}) =>{

  const colors={
    blue:"text-blue-600",
    green:"text-green-600",
    red:"text-red-600",
    purple:"text-purple-600"
  };

  return(

  <div className="bg-white p-6 rounded-xl shadow">

  <div className="flex justify-between">

  <div>

  <p className="text-sm text-gray-500">
  {title}
  </p>

  <p className="text-2xl font-bold">
  {value}
  </p>

  </div>

  <Icon className={`w-6 h-6 ${colors[color]}`}/>

  </div>

  </div>

  );

};



const Bar = ({label,value,total,color})=>{

  const percent = total === 0 ? 0 : (value / total) * 100;

  return(

  <div className="mb-4">

  <div className="flex justify-between text-sm mb-1">

  <span>{label}</span>

  <span>{value}</span>

  </div>

  <div className="w-full bg-gray-200 rounded h-3">

  <div
  className={`${color} h-3 rounded`}
  style={{width:`${percent}%`}}
  />

  </div>

  </div>

  );

};

export default AnalyticsDashboard;