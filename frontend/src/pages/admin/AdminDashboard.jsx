import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Award,
  Shield,
  PlusCircle,
  Settings,
  BarChart3,
  Loader,
  Activity,
  Server,
  Clock
} from "lucide-react";

import { getContract } from "../../utils/contract";

const AdminDashboard = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);

  const [stats,setStats] = useState({
    totalInstitutes:0,
    totalStudents:0,
    totalCertificates:0,
    activeInstitutes:0,
    pendingInstitutes:0
  });

  const [recentActivity,setRecentActivity] = useState([]);

  useEffect(()=>{

    loadDashboardData();

  },[]);


  const loadDashboardData = async ()=>{

    try{

      setLoading(true);

      const contract = await getContract();

      const instituteAddresses = await contract.getAllInstitutes();

      let totalStudents = 0;
      let totalCertificates = 0;
      let activeCount = 0;

      const recent = [];

      for(let i=0;i<instituteAddresses.length;i++){

        try{

          const addr = instituteAddresses[i];

          const basicInfo = await contract.getInstituteBasicInfo(addr);

          const details = await contract.getInstituteDetails(addr);

          const studentCount = Number(details[4]) || 0;

          const certCount = Number(basicInfo[6]) || 0;

          totalStudents += studentCount;

          totalCertificates += certCount;

          if(basicInfo[4]) activeCount++;

          if(i < 5){

            recent.push({
              id:i,
              title:"Institute Registered",
              description:basicInfo[0],
              time:new Date(Number(basicInfo[5]) * 1000).toLocaleDateString()
            });

          }

        }catch(err){

          console.log("Institute loading error:",err);

        }

      }

      setStats({

        totalInstitutes: instituteAddresses.length,

        totalStudents,

        totalCertificates,

        activeInstitutes: activeCount,

        pendingInstitutes: instituteAddresses.length - activeCount

      });

      setRecentActivity(recent);

    }catch(err){

      console.error("Dashboard error:",err);

    }finally{

      setLoading(false);

    }

  };


  if(loading){

    return(

      <div className="flex items-center justify-center min-h-[60vh]">

        <div className="text-center">

          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4"/>

          <p className="text-gray-600">
            Loading dashboard...
          </p>

        </div>

      </div>

    );

  }


  return(

  <div className="space-y-8">


  {/* HEADER */}

  <div className="relative">

    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"/>

    <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">

      <div className="flex items-start justify-between">

        <div>

          <div className="flex items-center space-x-3 mb-4">

            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">

              <Shield className="w-8 h-8 text-white"/>

            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">

              Admin Dashboard

            </h1>

          </div>

          <p className="text-gray-600">

            Monitor blockchain certificate platform and manage institutes.

          </p>

        </div>


        <div className="flex items-center space-x-2 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40">

          <Activity className="w-4 h-4 text-green-500"/>

          <span className="text-sm text-gray-700">

            System Online

          </span>

        </div>

      </div>

    </div>

  </div>



  {/* STATS */}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    <StatCard
      title="Total Institutes"
      value={stats.totalInstitutes}
      subtitle={`${stats.activeInstitutes} active`}
      icon={Building2}
    />

    <StatCard
      title="Total Students"
      value={stats.totalStudents.toLocaleString()}
      subtitle="Across institutes"
      icon={Users}
    />

    <StatCard
      title="Certificates Issued"
      value={stats.totalCertificates.toLocaleString()}
      subtitle="Stored on blockchain"
      icon={Award}
    />

    <StatCard
      title="System Health"
      value="100%"
      subtitle="Operational"
      icon={Server}
    />

  </div>



  {/* QUICK ACTIONS */}

  <div>

    <h2 className="text-xl font-bold text-gray-800 mb-6">

      Quick Actions

    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <ActionCard
        title="Register Institute"
        icon={PlusCircle}
        onClick={()=>navigate("/admin/register-institute")}
      />

      <ActionCard
        title="Manage Institutions"
        icon={Building2}
        onClick={()=>navigate("/admin/institutions")}
      />

      <ActionCard
        title="System Settings"
        icon={Settings}
        onClick={()=>navigate("/admin/settings")}
      />

      <ActionCard
        title="Analytics"
        icon={BarChart3}
        onClick={()=>navigate("/admin/analytics")}
      />

    </div>

  </div>



  {/* RECENT ACTIVITY */}

  <div>

    <h2 className="text-xl font-bold text-gray-800 mb-4">

      Recent Activity

    </h2>

    <div className="bg-white rounded-xl shadow p-6">

      {recentActivity.length === 0 ? (

        <p className="text-gray-500">
          No recent activity
        </p>

      ) : (

        recentActivity.map(item=>(
          <div
            key={item.id}
            className="flex items-center justify-between border-b py-3"
          >

            <div>

              <p className="font-medium">
                {item.title}
              </p>

              <p className="text-sm text-gray-500">
                {item.description}
              </p>

            </div>

            <div className="flex items-center text-gray-400 text-sm">

              <Clock className="w-4 h-4 mr-1"/>

              {item.time}

            </div>

          </div>
        ))

      )}

    </div>

  </div>


  </div>

  );

};



const StatCard = ({title,value,subtitle,icon:Icon}) => (

  <div className="bg-white rounded-2xl shadow-xl p-6">

    <div className="flex items-start justify-between">

      <div>

        <p className="text-sm text-gray-500">
          {title}
        </p>

        <p className="text-3xl font-bold text-gray-800">
          {value}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          {subtitle}
        </p>

      </div>

      <Icon className="w-6 h-6 text-blue-600"/>

    </div>

  </div>

);



const ActionCard = ({title,icon:Icon,onClick}) => (

  <button
    onClick={onClick}
    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-6 text-left"
  >

    <Icon className="w-6 h-6 mb-4 text-blue-600"/>

    <h3 className="font-bold text-gray-800">
      {title}
    </h3>

  </button>

);


export default AdminDashboard;