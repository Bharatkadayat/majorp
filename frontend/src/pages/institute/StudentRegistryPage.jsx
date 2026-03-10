import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, Plus, Save, Trash2, Upload, RotateCcw } from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "../../utils/contract";
import { saveInstituteStudents } from "../../utils/studentRegistryApi";

const emptyStudent = {
  name: "",
  studentId: "",
  walletAddress: "",
  email: "",
  department: "",
  section: "",
  semester: "",
  batchYear: ""
};

const createRowId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const withRowId = (student = {}) => ({ ...emptyStudent, ...student, __rowId: student.__rowId || createRowId() });
const departmentOptions = ["CSE", "AIML", "ECE", "EEE", "MECH", "CIVIL", "ISE"];
const semesterOptions = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

const StudentRegistryPage = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState("");
  const [establishedYear, setEstablishedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [defaultDepartment, setDefaultDepartment] = useState("");
  const [defaultSection, setDefaultSection] = useState("");
  const [defaultSemester, setDefaultSemester] = useState("");
  const [defaultBatchYear, setDefaultBatchYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        setWallet(signer);
        try {
          const details = await contract.getInstituteDetails(signer);
          const year = Number(details?.[0]?.toString?.() || 0);
          if (year >= 1900) setEstablishedYear(year);
        } catch {
          setEstablishedYear(null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const departmentStats = useMemo(() => {
    const map = {};
    for (const s of students) {
      const key = s.department || "Unassigned";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [students]);

  const batchYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = establishedYear && establishedYear <= currentYear ? establishedYear : currentYear - 8;
    const years = [];
    for (let y = currentYear; y >= startYear; y -= 1) {
      years.push(String(y));
    }
    return years;
  }, [establishedYear]);

  const updateStudent = (index, key, value) => {
    setStudents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addStudent = () =>
    setStudents((prev) => [
      ...prev,
      {
        ...withRowId(),
        department: defaultDepartment,
        section: defaultSection,
        semester: defaultSemester,
        batchYear: defaultBatchYear
      }
    ]);
  const removeStudent = (index) => setStudents((prev) => prev.filter((_, i) => i !== index));

  const clearContext = () => {
    setDefaultDepartment("");
    setDefaultSection("");
    setDefaultSemester("");
    setDefaultBatchYear("");
  };

  const parseCsv = async (file) => {
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) throw new Error("CSV must have header + rows");
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idx = (name) => header.indexOf(name);
    const required = ["name", "studentid", "walletaddress"];
    for (const r of required) {
      if (idx(r) < 0) throw new Error(`Missing column: ${r}`);
    }

    const imported = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        name: cols[idx("name")] || "",
        studentId: cols[idx("studentid")] || "",
        walletAddress: cols[idx("walletaddress")] || "",
        email: idx("email") >= 0 ? cols[idx("email")] || "" : "",
        department: idx("department") >= 0 ? cols[idx("department")] || "" : "",
        section: idx("section") >= 0 ? cols[idx("section")] || "" : "",
        semester: idx("semester") >= 0 ? cols[idx("semester")] || "" : "",
        batchYear: idx("batchyear") >= 0 ? cols[idx("batchyear")] || "" : ""
      };
    });
    setStudents(imported.map((s) => withRowId(s)));
  };

  const validate = () => {
    if (!students.length) return "Add at least one student";
    if (!defaultDepartment || !defaultSection || !defaultSemester || !defaultBatchYear) {
      return "Select department, section, semester and batch year";
    }
    for (const s of students) {
      if (!s.name || !s.studentId || !s.walletAddress) {
        return "Each row must have name, studentId, walletAddress";
      }
      if (!ethers.utils.isAddress(s.walletAddress)) {
        return `Invalid wallet for ${s.name || s.studentId}`;
      }
    }
    return "";
  };

  const save = async () => {
    try {
      const invalid = validate();
      if (invalid) throw new Error(invalid);
      setSaving(true);
      setError("");
      const normalized = students.map((s) => ({
        ...s,
        department: defaultDepartment,
        section: defaultSection,
        semester: defaultSemester,
        batchYear: defaultBatchYear
      })).map(({ __rowId, ...rest }) => rest);
      const contract = await getContract();
      const signer = contract.signer;
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== wallet.toLowerCase()) {
        throw new Error("Connected wallet changed. Please reconnect and try again.");
      }

      const message = [
        "Institute Student Registry Save",
        `Wallet: ${wallet.toLowerCase()}`,
        `Rows: ${normalized.length}`,
        `Timestamp: ${new Date().toISOString()}`
      ].join("\n");
      const signature = await signer.signMessage(message);

      await saveInstituteStudents(wallet, normalized, { signature, message });
      setStudents([]);
      alert("Saved. View records in Saved Students page.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="panel-card p-6">
        <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Institute Student Registry</h1>
        <p className="page-subtitle mt-1">New/Draft entry page. Saved records are shown in Saved Students page.</p>
      </div>

      <div className="panel-card p-4 flex flex-wrap gap-2">
        <label className="soft-button-muted cursor-pointer">
          <Upload className="w-4 h-4" /> Import CSV
          <input
            type="file"
            className="hidden"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && parseCsv(e.target.files[0]).catch((err) => setError(err.message))}
          />
        </label>
        <button onClick={() => navigate("/institute/students/saved")} className="soft-button-muted">Saved Students</button>
        <button onClick={() => navigate("/institute/batch")} className="soft-button-primary">Go Batch Issue</button>
      </div>

      <div className="panel-card p-3 text-sm">
        <p className="font-semibold text-slate-800">Must fill for each student:</p>
        <p className="text-slate-600">Name, Student ID/USN, Wallet Address</p>
        <p className="font-semibold text-slate-800 mt-2">Recommended:</p>
        <p className="text-slate-600">Set Department + Section + Semester + Batch Year once (applied to all rows on save)</p>
      </div>

      <div className="panel-card p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select className="soft-input" value={defaultDepartment} onChange={(e) => setDefaultDepartment(e.target.value)}>
          <option value="">Department (required)</option>
          {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="soft-input" value={defaultSection} onChange={(e) => setDefaultSection(e.target.value)}>
          <option value="">Section (required)</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <select className="soft-input" value={defaultSemester} onChange={(e) => setDefaultSemester(e.target.value)}>
          <option value="">Semester (required)</option>
          {semesterOptions.map((sem) => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
        <select className="soft-input" value={defaultBatchYear} onChange={(e) => setDefaultBatchYear(e.target.value)}>
          <option value="">Batch Year (required)</option>
          {batchYearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
          <option value="OTHER">OTHER</option>
        </select>
        <button onClick={clearContext} className="soft-button-muted md:col-span-2">
          <RotateCcw className="w-4 h-4" /> Reset Context
        </button>
      </div>

      <div className="panel-card p-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Current Draft Summary</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(departmentStats).map(([d, count]) => (
            <span key={d} className="badge badge-info">{d}: {count}</span>
          ))}
          {Object.keys(departmentStats).length === 0 ? <span className="text-xs text-slate-500">No draft rows yet</span> : null}
        </div>
      </div>

      {error ? <div className="panel-card p-3 text-rose-700">{error}</div> : null}

      <div className="space-y-3">
        {students.map((s, index) => (
          <div key={s.__rowId || `${index}`} className="panel-card p-4 grid grid-cols-1 md:grid-cols-8 gap-2">
            <input className="soft-input md:col-span-2" placeholder="Name" value={s.name} onChange={(e) => updateStudent(index, "name", e.target.value)} />
            <input className="soft-input" placeholder="Student ID / USN" value={s.studentId} onChange={(e) => updateStudent(index, "studentId", e.target.value)} />
            <input className="soft-input md:col-span-2 font-mono text-xs" placeholder="Wallet Address" value={s.walletAddress} onChange={(e) => updateStudent(index, "walletAddress", e.target.value)} />
            <div className="md:col-span-2 flex items-center px-3 text-xs text-slate-600">
              {defaultDepartment || "No Dept"} / {defaultSection || "No Sec"} / {defaultSemester || "No Sem"} / {defaultBatchYear || "No Batch"}
            </div>
            <button className="soft-button-muted text-rose-700" onClick={() => removeStudent(index)}>
              <Trash2 className="w-4 h-4" />
            </button>
            <input className="soft-input md:col-span-3" placeholder="Email (optional)" value={s.email} onChange={(e) => updateStudent(index, "email", e.target.value)} />
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="soft-button-primary">
        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button
        onClick={addStudent}
        className="fixed bottom-6 right-6 z-50 soft-button-primary shadow-xl"
        title="Add Student Row"
      >
        <Plus className="w-4 h-4" />
        Add Row
      </button>
    </div>
  );
};

export default StudentRegistryPage;
