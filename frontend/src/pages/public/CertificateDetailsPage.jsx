import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, ExternalLink, Fingerprint, ShieldCheck, User, Building2, Calendar, History } from "lucide-react";
import { getCertificateHistory, verifyCertificate } from "../../utils/contract";

const CertificateDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cert, setCert] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [data, timeline] = await Promise.all([
          verifyCertificate(id),
          getCertificateHistory(id)
        ]);
        setCert(data);
        setHistory(timeline);
      } catch (e) {
        setError(e.message || "Certificate not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Copied");
  };

  if (loading) {
    return <div className="page-shell py-10">Loading certificate details...</div>;
  }

  if (error || !cert) {
    return (
      <div className="page-shell py-10 space-y-4">
        <h1 className="page-title">Certificate Details</h1>
        <p className="text-red-600">{error || "Certificate not found"}</p>
        <button onClick={() => navigate(-1)} className="soft-button-muted">Go Back</button>
      </div>
    );
  }

  return (
    <div className="page-shell py-10 space-y-6">
      <div className="panel-card p-6">
        <h1 className="page-title text-2xl md:text-3xl">Certificate Details</h1>
        <p className="text-sm text-slate-600 mt-1">Professional verification receipt</p>
      </div>

      <div className="panel-card p-6 space-y-4">
        <Info icon={Fingerprint} label="Certificate ID" value={id} onCopy={() => copy(id)} />
        <Info icon={User} label="Student" value={cert.studentName} />
        <Info icon={Building2} label="Institute" value={cert.instituteName} />
        <Info icon={Calendar} label="Issued" value={cert.issuedAt.toLocaleString()} />
        <Info icon={ShieldCheck} label="Status" value={cert.revoked ? "Revoked" : "Verified"} />
        <Info label="Course" value={cert.course} />
        <Info label="IPFS Hash" value={cert.ipfsHash} onCopy={() => copy(cert.ipfsHash)} />
        <Info label="File Hash" value={cert.fileHash} onCopy={() => copy(cert.fileHash)} />
        <Info label="Student Wallet" value={cert.student} />
        <Info label="Issuer Wallet" value={cert.issuer} />
        {cert.studentId && <Info label="Student ID" value={cert.studentId} />}
        {cert.grade && <Info label="Grade" value={cert.grade} />}
        {cert.duration && <Info label="Duration" value={cert.duration} />}
        {!!cert.credits && <Info label="Credits" value={String(cert.credits)} />}
        {cert.skills?.length > 0 && <Info label="Skills" value={cert.skills.join(", ")} />}
      </div>

      <div className="panel-card p-6 flex flex-wrap gap-3">
        <button
          onClick={() => copy(`${window.location.origin}/verify?id=${id}`)}
          className="soft-button-primary"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Verify Link
        </button>

        <a
          href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`}
          target="_blank"
          rel="noreferrer"
          className="soft-button-muted border border-slate-200"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open IPFS File
        </a>
      </div>

      <div className="panel-card p-6">
        <h2 className="font-bold text-slate-900 inline-flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-600" />
          Certificate Timeline
        </h2>
        <div className="mt-4 space-y-3">
          {history.map((h) => (
            <div key={`${h.txHash}-${h.type}`} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-sm">{h.type === "issued" ? "Issued On-Chain" : "Revoked On-Chain"}</p>
              <p className="text-xs text-slate-500">At: {h.timestamp ? h.timestamp.toLocaleString() : "N/A"}</p>
              <p className="mono-wrap mt-1">TX: {h.txHash}</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${h.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="soft-button-muted text-xs mt-2 inline-flex"
              >
                View Transaction
              </a>
            </div>
          ))}
          {history.length === 0 ? <p className="text-sm text-slate-500">No timeline entries found.</p> : null}
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value, onCopy }) => (
  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
    <p className="text-xs text-slate-500">{label}</p>
    <div className="flex items-start justify-between gap-3">
      <p className="font-medium break-all text-slate-800">{value}</p>
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="w-4 h-4 text-gray-400" /> : null}
        {onCopy ? (
          <button onClick={onCopy} className="soft-button-muted text-xs px-2 py-1">Copy</button>
        ) : null}
      </div>
    </div>
  </div>
);

export default CertificateDetailsPage;
