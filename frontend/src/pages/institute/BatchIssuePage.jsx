import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, FileUp, Loader, Upload } from "lucide-react";
import { getContract, issueCertificatesBatch } from "../../utils/contract";
import { generateFileHash, uploadToIPFS } from "../../utils/ipfs";
import { getInstituteStudents } from "../../utils/studentRegistryApi";

const DEPARTMENT_OPTIONS = ["CSE", "AIML", "ECE", "EEE", "MECH", "CIVIL", "ISE", "OTHER"];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E", "F", "NA"];
const SEMESTER_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "NA"];

const BatchIssuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [establishedYear, setEstablishedYear] = useState(null);
  const [department, setDepartment] = useState("ALL");
  const [section, setSection] = useState("ALL");
  const [semester, setSemester] = useState("ALL");
  const [batchYear, setBatchYear] = useState("ALL");
  const [files, setFiles] = useState([]);
  const [prepared, setPrepared] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    course: "",
    grade: "",
    credits: "",
    duration: "",
    skills: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        const list = await getInstituteStudents(signer);
        setStudents(list);
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

  const departments = useMemo(() => {
    const fromData = [...new Set(students.map((s) => s.department || "Unassigned"))];
    return ["ALL", ...new Set([...DEPARTMENT_OPTIONS, ...fromData])];
  }, [students]);
  const sections = useMemo(() => {
    const source = students.filter((s) => department === "ALL" || (s.department || "Unassigned") === department);
    const fromData = [...new Set(source.map((s) => s.section || "NA"))];
    return ["ALL", ...new Set([...SECTION_OPTIONS, ...fromData])];
  }, [students, department]);
  const semesters = useMemo(() => {
    const source = students.filter((s) => {
      const d = s.department || "Unassigned";
      const sec = s.section || "NA";
      return (department === "ALL" || d === department) && (section === "ALL" || sec === section);
    });
    const fromData = [...new Set(source.map((s) => s.semester || "NA"))];
    return ["ALL", ...new Set([...SEMESTER_OPTIONS, ...fromData])];
  }, [students, department, section]);
  const batchYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = establishedYear && establishedYear <= currentYear ? establishedYear : currentYear - 8;
    const rangeYears = [];
    for (let y = currentYear; y >= startYear; y -= 1) {
      rangeYears.push(String(y));
    }

    const source = students.filter((s) => {
      const d = s.department || "Unassigned";
      const sec = s.section || "NA";
      const sem = s.semester || "NA";
      return (
        (department === "ALL" || d === department) &&
        (section === "ALL" || sec === section) &&
        (semester === "ALL" || sem === semester)
      );
    });
    const fromData = source.map((s) => s.batchYear || "NA");
    return ["ALL", ...new Set([...rangeYears, ...fromData])];
  }, [students, department, section, semester, establishedYear]);

  const targetStudents = useMemo(
    () =>
      students.filter((s) => {
        const d = s.department || "Unassigned";
        const sec = s.section || "NA";
        const sem = s.semester || "NA";
        const batch = s.batchYear || "NA";
        return (
          (department === "ALL" || d === department) &&
          (section === "ALL" || sec === section) &&
          (semester === "ALL" || sem === semester) &&
          (batchYear === "ALL" || batch === batchYear)
        );
      }),
    [students, department, section, semester, batchYear]
  );

  const studentsWithoutBatchConstraint = useMemo(
    () =>
      students.filter((s) => {
        const d = s.department || "Unassigned";
        const sec = s.section || "NA";
        const sem = s.semester || "NA";
        return (
          (department === "ALL" || d === department) &&
          (section === "ALL" || sec === section) &&
          (semester === "ALL" || sem === semester)
        );
      }),
    [students, department, section, semester]
  );

  const normalizeText = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const normalizeCompact = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const hasWord = (text, token) => new RegExp(`\\b${escapeRegex(token)}\\b`, "i").test(text);

  const detectPdfHints = (normalizedText) => {
    const deptList = DEPARTMENT_OPTIONS.filter((d) => d !== "OTHER");
    const sectionList = SECTION_OPTIONS.filter((s) => s !== "NA");
    const semesterList = SEMESTER_OPTIONS.filter((s) => s !== "NA");
    const hints = {
      departments: deptList.filter((d) => hasWord(normalizedText, d.toLowerCase())),
      sections: sectionList.filter((s) => hasWord(normalizedText, s.toLowerCase())),
      semesters: semesterList.filter((s) => hasWord(normalizedText, s.toLowerCase())),
      hasBatchWord: hasWord(normalizedText, "batch"),
      hasUsnLabel: hasWord(normalizedText, "usn"),
      hasNameLabel: hasWord(normalizedText, "name")
    };
    return hints;
  };

  const getMatchScore = (parsedFile, student, isNameUnique) => {
    const idNorm = normalizeText(student.studentId);
    const idCompact = normalizeCompact(student.studentId);
    const nameNorm = normalizeText(student.name);
    const nameCompact = normalizeCompact(student.name);

    const hasId =
      (idNorm && parsedFile.normalizedText.includes(idNorm)) ||
      (idCompact && parsedFile.compactText.includes(idCompact));

    const hasName =
      (nameNorm && parsedFile.normalizedText.includes(nameNorm)) ||
      (nameCompact && parsedFile.compactText.includes(nameCompact));

    let hasLabeledId = false;
    if (idNorm) {
      const labelPattern = new RegExp(
        `\\b(?:usn|student\\s*id|id)\\s*[:\\-]?\\s*${escapeRegex(idNorm)}\\b`,
        "i"
      );
      hasLabeledId = labelPattern.test(parsedFile.normalizedText);
    }

    let hasLabeledName = false;
    if (nameNorm) {
      const labelPattern = new RegExp(
        `\\b(?:student\\s*name|name)\\s*[:\\-]?\\s*${escapeRegex(nameNorm)}\\b`,
        "i"
      );
      hasLabeledName = labelPattern.test(parsedFile.normalizedText);
    }

    if (hasLabeledId) return { score: 120, matchedBy: "pdf-labeled-studentId" };
    if (hasId) return { score: 100, matchedBy: "pdf-studentId" };
    if (hasLabeledName && isNameUnique) return { score: 90, matchedBy: "pdf-labeled-studentName" };
    if (hasName && isNameUnique) return { score: 80, matchedBy: "pdf-studentName" };
    if (hasName && !isNameUnique) return { score: 50, matchedBy: "pdf-studentName-ambiguous" };
    return { score: 0, matchedBy: "none" };
  };

  const extractPdfText = async (file) => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    const pages = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((i) => i.str || "").join(" ");
      pages.push(pageText);
    }
    return pages.join(" ");
  };

  const prepare = async () => {
    try {
      setError("");
      setResult(null);
      setPrepared([]);
      if (!form.course) throw new Error("Course is required");
      if (!files.length) throw new Error("Upload certificate files first");
      if (!targetStudents.length) throw new Error("No students found for selected department/section");
      const idSet = new Set();
      const nameCount = {};
      for (const s of targetStudents) {
        const id = normalizeCompact(s.studentId);
        const nm = normalizeCompact(s.name);
        if (!id) throw new Error(`Missing studentId for ${s.name || s.walletAddress}`);
        if (idSet.has(id)) throw new Error(`Duplicate studentId in registry filter: ${s.studentId}`);
        idSet.add(id);
        if (nm) nameCount[nm] = (nameCount[nm] || 0) + 1;
      }

      const parsedFiles = [];
      for (const file of files) {
        let rawText = "";
        try {
          rawText = await extractPdfText(file);
        } catch {
          rawText = "";
        }
        parsedFiles.push({
          file,
          rawText,
          normalizedText: normalizeText(rawText),
          compactText: normalizeCompact(rawText),
          hints: detectPdfHints(normalizeText(rawText)),
          used: false
        });
      }

      const candidates = [];
      targetStudents.forEach((student, studentIndex) => {
        const isNameUnique = (nameCount[normalizeCompact(student.name)] || 0) === 1;
        parsedFiles.forEach((pf, fileIndex) => {
          const match = getMatchScore(pf, student, isNameUnique);
          if (match.score > 0) {
            candidates.push({
              studentIndex,
              fileIndex,
              score: match.score,
              matchedBy: match.matchedBy
            });
          }
        });
      });

      candidates.sort((a, b) => b.score - a.score);

      const usedStudents = new Set();
      const usedFiles = new Set();
      const assignments = new Map();

      for (const c of candidates) {
        if (usedStudents.has(c.studentIndex) || usedFiles.has(c.fileIndex)) continue;
        usedStudents.add(c.studentIndex);
        usedFiles.add(c.fileIndex);
        assignments.set(c.studentIndex, c);
      }

      const items = [];
      for (let i = 0; i < targetStudents.length; i += 1) {
        const s = targetStudents[i];
        const assigned = assignments.get(i);
        if (!assigned) {
          items.push({
            studentId: s.studentId,
            name: s.name,
            studentWallet: s.walletAddress,
            department: s.department,
            section: s.section,
            semester: s.semester,
            batchYear: s.batchYear,
            status: "missing-file",
            matchedBy: "none"
          });
          continue;
        }

        const file = parsedFiles[assigned.fileIndex]?.file;
        if (!file) {
          items.push({
            studentId: s.studentId,
            name: s.name,
            studentWallet: s.walletAddress,
            department: s.department,
            section: s.section,
            semester: s.semester,
            batchYear: s.batchYear,
            status: "missing-file",
            matchedBy: "none"
          });
          continue;
        }

        const fileHash = await generateFileHash(file);
        const ipfs = await uploadToIPFS(file, {
          studentName: s.name,
          course: form.course,
          studentWallet: s.walletAddress
        });

        items.push({
          studentId: s.studentId,
          name: s.name,
          studentWallet: s.walletAddress,
          department: s.department,
          section: s.section,
          semester: s.semester,
          batchYear: s.batchYear,
          course: form.course,
          grade: form.grade || "",
          credits: Number(form.credits || 0),
          duration: form.duration || "",
          skills: form.skills
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          fileHash,
          ipfsHash: ipfs.IpfsHash,
          fileName: file.name,
          matchedBy: assigned.matchedBy,
          matchScore: assigned.score,
          detectedHints: parsedFiles[assigned.fileIndex]?.hints || null,
          status: "ready"
        });
      }
      setPrepared(items);
      const readyCount = items.filter((x) => x.status === "ready").length;
      if (readyCount === 0) {
        setError("No ready records to submit");
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setError("");
      const ready = prepared.filter((p) => p.status === "ready");
      if (!ready.length) throw new Error("No ready records to submit");
      const tx = await issueCertificatesBatch(ready);
      setResult(tx);
      navigate("/institute/success", {
        state: {
          mode: "batch",
          transactionHash: tx.hash,
          certificateIds: tx.certificateIds || [],
          readyCount: ready.length,
          totalPrepared: prepared.length,
          prepared
        }
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
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
        <h1 className="page-title hero-title-animated text-2xl md:text-3xl">Smart Batch Issue</h1>
        <p className="page-subtitle mt-1">
          Department/section/semester/batch-wise issuance with auto file hash + auto IPFS upload.
        </p>
      </div>

      <div className="panel-card p-4 flex flex-wrap gap-2">
        <button className="soft-button-muted" onClick={() => navigate("/institute/upload")}>Single Issue Mode</button>
        <button className="soft-button-muted" onClick={() => navigate("/institute/students")}>Manage Student Registry</button>
      </div>

      <div className="panel-card p-4 space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm">
          <p className="font-semibold text-slate-800">Required:</p>
          <p className="text-slate-600">Course, student registry (name + studentId + walletAddress), and certificate files.</p>
          <p className="font-semibold text-slate-800 mt-2">Optional:</p>
          <p className="text-slate-600">Department, section, semester, batch year filters, grade, credits, duration, skills.</p>
          <p className="text-slate-600 mt-2">Match mode: USN/StudentID preferred, Name allowed (when unique in selected batch).</p>
          <p className="text-slate-600">Scanned/image-only PDFs need OCR text before upload.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="soft-input mt-1">
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Batch Year</label>
            <select value={batchYear} onChange={(e) => setBatchYear(e.target.value)} className="soft-input mt-1">
              {batchYears.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="soft-input mt-1">
              {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Section</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="soft-input mt-1">
              {sections.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input className="soft-input" placeholder="Course (required)" value={form.course} onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))} />
          <input className="soft-input" placeholder="Grade (optional)" value={form.grade} onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))} />
          <input className="soft-input" placeholder="Credits (optional)" value={form.credits} onChange={(e) => setForm((p) => ({ ...p, credits: e.target.value }))} />
          <input className="soft-input" placeholder="Duration (optional)" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} />
        </div>
        <input
          className="soft-input"
          placeholder="Skills comma separated: AI,ML,Python"
          value={form.skills}
          onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="soft-button-muted cursor-pointer inline-flex">
            <FileUp className="w-4 h-4" />
            Upload Certificate Files
            <input
              type="file"
              className="hidden"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </label>
          <p className="text-xs text-slate-500">
            Selected students: {targetStudents.length} | Files uploaded: {files.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5">
          <p className="text-xs font-semibold text-slate-700 mb-1">Students In Current Selection</p>
          {targetStudents.length > 0 ? (
            <div className="max-h-40 overflow-auto space-y-1">
              {targetStudents.slice(0, 30).map((s) => (
                <div key={`${s.studentId}-${s.walletAddress}`} className="text-xs text-slate-600 flex flex-wrap gap-2">
                  <span className="font-semibold text-slate-800">{s.name}</span>
                  <span>({s.studentId})</span>
                  <span className="font-mono">{s.walletAddress}</span>
                </div>
              ))}
              {targetStudents.length > 30 ? (
                <p className="text-xs text-slate-500">+{targetStudents.length - 30} more students</p>
              ) : null}
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              <p>No students found for selected filters.</p>
              {batchYear !== "ALL" && studentsWithoutBatchConstraint.length > 0 ? (
                <p className="mt-1">
                  Found {studentsWithoutBatchConstraint.length} student(s) for department/section/semester, but not for batch year `{batchYear}`.
                  <button
                    type="button"
                    className="ml-2 underline text-blue-600"
                    onClick={() => setBatchYear("ALL")}
                  >
                    Set Batch Year = ALL
                  </button>
                </p>
              ) : null}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">
          PDF text must contain the exact studentId/USN used in student registry.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={prepare} className="soft-button-primary">Prepare Batch</button>
          <button
            onClick={submit}
            disabled={submitting || prepared.filter((p) => p.status === "ready").length === 0}
            className="soft-button-primary"
          >
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? "Submitting..." : "Submit Batch"}
          </button>
        </div>
      </div>

      {error ? <div className="panel-card p-3 text-rose-700">{error}</div> : null}

      {prepared.length > 0 ? (
        <div className="panel-card p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Prepared Records</h2>
          <p className="text-xs text-slate-600 mb-2">
            Ready: {prepared.filter((p) => p.status === "ready").length} / {prepared.length}
          </p>
          <div className="space-y-2">
            {prepared.map((p, idx) => (
              <div key={`${p.studentId}-${idx}`} className="border border-slate-200 rounded-xl p-2.5">
                <p className="font-semibold text-sm">{p.name} ({p.studentId})</p>
                <p className="text-xs text-slate-600">Wallet: {p.studentWallet || "N/A"}</p>
                <p className="text-xs text-slate-600">
                  Dept/Section/Sem/Batch: {p.department || "NA"} / {p.section || "NA"} / {p.semester || "NA"} / {p.batchYear || "NA"}
                </p>
                <p className="text-xs text-slate-600">Status: {p.status}</p>
                {p.status === "ready" ? (
                  <>
                    <p className="text-xs text-slate-600">Matched File: {p.fileName}</p>
                    <p className="text-xs text-slate-600">Matched By: {p.matchedBy}</p>
                    <p className="text-xs text-slate-600">Match Score: {p.matchScore}</p>
                    {p.detectedHints ? (
                      <p className="text-xs text-slate-600">
                        PDF hints:
                        {" "}
                        Dept[{(p.detectedHints.departments || []).join(", ") || "NA"}],
                        {" "}
                        Sem[{(p.detectedHints.semesters || []).join(", ") || "NA"}],
                        {" "}
                        Sec[{(p.detectedHints.sections || []).join(", ") || "NA"}]
                      </p>
                    ) : null}
                    <p className="mono-wrap">fileHash: {p.fileHash}</p>
                    <p className="mono-wrap">ipfsHash: {p.ipfsHash}</p>
                  </>
                ) : (
                  <p className="text-xs text-rose-700">No matching file by USN or unique Name for this student</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="panel-card p-3">
          <p className="font-semibold text-emerald-700 inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Batch issued successfully
          </p>
          <p className="mono-wrap mt-1">TX: {result.hash}</p>
          <p className="text-xs text-slate-600 mt-1">Certificates: {result.certificateIds?.length || 0}</p>
        </div>
      ) : null}
    </div>
  );
};

export default BatchIssuePage;
