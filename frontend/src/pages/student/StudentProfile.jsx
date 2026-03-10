import React, { useEffect, useState } from "react";
import { Camera, Loader, Save, Award } from "lucide-react";
import { getContract, getStudentCertificates } from "../../utils/contract";
import { getMyStudentRegistryProfile, getProfile, saveProfile, uploadAvatar } from "../../utils/profileApi";

const defaultProfile = {
  displayName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  bio: "",
  avatarUrl: ""
};

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallet, setWallet] = useState("");
  const [profile, setProfile] = useState(defaultProfile);
  const [certCount, setCertCount] = useState(0);
  const [registryProfile, setRegistryProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        setWallet(signer);

        const loaded = await getProfile("student", signer);
        if (loaded) setProfile((prev) => ({ ...prev, ...loaded }));
        const registry = await getMyStudentRegistryProfile();
        setRegistryProfile(registry);

        const certs = await getStudentCertificates(signer);
        setCertCount(certs.length);
      } catch (e) {
        console.error("Failed to load student profile", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(file);
      setProfile((p) => ({ ...p, avatarUrl: res.url }));
    } catch (err) {
      alert(err.message);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const saved = await saveProfile("student", wallet, profile);
      setProfile((p) => ({ ...p, ...saved }));
      localStorage.setItem(`student_profile_${wallet}`, JSON.stringify(saved));
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { role: "student", name: saved.displayName || "Student", avatarUrl: saved.avatarUrl || "" } }));
      alert("Profile saved");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="page-shell">
      <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Student Profile</h1>

      <div className="panel-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold">
                {(profile.displayName || "S").charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow cursor-pointer">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={onAvatar} />
            </label>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg">{profile.displayName || "Student"}</p>
            <p className="text-xs text-gray-500 font-mono break-all">{wallet}</p>
            <p className="text-xs text-gray-500 inline-flex items-center mt-1"><Award className="w-3 h-3 mr-1" /> {certCount} certificates</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Display Name" name="displayName" value={profile.displayName} onChange={onChange} />
          <Input label="Email" name="email" value={profile.email} onChange={onChange} />
          <Input label="First Name" name="firstName" value={profile.firstName} onChange={onChange} />
          <Input label="Last Name" name="lastName" value={profile.lastName} onChange={onChange} />
          <Input label="Phone" name="phone" value={profile.phone} onChange={onChange} />
          <Input label="Location" name="location" value={profile.location} onChange={onChange} />
          <Input label="Website" name="website" value={profile.website} onChange={onChange} />
        </div>

        {registryProfile ? (
          <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800 mb-2">Institute-Managed Academic Identity (Read Only)</p>
            <div className="grid md:grid-cols-2 gap-3">
              <Readonly label="Student ID / USN" value={registryProfile.studentId} />
              <Readonly label="Department" value={registryProfile.department} />
              <Readonly label="Section" value={registryProfile.section} />
              <Readonly label="Semester" value={registryProfile.semester} />
              <Readonly label="Batch Year" value={registryProfile.batchYear} />
              <Readonly label="Registered Wallet" value={registryProfile.walletAddress} mono />
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <label className="text-sm text-gray-600">Bio</label>
          <textarea name="bio" value={profile.bio} onChange={onChange} rows={3} className="soft-input mt-1" />
        </div>

        <button onClick={onSave} disabled={saving} className="mt-4 soft-button-primary">
          {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Profile
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input {...props} className="soft-input mt-1" />
  </div>
);

const Readonly = ({ label, value, mono = false }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <div className={`soft-input mt-1 bg-slate-100 ${mono ? "font-mono text-xs break-all" : ""}`}>{value || "N/A"}</div>
  </div>
);

export default StudentProfile;
