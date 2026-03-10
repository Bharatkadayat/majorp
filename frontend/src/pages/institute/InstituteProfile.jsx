import React, { useEffect, useState } from "react";
import { Camera, Loader, Save, Building2 } from "lucide-react";
import { getContract } from "../../utils/contract";
import { getProfile, saveProfile, uploadAvatar } from "../../utils/profileApi";

const defaultProfile = {
  displayName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  bio: "",
  avatarUrl: "",
  supportEmail: ""
};

const InstituteProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallet, setWallet] = useState("");
  const [profile, setProfile] = useState(defaultProfile);
  const [chain, setChain] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        setWallet(signer);

        const basic = await contract.getInstituteBasicInfo(signer);
        const details = await contract.getInstituteDetails(signer);

        setChain({
          name: basic[0],
          id: basic[1],
          email: basic[2],
          website: basic[3],
          isActive: basic[4],
          registeredAt: new Date(Number(basic[5]) * 1000),
          certificates: Number(basic[6]),
          students: Number(details[4]),
          faculty: Number(details[5]),
          programs: Number(details[6])
        });

        const loaded = await getProfile("institute", signer);
        if (loaded) setProfile((prev) => ({ ...prev, ...loaded }));
      } catch (e) {
        console.error("Failed to load institute profile", e);
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
      const saved = await saveProfile("institute", wallet, profile);
      setProfile((p) => ({ ...p, ...saved }));
      localStorage.setItem(`institute_profile_${wallet}`, JSON.stringify(saved));
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: {
            role: "institute",
            name: saved.displayName || chain?.name || "Institute",
            avatarUrl: saved.avatarUrl || ""
          }
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
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="page-shell">
      <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Institute Profile</h1>

      <div className="panel-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                {(profile.displayName || chain?.name || "I").charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow cursor-pointer">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={onAvatar} />
            </label>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg">{profile.displayName || chain?.name}</p>
            <p className="text-xs text-gray-500 font-mono break-all">{wallet}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Display Name" name="displayName" value={profile.displayName} onChange={onChange} />
          <Input label="Public Email" name="email" value={profile.email} onChange={onChange} />
          <Input label="Phone" name="phone" value={profile.phone} onChange={onChange} />
          <Input label="Location" name="location" value={profile.location} onChange={onChange} />
          <Input label="Website" name="website" value={profile.website} onChange={onChange} />
          <Input label="Support Email" name="supportEmail" value={profile.supportEmail} onChange={onChange} />
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-600">Bio</label>
          <textarea name="bio" value={profile.bio} onChange={onChange} rows={3} className="soft-input mt-1" />
        </div>

        <button onClick={onSave} disabled={saving} className="mt-4 soft-button-primary">
          {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Profile
        </button>
      </div>

      {chain && (
        <div className="panel-card p-6 space-y-2">
          <h2 className="font-bold flex items-center"><Building2 className="w-4 h-4 mr-2" /> On-Chain Institute Data</h2>
          <p><b>Name:</b> {chain.name}</p>
          <p><b>ID:</b> {chain.id}</p>
          <p><b>Email:</b> {chain.email}</p>
          <p><b>Website:</b> {chain.website}</p>
          <p><b>Status:</b> {chain.isActive ? "Active" : "Inactive"}</p>
          <p><b>Registered:</b> {chain.registeredAt.toLocaleDateString()}</p>
          <p><b>Certificates:</b> {chain.certificates}</p>
          <p><b>Students:</b> {chain.students}</p>
          <p><b>Faculty:</b> {chain.faculty}</p>
          <p><b>Programs:</b> {chain.programs}</p>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input {...props} className="soft-input mt-1" />
  </div>
);

export default InstituteProfile;
