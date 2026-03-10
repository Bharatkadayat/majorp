import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  ArrowRight,
  Loader,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
  Tag,
  Fingerprint
} from "lucide-react";

import { registerInstitute } from "../../utils/contract";

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="mb-10 panel-card p-5">
    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center border-b border-slate-200 pb-2">
      <Icon className="w-5 h-5 mr-2 text-blue-600" />
      {title}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const InputField = ({ label, name, icon: Icon, formData, handleChange, required=false }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <div className="relative mt-1">
      {Icon && (
        <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
      )}

      <input
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        className={`soft-input py-2 ${
          Icon ? "pl-9" : "pl-3"
        } pr-3`}
      />
    </div>
  </div>
);

const TextAreaField = ({ label, name, formData, handleChange }) => (
  <div className="md:col-span-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>

    <textarea
      name={name}
      value={formData[name] || ""}
      onChange={handleChange}
      rows="3"
      className="soft-input p-3 mt-1"
    />
  </div>
);

const RegisterInstitute = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [successData,setSuccessData] = useState(null);
  const [error,setError] = useState(null);

  const [formData,setFormData] = useState({

    name:"",
    id:"",
    type:"University",
    walletAddress:"",

    email:"",
    phone:"",
    website:"",
    address:"",

    contactPerson:"",
    contactEmail:"",
    contactPhone:"",
    contactPosition:"",

    establishedYear:"",
    accreditation:"",
    description:"",
    motto:"",

    studentCount:"",
    facultyCount:"",
    programCount:"",

    twitter:"",
    linkedin:"",

    taxId:"",
    registrationNumber:""

  });

  const handleChange=(e)=>{
    const {name,value}=e.target;
    setFormData(prev=>({...prev,[name]:value}));
  };

  const validate=()=>{

    if(!formData.name) return "Institute name required";
    if(!formData.id) return "Institute ID required";
    if(!formData.email) return "Email required";
    if(!formData.walletAddress) return "Wallet address required";

    if(!formData.walletAddress.startsWith("0x"))
      return "Invalid wallet address";

    return null;
  };

  const handleSubmit=async(e)=>{

    e.preventDefault();

    const validationError = validate();

    if(validationError){
      setError(validationError);
      return;
    }

    try{

      setLoading(true);
      setError(null);

      const payload={

        name:formData.name,
        id:formData.id,
        email:formData.email,
        website:formData.website,
        walletAddress:formData.walletAddress,

        contactPerson:formData.contactPerson,
        contactEmail:formData.contactEmail,
        contactPhone:formData.contactPhone,
        contactPosition:formData.contactPosition,

        establishedYear:Number(formData.establishedYear || 0),
        accreditation:formData.accreditation,
        description:formData.description,
        motto:formData.motto,

        studentCount:Number(formData.studentCount || 0),
        facultyCount:Number(formData.facultyCount || 0),
        programCount:Number(formData.programCount || 0),

        twitter:formData.twitter,
        linkedin:formData.linkedin,
        taxId:formData.taxId,
        registrationNumber:formData.registrationNumber

      };

      const result = await registerInstitute(payload);

      setSuccess(true);
      setSuccessData({
        wallet: payload.walletAddress,
        txHash: result.hash
      });

      setTimeout(()=>{
        navigate("/admin/institutions");
      },3000);

    }catch(err){

      console.error(err);
      const msg = String(err?.reason || err?.data?.message || err?.message || "");
      if (msg.toLowerCase().includes("institute already exists")) {
        setError("This institute wallet is already registered on-chain. Use a different wallet address.");
      } else {
        setError(msg || "Failed to register institute");
      }

    }finally{

      setLoading(false);

    }

  };

  return(

  <div className="page-shell py-8">

  <h1 className="page-title text-center hero-title-animated">
  Register New Institute
  </h1>

{success && (

<div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center">
<CheckCircle className="w-5 h-5 mr-2"/>
<div>
<p>Institute registered successfully</p>
{successData && <p className="text-xs mt-1 break-all">Wallet: {successData.wallet}</p>}
{successData && <p className="text-xs break-all">TX: {successData.txHash}</p>}
</div>
</div>

)}

{error && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
<AlertCircle className="w-5 h-5 mr-2"/>
{error}
</div>

)}

<form onSubmit={handleSubmit} className="panel-card p-6 md:p-8">

<FormSection title="Basic Information" icon={Building2}>

<InputField label="Institute Name" name="name" required icon={Building2} formData={formData} handleChange={handleChange}/>
<InputField label="Institute ID" name="id" required icon={Hash} formData={formData} handleChange={handleChange}/>
<InputField label="Type" name="type" icon={Tag} formData={formData} handleChange={handleChange}/>
<InputField label="Wallet Address" name="walletAddress" required icon={Fingerprint} formData={formData} handleChange={handleChange}/>

</FormSection>

<FormSection title="Contact Information" icon={Mail}>

<InputField label="Email" name="email" required icon={Mail} formData={formData} handleChange={handleChange}/>
<InputField label="Phone" name="phone" icon={Phone} formData={formData} handleChange={handleChange}/>
<InputField label="Website" name="website" icon={Globe} formData={formData} handleChange={handleChange}/>
<InputField label="Address" name="address" icon={MapPin} formData={formData} handleChange={handleChange}/>

</FormSection>

<FormSection title="Contact Person" icon={User}>

<InputField label="Contact Person" name="contactPerson" icon={User} formData={formData} handleChange={handleChange}/>
<InputField label="Contact Email" name="contactEmail" icon={Mail} formData={formData} handleChange={handleChange}/>
<InputField label="Contact Phone" name="contactPhone" icon={Phone} formData={formData} handleChange={handleChange}/>
<InputField label="Contact Position" name="contactPosition" icon={User} formData={formData} handleChange={handleChange}/>

</FormSection>

<FormSection title="Institution Details" icon={BookOpen}>

<InputField label="Established Year" name="establishedYear" icon={Calendar} formData={formData} handleChange={handleChange}/>
<InputField label="Accreditation" name="accreditation" formData={formData} handleChange={handleChange}/>
<InputField label="Student Count" name="studentCount" icon={Users} formData={formData} handleChange={handleChange}/>
<InputField label="Faculty Count" name="facultyCount" icon={Users} formData={formData} handleChange={handleChange}/>
<InputField label="Program Count" name="programCount" icon={BookOpen} formData={formData} handleChange={handleChange}/>

<TextAreaField label="Motto" name="motto" formData={formData} handleChange={handleChange}/>
<TextAreaField label="Description" name="description" formData={formData} handleChange={handleChange}/>

</FormSection>

<FormSection title="Social & Legal" icon={Tag}>

<InputField label="Twitter" name="twitter" formData={formData} handleChange={handleChange}/>
<InputField label="LinkedIn" name="linkedin" formData={formData} handleChange={handleChange}/>
<InputField label="Tax ID" name="taxId" formData={formData} handleChange={handleChange}/>
<InputField label="Registration Number" name="registrationNumber" formData={formData} handleChange={handleChange}/>

</FormSection>

<button
type="submit"
className="soft-button-primary px-6 py-3"
>

{loading ? (
<>
<Loader className="animate-spin w-4 h-4 mr-2"/>
Registering...
</>
) : (
<>
Register Institute
<ArrowRight className="w-4 h-4 ml-2"/>
</>
)}

</button>

</form>

</div>

);

};

export default RegisterInstitute;
