import React, { useEffect, useState } from "react";
import { Camera, Loader, Save, User, Shield, Building2, Users } from "lucide-react";
import { getContract } from "../../utils/contract";
import { getProfile, saveProfile, uploadAvatar } from "../../utils/profileApi";

const defaultProfile = {
  displayName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  bio: "",
  department: "",
  employeeId: "",
  adminLevel: "Super Admin",
  avatarUrl: ""
};

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [profile, setProfile] = useState(defaultProfile);
  const [stats, setStats] = useState({
    institutionsManaged: 0,
    activeInstitutes: 0,
    totalStudents: 0,
    totalCertificates: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        setWalletAddress(signer);

        const loaded = await getProfile("admin", signer);
        if (loaded) setProfile((prev) => ({ ...prev, ...loaded }));

        const addresses = await contract.getAllInstitutes();
        let active = 0;
        let students = 0;
        let certs = 0;

        for (const addr of addresses) {
          const basic = await contract.getInstituteBasicInfo(addr);
          const details = await contract.getInstituteDetails(addr);
          if (basic[4]) active += 1;
          students += Number(details[4]);
          certs += Number(basic[6]);
        }

        setStats({
          institutionsManaged: addresses.length,
          activeInstitutes: active,
          totalStudents: students,
          totalCertificates: certs
        });
      } catch (e) {
        console.error("Failed to load admin profile", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatarUrl: res.url }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const saved = await saveProfile("admin", walletAddress, profile);
      setProfile((prev) => ({ ...prev, ...saved }));
      localStorage.setItem(`admin_profile_${walletAddress}`, JSON.stringify(saved));
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: { role: "admin", name: saved.displayName || "Admin", avatarUrl: saved.avatarUrl || "" }
        })
      );
      alert("Profile saved");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Admin Profile</h1>

      <div className="panel-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {(profile.displayName || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow cursor-pointer">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
            </label>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg">{profile.displayName || "Admin"}</p>
            <p className="text-xs text-gray-500 font-mono break-all">{walletAddress}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Display Name" name="displayName" value={profile.displayName} onChange={handleChange} />
          <Input label="Email" name="email" value={profile.email} onChange={handleChange} />
          <Input label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} />
          <Input label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} />
          <Input label="Phone" name="phone" value={profile.phone} onChange={handleChange} />
          <Input label="Location" name="location" value={profile.location} onChange={handleChange} />
          <Input label="Website" name="website" value={profile.website} onChange={handleChange} />
          <Input label="Department" name="department" value={profile.department} onChange={handleChange} />
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-600">Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows={3}
            className="soft-input mt-1"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 soft-button-primary"
        >
          {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Profile
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat icon={Building2} label="Institutes" value={stats.institutionsManaged} />
        <Stat icon={Shield} label="Active" value={stats.activeInstitutes} />
        <Stat icon={Users} label="Students" value={stats.totalStudents} />
        <Stat icon={User} label="Certificates" value={stats.totalCertificates} />
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

const Stat = ({ icon: Icon, label, value }) => (
  <div className="panel-card p-4">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
  </div>
);

export default AdminProfile;
