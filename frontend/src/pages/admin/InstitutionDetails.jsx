import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContract } from "../../utils/contract";

import {
  Building2,
  Mail,
  Globe,
  Users,
  Award,
  ArrowLeft,
  User,
  Phone,
  Calendar,
  FileText,
  Hash,
  BadgeCheck
} from "lucide-react";

const InstitutionDetails = () => {

  const { address } = useParams();
  const navigate = useNavigate();

  const [loading,setLoading] = useState(true);
  const [institute,setInstitute] = useState(null);

  useEffect(()=>{
    loadInstitute();
  },[]);

  const loadInstitute = async () => {

    try{

      const contract = await getContract();

      const basic = await contract.getInstituteBasicInfo(address);
      const contact = await contract.getInstituteContactInfo(address);
      const details = await contract.getInstituteDetails(address);
      const social = await contract.getInstituteSocialInfo(address);

      setInstitute({

        address: address,

        name: basic[0],
        id: basic[1],
        email: basic[2],
        website: basic[3],
        active: basic[4],
        registeredAt: new Date(basic[5].toNumber()*1000),
        certificates: basic[6].toNumber(),

        contactPerson: contact[0],
        contactEmail: contact[1],
        contactPhone: contact[2],
        contactPosition: contact[3],

        establishedYear: details[0].toNumber(),
        accreditation: details[1],
        description: details[2],
        motto: details[3],
        students: details[4].toNumber(),
        faculty: details[5].toNumber(),
        programs: details[6].toNumber(),

        twitter: social[0],
        linkedin: social[1],
        taxId: social[2],
        registrationNumber: social[3]

      });

      setLoading(false);

    }catch(err){

      console.error("Load institute error:",err);
      setLoading(false);

    }

  };

  if(loading){
    return(
      <div className="flex justify-center items-center h-64">
        Loading institute details...
      </div>
    )
  }

  if(!institute){
    return(
      <div className="p-10">
        Institute not found
      </div>
    )
  }

  return(

    <div className="space-y-8">

      <button
        onClick={()=>navigate("/admin/institutions")}
        className="flex items-center text-blue-600"
      >
        <ArrowLeft className="w-4 h-4 mr-2"/>
        Back
      </button>


      <div className="bg-white rounded-2xl shadow-xl p-8">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center space-x-4">

            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Building2 className="text-white w-8 h-8"/>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{institute.name}</h1>

              <p className="text-gray-500 text-sm">
                Wallet: {institute.address.slice(0,6)}...{institute.address.slice(-4)}
              </p>

            </div>

          </div>

          {institute.active ? (
            <div className="flex items-center text-green-600">
              <BadgeCheck className="w-5 h-5 mr-1"/>
              Active
            </div>
          ) : (
            <div className="text-red-600">
              Inactive
            </div>
          )}

        </div>



        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-blue-50 p-4 rounded-xl">
            <Users className="w-5 h-5 text-blue-600 mb-1"/>
            <p className="text-sm text-gray-500">Students</p>
            <p className="text-xl font-bold">{institute.students}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            <Award className="w-5 h-5 text-green-600 mb-1"/>
            <p className="text-sm text-gray-500">Certificates</p>
            <p className="text-xl font-bold">{institute.certificates}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-600 mb-1"/>
            <p className="text-sm text-gray-500">Established</p>
            <p className="text-xl font-bold">{institute.establishedYear || "-"}</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl">
            <FileText className="w-5 h-5 text-orange-600 mb-1"/>
            <p className="text-sm text-gray-500">Programs</p>
            <p className="text-xl font-bold">{institute.programs}</p>
          </div>

        </div>



        {/* BASIC INFO */}

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          <div className="bg-gray-50 p-4 rounded-xl">
            <Mail className="w-4 h-4 inline mr-2"/>
            {institute.email || "-"}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <Globe className="w-4 h-4 inline mr-2"/>
            {institute.website || "-"}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <Hash className="w-4 h-4 inline mr-2"/>
            Institute ID: {institute.id}
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            Registered: {institute.registeredAt?.toLocaleDateString()}
          </div>

        </div>



        {/* CONTACT */}

        <div className="bg-gray-50 rounded-xl p-6 mb-6">

          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <User className="inline w-4 h-4 mr-2"/>
              {institute.contactPerson || "-"}
            </div>

            <div>
              <Mail className="inline w-4 h-4 mr-2"/>
              {institute.contactEmail || "-"}
            </div>

            <div>
              <Phone className="inline w-4 h-4 mr-2"/>
              {institute.contactPhone || "-"}
            </div>

            <div>
              Position: {institute.contactPosition || "-"}
            </div>

          </div>

        </div>



        {/* DESCRIPTION */}

        <div className="bg-gray-50 rounded-xl p-6 mb-6">

          <h2 className="text-lg font-semibold mb-4">Institute Details</h2>

          <p className="mb-2"><b>Accreditation:</b> {institute.accreditation || "-"}</p>
          <p className="mb-2"><b>Motto:</b> {institute.motto || "-"}</p>
          <p className="mb-2"><b>Description:</b> {institute.description || "-"}</p>

        </div>



        {/* LEGAL */}

        <div className="bg-gray-50 rounded-xl p-6">

          <h2 className="text-lg font-semibold mb-4">Legal & Social</h2>

          <p><b>Twitter:</b> {institute.twitter || "-"}</p>
          <p><b>LinkedIn:</b> {institute.linkedin || "-"}</p>
          <p><b>Tax ID:</b> {institute.taxId || "-"}</p>
          <p><b>Registration Number:</b> {institute.registrationNumber || "-"}</p>

        </div>

      </div>

    </div>

  )

};

export default InstitutionDetails;