import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  Users,
  Award,
  Calendar,
  ChevronRight,
  Plus,
  RefreshCw,
  Loader,
  User,
  Twitter,
  Linkedin,
  Fingerprint,
  BookOpen,
  Trash2
} from "lucide-react";

import { getContract } from "../../utils/contract";

const ManageInstitutions = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [institutions,setInstitutions] = useState([]);
  const [searchTerm,setSearchTerm] = useState("");
  const [filterStatus,setFilterStatus] = useState("all");

  const [stats,setStats] = useState({
    total:0,
    active:0,
    inactive:0
  });

  useEffect(()=>{
    loadInstitutions();
  },[]);


  const loadInstitutions = async ()=>{

    try{

      setLoading(true);

      const contract = await getContract();

      const owner = await contract.owner();

      const addresses = await contract.getAllInstitutes();

      const filtered = addresses.filter(
        addr => addr.toLowerCase() !== owner.toLowerCase()
      );

      const list = [];

      let activeCount = 0;
      let inactiveCount = 0;

      for(const addr of filtered){

        const basic = await contract.getInstituteBasicInfo(addr);
        const contact = await contract.getInstituteContactInfo(addr);
        const details = await contract.getInstituteDetails(addr);
        const social = await contract.getInstituteSocialInfo(addr);

        const inst = {

          address: addr,

          name: basic[0],
          id: basic[1],
          email: basic[2],
          website: basic[3],
          isActive: basic[4],
          registeredAt: new Date(basic[5].toNumber()*1000),
          certificatesIssued: basic[6].toNumber(),

          contactPerson: contact[0],
          contactEmail: contact[1],
          contactPhone: contact[2],

          establishedYear: details[0].toNumber(),
          accreditation: details[1],
          description: details[2],
          studentCount: details[4].toNumber(),
          facultyCount: details[5].toNumber(),
          programCount: details[6].toNumber(),

          twitter: social[0],
          linkedin: social[1]

        };

        if(inst.isActive) activeCount++;
        else inactiveCount++;

        list.push(inst);

      }

      setInstitutions(list);

      setStats({
        total:list.length,
        active:activeCount,
        inactive:inactiveCount
      });

    }catch(err){
      console.error(err);
    }
    finally{
      setLoading(false);
    }

  };


  const setInstituteStatus = async(address,status)=>{

    try{

      const contract = await getContract();

      const tx = await contract.setInstituteStatus(address,status);

      await tx.wait();

      loadInstitutions();

    }catch(err){
      console.error(err);
    }

  };


  const filteredInstitutions = institutions.filter(inst=>{

    const matchSearch =
      inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && inst.isActive) ||
      (filterStatus === "inactive" && !inst.isActive);

    return matchSearch && matchFilter;

  });


  if(loading){
    return(
      <div className="flex justify-center items-center h-64">
        <Loader className="w-10 h-10 animate-spin text-blue-600"/>
      </div>
    )
  }


  return(

  <div className="page-shell">


  {/* HEADER */}

  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

    <div>
      <h1 className="page-title hero-title-animated">Manage Institutions</h1>
      <p className="text-gray-500">
        View and manage registered institutes
      </p>
    </div>

    <button
      onClick={()=>navigate("/admin/register-institute")}
      className="soft-button-primary"
    >
      <Plus className="w-4 h-4 mr-2"/>
      Add Institute
    </button>

  </div>



  {/* STATS */}

  <div className="grid md:grid-cols-3 gap-6">

    <div className="panel-card p-6">
      <p className="text-gray-500 text-sm">Total Institutes</p>
      <p className="text-2xl font-bold">{stats.total}</p>
    </div>

    <div className="panel-card p-6">
      <p className="text-gray-500 text-sm">Active</p>
      <p className="text-2xl font-bold text-green-600">{stats.active}</p>
    </div>

    <div className="panel-card p-6">
      <p className="text-gray-500 text-sm">Inactive</p>
      <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
    </div>

  </div>



  {/* SEARCH */}

  <div className="panel-card p-4 flex flex-col md:flex-row gap-3">

    <div className="relative flex-1">

      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>

      <input
        placeholder="Search institute"
        value={searchTerm}
        onChange={e=>setSearchTerm(e.target.value)}
        className="soft-input pl-9"
      />

    </div>

    <select
      value={filterStatus}
      onChange={e=>setFilterStatus(e.target.value)}
      className="soft-input w-full md:w-auto"
    >
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

    <button
      onClick={loadInstitutions}
      className="soft-button-muted"
    >
      <RefreshCw className="w-4 h-4"/>
    </button>

  </div>



  {/* LIST */}

  <div className="space-y-4">

  {filteredInstitutions.map(institute=>(

  <div
    key={institute.address}
    className="panel-card p-6"
  >

  <div className="flex flex-col md:flex-row md:justify-between gap-3">

  <div>

  <h2 className="text-xl font-bold break-words">{institute.name}</h2>

  <p className="text-sm text-gray-500">
  ID: {institute.id}
  </p>

  </div>


  <div className="flex flex-wrap gap-2">

  {institute.isActive ? (

  <button
    onClick={()=>setInstituteStatus(institute.address,false)}
    className="soft-button-muted bg-yellow-100 text-yellow-700 px-3 py-1"
  >
  Deactivate
  </button>

  ):(
  <button
    onClick={()=>setInstituteStatus(institute.address,true)}
    className="soft-button-muted bg-green-100 text-green-700 px-3 py-1"
  >
  Activate
  </button>
  )}

  <button
    onClick={()=>navigate(`/admin/institutions/${institute.address}`)}
    className="soft-button-muted text-blue-700"
  >
  View Details
  <ChevronRight className="w-4 h-4 ml-1"/>
  </button>

  </div>

  </div>


  <div className="grid md:grid-cols-4 gap-4 mt-4 text-sm">

  <div className="flex items-center gap-2">
  <Mail className="w-4 h-4"/>
  <span className="break-all">{institute.email}</span>
  </div>

  <div className="flex items-center gap-2">
  <Phone className="w-4 h-4"/>
  {institute.contactPhone || "-"}
  </div>

  <div className="flex items-center gap-2">
  <Globe className="w-4 h-4"/>
  <span className="break-all">{institute.website || "-"}</span>
  </div>

  <div className="flex items-center gap-2">
  <Fingerprint className="w-4 h-4"/>
  {institute.address.slice(0,6)}...{institute.address.slice(-4)}
  </div>

  </div>


  <div className="grid md:grid-cols-4 gap-4 mt-4 text-center">

  <div>
  <Users className="w-4 h-4 mx-auto"/>
  <p className="text-xs text-gray-500">Students</p>
  <p className="font-bold">{institute.studentCount}</p>
  </div>

  <div>
  <Award className="w-4 h-4 mx-auto"/>
  <p className="text-xs text-gray-500">Certificates</p>
  <p className="font-bold">{institute.certificatesIssued}</p>
  </div>

  <div>
  <Calendar className="w-4 h-4 mx-auto"/>
  <p className="text-xs text-gray-500">Faculty</p>
  <p className="font-bold">{institute.facultyCount}</p>
  </div>

  <div>
  <BookOpen className="w-4 h-4 mx-auto"/>
  <p className="text-xs text-gray-500">Programs</p>
  <p className="font-bold">{institute.programCount}</p>
  </div>

  </div>

  </div>

  ))}

  </div>

  </div>

  );

};

export default ManageInstitutions;
