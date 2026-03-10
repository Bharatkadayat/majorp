import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { Loader, Pencil, Save, Users, X } from "lucide-react";
import { getContract } from "../../utils/contract";
import { getInstituteStudents, saveInstituteStudents } from "../../utils/studentRegistryApi";
import { getPublicStudentProfile } from "../../utils/profileApi";

const DEPARTMENT_OPTIONS = ["CSE", "AIML", "ECE", "EEE", "MECH", "CIVIL", "ISE", "OTHER"];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E", "F", "NA"];
const SEMESTER_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "NA"];

const StudentRegistrySavedPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wallet, setWallet] = useState("");
  const [students, setStudents] = useState([]);
  const [establishedYear, setEstablishedYear] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [batchYearFilter, setBatchYearFilter] = useState("ALL");
  const [semesterFilter, setSemesterFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [editingIndex, setEditingIndex] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [studentProfiles, setStudentProfiles] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        setWallet(signer);
        const data = await getInstituteStudents(signer);
        setStudents(data);
        try {
          const details = await contract.getInstituteDetails(signer);
          const year = Number(details?.[0]?.toString?.() || 0);
          if (year >= 1900) setEstablishedYear(year);
        } catch {
          setEstablishedYear(null);
        }
      } catch (e) {
        setError(e.message || "Failed to load saved students");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadProfiles = async () => {
      const wallets = [...new Set(students.map((s) => String(s.walletAddress || "").toLowerCase()).filter(Boolean))];
      if (!wallets.length) return;
      const profileEntries = await Promise.all(
        wallets.map(async (w) => {
          try {
            const p = await getPublicStudentProfile(w);
            return [w, p || null];
          } catch {
            return [w, null];
          }
        })
      );
      setStudentProfiles(Object.fromEntries(profileEntries));
    };
    loadProfiles();
  }, [students]);

  const departmentOptions = useMemo(() => {
    const fromData = [...new Set(students.map((s) => s.department || "Unassigned"))];
    return ["ALL", ...new Set([...DEPARTMENT_OPTIONS, ...fromData])];
  }, [students]);

  const batchYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = establishedYear && establishedYear <= currentYear ? establishedYear : currentYear - 8;
    const rangeYears = [];
    for (let y = currentYear; y >= startYear; y -= 1) rangeYears.push(String(y));
    const scoped = students.filter((s) => departmentFilter === "ALL" || (s.department || "Unassigned") === departmentFilter);
    const fromData = scoped.map((s) => s.batchYear || "NA");
    return ["ALL", ...new Set([...rangeYears, ...fromData, "NA"])];
  }, [students, departmentFilter, establishedYear]);

  const semesterOptions = useMemo(() => {
    const scoped = students.filter((s) => {
      const d = s.department || "Unassigned";
      const b = s.batchYear || "NA";
      return (departmentFilter === "ALL" || d === departmentFilter) && (batchYearFilter === "ALL" || b === batchYearFilter);
    });
    const fromData = [...new Set(scoped.map((s) => s.semester || "NA"))];
    return ["ALL", ...new Set([...SEMESTER_OPTIONS, ...fromData])];
  }, [students, departmentFilter, batchYearFilter]);

  const sectionOptions = useMemo(() => {
    const scoped = students.filter((s) => {
      const d = s.department || "Unassigned";
      const b = s.batchYear || "NA";
      const sem = s.semester || "NA";
      return (
        (departmentFilter === "ALL" || d === departmentFilter) &&
        (batchYearFilter === "ALL" || b === batchYearFilter) &&
        (semesterFilter === "ALL" || sem === semesterFilter)
      );
    });
    const fromData = [...new Set(scoped.map((s) => s.section || "NA"))];
    return ["ALL", ...new Set([...SECTION_OPTIONS, ...fromData])];
  }, [students, departmentFilter, batchYearFilter, semesterFilter]);

  useEffect(() => {
    setBatchYearFilter("ALL");
    setSemesterFilter("ALL");
    setSectionFilter("ALL");
  }, [departmentFilter]);
  useEffect(() => {
    setSemesterFilter("ALL");
    setSectionFilter("ALL");
  }, [batchYearFilter]);
  useEffect(() => {
    setSectionFilter("ALL");
  }, [semesterFilter]);

  const filteredWithIndex = useMemo(() => {
    const q = String(query || "").toLowerCase().trim();
    return students
      .map((s, index) => ({ ...s, __index: index }))
      .filter((s) => {
        const d = s.department || "Unassigned";
        const sec = s.section || "NA";
        const sem = s.semester || "NA";
        const batch = s.batchYear || "NA";
        return (
          (departmentFilter === "ALL" || d === departmentFilter) &&
          (sectionFilter === "ALL" || sec === sectionFilter) &&
          (semesterFilter === "ALL" || sem === semesterFilter) &&
          (batchYearFilter === "ALL" || batch === batchYearFilter)
        );
      })
      .filter((s) => {
        if (!q) return true;
        const bag = [s.name, s.studentId, s.walletAddress, s.department, s.section, s.semester, s.batchYear, s.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return bag.includes(q);
      });
  }, [students, query, departmentFilter, sectionFilter, semesterFilter, batchYearFilter]);

  const grouped = useMemo(() => {
    const map = {};
    for (const s of filteredWithIndex) {
      const d = s.department || "Unassigned";
      const sec = s.section || "NA";
      const sem = s.semester || "NA";
      const batch = s.batchYear || "NA";
      const key = `${d}|${sec}|${sem}|${batch}`;
      if (!map[key]) map[key] = { department: d, section: sec, semester: sem, batchYear: batch, students: [] };
      map[key].students.push(s);
    }
    return Object.values(map).sort((a, b) => b.students.length - a.students.length);
  }, [filteredWithIndex]);

  const updateStudent = (index, key, value) => {
    setStudents((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const startEdit = (index) => {
    setSnapshot({ ...students[index] });
    setEditingIndex(index);
    setError("");
  };

  const cancelEdit = () => {
    if (editingIndex !== null && snapshot) {
      setStudents((prev) => {
        const next = [...prev];
        next[editingIndex] = snapshot;
        return next;
      });
    }
    setEditingIndex(null);
    setSnapshot(null);
  };

  const saveEdited = async () => {
    try {
      if (editingIndex === null) return;
      const row = students[editingIndex];
      if (!row?.name || !row?.studentId || !row?.walletAddress) {
        throw new Error("Name, USN and wallet are required");
      }
      if (!ethers.utils.isAddress(row.walletAddress)) {
        throw new Error("Invalid wallet address in edited row");
      }
      setSaving(true);
      setError("");
      const contract = await getContract();
      const signer = contract.signer;
      const signerAddress = await signer.getAddress();
      if (String(signerAddress).toLowerCase() !== String(wallet).toLowerCase()) {
        throw new Error("Connected wallet changed. Please reconnect.");
      }

      const message = [
        "Institute Student Registry Save",
        `Wallet: ${wallet.toLowerCase()}`,
        `Rows: ${students.length}`,
        `Timestamp: ${new Date().toISOString()}`
      ].join("\n");
      const signature = await signer.signMessage(message);

      const saved = await saveInstituteStudents(wallet, students, { signature, message });
      setStudents(saved);
      setEditingIndex(null);
      setSnapshot(null);
      alert("Student updated successfully.");
    } catch (e) {
      setError(e.message || "Failed to save updates");
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
      <div className="panel-card p-4">
        <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Saved Students</h1>
        <p className="page-subtitle mt-1">All saved records with filters: Department / Section / Semester / Batch Year.</p>
      </div>

      <div className="panel-card p-4 space-y-2">
        <input
          className="soft-input flex-1 min-w-[280px]"
          placeholder="Search by name, USN, wallet, department, batch year..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid md:grid-cols-4 gap-2">
          <LabeledSelect label="Department" value={departmentFilter} onChange={setDepartmentFilter} options={departmentOptions} />
          <LabeledSelect label="Batch Year" value={batchYearFilter} onChange={setBatchYearFilter} options={batchYearOptions} />
          <LabeledSelect label="Semester" value={semesterFilter} onChange={setSemesterFilter} options={semesterOptions} />
          <LabeledSelect label="Section" value={sectionFilter} onChange={setSectionFilter} options={sectionOptions} />
        </div>
        <div>
          <Link to="/institute/students" className="soft-button-primary">Edit Registry</Link>
        </div>
      </div>

      {error ? <div className="panel-card p-3 text-rose-700">{error}</div> : null}

      <div className="grid gap-4">
        {grouped.map((g) => (
          <div key={`${g.department}-${g.section}-${g.semester}-${g.batchYear}`} className="panel-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">
                {g.department} / {g.section} / Sem {g.semester} / Batch {g.batchYear}
              </p>
              <span className="badge badge-info inline-flex items-center gap-1">
                <Users className="w-3 h-3" />
                {g.students.length} Students
              </span>
            </div>
            <div className="mt-3 grid gap-2">
              {g.students.map((s) => {
                const isEditing = editingIndex === s.__index;
                const profile = studentProfiles[String(s.walletAddress || "").toLowerCase()] || null;
                return (
                  <div key={`student-row-${s.__index}`} className="rounded-xl border border-slate-200 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="student avatar" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                            {(profile?.displayName || s.name || "S").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {profile?.displayName || s.name} ({s.studentId})
                          </p>
                          <p className="text-xs text-slate-600 font-mono break-all">{s.walletAddress}</p>
                        </div>
                      </div>
                      {!isEditing ? (
                        <button className="soft-button-muted" onClick={() => startEdit(s.__index)}>
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button className="soft-button-primary" onClick={saveEdited} disabled={saving}>
                            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                          </button>
                          <button className="soft-button-muted" onClick={cancelEdit}>
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid md:grid-cols-4 gap-2 mt-2">
                        <input className="soft-input" value={s.name || ""} onChange={(e) => updateStudent(s.__index, "name", e.target.value)} placeholder="Name" />
                        <input className="soft-input" value={s.studentId || ""} onChange={(e) => updateStudent(s.__index, "studentId", e.target.value)} placeholder="USN / Student ID" />
                        <input className="soft-input font-mono text-xs" value={s.walletAddress || ""} onChange={(e) => updateStudent(s.__index, "walletAddress", e.target.value)} placeholder="Wallet Address" />
                        <input className="soft-input" value={s.email || ""} onChange={(e) => updateStudent(s.__index, "email", e.target.value)} placeholder="Email (optional)" />
                        <select className="soft-input" value={s.department || ""} onChange={(e) => updateStudent(s.__index, "department", e.target.value)}>
                          <option value="">Department</option>
                          {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select className="soft-input" value={s.batchYear || "NA"} onChange={(e) => updateStudent(s.__index, "batchYear", e.target.value)}>
                          {batchYearOptions.filter((b) => b !== "ALL").map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select className="soft-input" value={s.semester || "NA"} onChange={(e) => updateStudent(s.__index, "semester", e.target.value)}>
                          {SEMESTER_OPTIONS.map((sem) => <option key={sem} value={sem}>{sem}</option>)}
                        </select>
                        <select className="soft-input" value={s.section || "NA"} onChange={(e) => updateStudent(s.__index, "section", e.target.value)}>
                          {SECTION_OPTIONS.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
                        </select>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">{s.email || "No email"}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 ? (
          <div className="panel-card p-6 text-center text-slate-500">No saved students found.</div>
        ) : null}
      </div>
    </div>
  );
};

const LabeledSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    <select className="soft-input mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default StudentRegistrySavedPage;
