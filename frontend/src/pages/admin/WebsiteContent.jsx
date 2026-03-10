import React, { useEffect, useState } from "react";
import { Camera, Loader, Plus, Save, Trash2 } from "lucide-react";
import { getLandingContent, saveLandingContent, uploadLandingImage } from "../../utils/landingApi";

const defaultData = {
  heroTitle: "",
  heroSubtitle: "",
  aboutText: "",
  guide: {
    name: "Dr HemaMalini B H",
    title: "Project Guide",
    imageUrl: "",
    bio: ""
  },
  team: []
};

const WebsiteContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(defaultData);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const content = await getLandingContent();
        setData((prev) => ({ ...prev, ...content }));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const updateGuide = (name, value) => {
    setData((prev) => ({ ...prev, guide: { ...(prev.guide || {}), [name]: value } }));
  };

  const updateTeam = (index, name, value) => {
    setData((prev) => {
      const team = [...(prev.team || [])];
      team[index] = { ...(team[index] || {}), [name]: value };
      return { ...prev, team };
    });
  };

  const addTeamMember = () => {
    setData((prev) => ({
      ...prev,
      team: [...(prev.team || []), { name: "", role: "", email: "", imageUrl: "" }]
    }));
  };

  const removeTeamMember = (index) => {
    setData((prev) => ({
      ...prev,
      team: (prev.team || []).filter((_, i) => i !== index)
    }));
  };

  const uploadGuideImage = async (file) => {
    try {
      setUploading(true);
      setError("");
      const result = await uploadLandingImage(file);
      updateGuide("imageUrl", result.url);
    } catch (e) {
      setError(e.message || "Guide image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadTeamImage = async (index, file) => {
    try {
      setUploading(true);
      setError("");
      const result = await uploadLandingImage(file);
      updateTeam(index, "imageUrl", result.url);
    } catch (e) {
      setError(e.message || "Team image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      const saved = await saveLandingContent(data);
      setData((prev) => ({ ...prev, ...saved }));
      alert("Website content saved");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Website Content Manager</h1>

      {error ? <div className="panel-card p-4 text-rose-700">{error}</div> : null}

      <div className="panel-card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Landing Text</h2>
        <Input label="Hero Title" value={data.heroTitle} onChange={(v) => updateField("heroTitle", v)} />
        <Textarea label="Hero Subtitle" value={data.heroSubtitle} onChange={(v) => updateField("heroSubtitle", v)} />
        <Textarea label="About Text" value={data.aboutText} onChange={(v) => updateField("aboutText", v)} />
      </div>

      <div className="panel-card p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Guide Section</h2>
        <Input label="Guide Name" value={data.guide?.name || ""} onChange={(v) => updateGuide("name", v)} />
        <Input label="Guide Title" value={data.guide?.title || ""} onChange={(v) => updateGuide("title", v)} />
        <Textarea label="Guide Bio" value={data.guide?.bio || ""} onChange={(v) => updateGuide("bio", v)} />
        <div className="flex items-center gap-3">
          {data.guide?.imageUrl ? (
            <img src={data.guide.imageUrl} alt="guide" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200" />
          )}
          <label className="soft-button-muted cursor-pointer">
            <Camera className="w-4 h-4" />
            Upload Guide Image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadGuideImage(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      <div className="panel-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Team Section</h2>
          <button onClick={addTeamMember} className="soft-button-muted">
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {(data.team || []).map((member, index) => (
          <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Member #{index + 1}</p>
              <button onClick={() => removeTeamMember(index)} className="soft-button-muted text-rose-700">
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
            <Input label="Name" value={member.name || ""} onChange={(v) => updateTeam(index, "name", v)} />
            <Input label="Role" value={member.role || ""} onChange={(v) => updateTeam(index, "role", v)} />
            <Input label="Email" value={member.email || ""} onChange={(v) => updateTeam(index, "email", v)} />
            <div className="flex items-center gap-3">
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name || "member"} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200" />
              )}
              <label className="soft-button-muted cursor-pointer">
                <Camera className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadTeamImage(index, e.target.files[0])}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="soft-button-primary">
        {saving || uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving..." : uploading ? "Uploading..." : "Save Website Content"}
      </button>
    </div>
  );
};

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-slate-600">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="soft-input mt-1" />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm text-slate-600">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="soft-input mt-1" />
  </div>
);

export default WebsiteContent;
