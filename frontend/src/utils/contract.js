import { ethers } from "ethers";
import contractData from "../utils/CertificateStorage.json";
import contractAddress from "../utils/contractAddress.json";

const FLOW_PREFIX = "[CHAIN-FLOW]";
const logFlow = (step, data) => console.log(`${FLOW_PREFIX} ${step}`, data ?? "");
const asNumber = (value) => Number(value?.toString?.() ?? value);

export async function getContract() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    throw new Error("MetaMask not found");
  }

  const existingAccounts = await window.ethereum.request({ method: "eth_accounts" });
  if (!existingAccounts || existingAccounts.length === 0) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  logFlow("Connected", {
    chainId: network.chainId,
    contractAddress: contractAddress.address
  });

  if (network.chainId !== 31337 && network.chainId !== 11155111) {
    alert("Switch MetaMask to Hardhat (31337) or Sepolia");
    throw new Error("Wrong network");
  }

  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress.address, contractData.abi, signer);

  logFlow("Signer", await signer.getAddress());
  return contract;
}

export async function registerInstitute(formData) {
  const contract = await getContract();

  const tx = await contract.registerInstitute(
    formData.walletAddress,
    formData.name,
    formData.id,
    formData.email,
    formData.website || "",
    formData.contactPerson || "",
    formData.contactEmail || "",
    formData.contactPhone || "",
    formData.contactPosition || "",
    Number(formData.establishedYear || 0),
    formData.accreditation || "",
    formData.description || "",
    formData.motto || "",
    Number(formData.studentCount || 0),
    Number(formData.facultyCount || 0),
    Number(formData.programCount || 0),
    formData.twitter || "",
    formData.linkedin || "",
    formData.taxId || "",
    formData.registrationNumber || ""
  );

  const receipt = await tx.wait();
  logFlow("Institute registered", {
    wallet: formData.walletAddress,
    txHash: tx.hash,
    block: receipt.blockNumber
  });

  return {
    success: true,
    hash: tx.hash,
    wallet: formData.walletAddress,
    receipt
  };
}

export async function getAllInstitutes() {
  const contract = await getContract();
  const addresses = await contract.getAllInstitutes();

  const institutes = [];
  for (const addr of addresses) {
    const basic = await contract.getInstituteBasicInfo(addr);
    const contact = await contract.getInstituteContactInfo(addr);
    const details = await contract.getInstituteDetails(addr);
    const social = await contract.getInstituteSocialInfo(addr);

    institutes.push({
      address: addr,
      name: basic[0],
      id: basic[1],
      email: basic[2],
      website: basic[3],
      isActive: basic[4],
      registeredAt: new Date(asNumber(basic[5]) * 1000),
      certificatesIssued: asNumber(basic[6]),
      contactPerson: contact[0],
      contactEmail: contact[1],
      contactPhone: contact[2],
      contactPosition: contact[3],
      establishedYear: asNumber(details[0]),
      accreditation: details[1],
      description: details[2],
      motto: details[3],
      studentCount: asNumber(details[4]),
      facultyCount: asNumber(details[5]),
      programCount: asNumber(details[6]),
      twitter: social[0],
      linkedin: social[1],
      taxId: social[2],
      registrationNumber: social[3]
    });
  }

  return institutes;
}

export async function getInstituteBasicInfo(address) {
  const contract = await getContract();
  const info = await contract.getInstituteBasicInfo(address);

  return {
    name: info[0],
    id: info[1],
    email: info[2],
    website: info[3],
    isActive: info[4],
    registeredAt: new Date(asNumber(info[5]) * 1000),
    certificatesIssued: asNumber(info[6])
  };
}

export async function getInstituteContactInfo(address) {
  const contract = await getContract();
  const info = await contract.getInstituteContactInfo(address);

  return {
    contactPerson: info[0],
    contactEmail: info[1],
    contactPhone: info[2],
    contactPosition: info[3]
  };
}

export async function getInstituteDetails(address) {
  const contract = await getContract();
  const info = await contract.getInstituteDetails(address);

  return {
    establishedYear: asNumber(info[0]),
    accreditation: info[1],
    description: info[2],
    motto: info[3],
    studentCount: asNumber(info[4]),
    facultyCount: asNumber(info[5]),
    programCount: asNumber(info[6])
  };
}

export async function getInstituteSocialInfo(address) {
  const contract = await getContract();
  const info = await contract.getInstituteSocialInfo(address);

  return {
    twitter: info[0],
    linkedin: info[1],
    taxId: info[2],
    registrationNumber: info[3]
  };
}

export async function setInstituteStatus(address, status) {
  const contract = await getContract();
  const tx = await contract.setInstituteStatus(address, status);
  await tx.wait();
  return true;
}

export async function issueCertificate(
  studentName,
  course,
  ipfsHash,
  fileHash,
  studentWallet,
  studentId,
  grade,
  credits,
  duration,
  skills
) {
  const contract = await getContract();

  const tx = await contract.issueCertificate(
    studentName,
    course,
    ipfsHash,
    fileHash,
    studentWallet,
    studentId,
    grade,
    credits,
    duration,
    skills
  );

  const receipt = await tx.wait();
  const issuedEvent = receipt.events?.find((e) => e.event === "CertificateIssued");
  const certificateId = issuedEvent?.args?.certificateId || fileHash;

  logFlow("Certificate issued", {
    studentWallet,
    certificateId,
    txHash: tx.hash,
    block: receipt.blockNumber
  });

  return {
    success: true,
    hash: tx.hash,
    certificateId,
    receipt
  };
}

export async function issueCertificatesBatch(items) {
  const contract = await getContract();
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Batch items required");
  }

  const studentNames = items.map((i) => i.studentName || i.name || "");
  const courses = items.map((i) => i.course);
  const ipfsHashes = items.map((i) => i.ipfsHash);
  const fileHashes = items.map((i) => i.fileHash);
  const studentWallets = items.map((i) => i.studentWallet);
  const studentIds = items.map((i) => i.studentId || "");
  const grades = items.map((i) => i.grade || "");
  const credits = items.map((i) => Number(i.credits || 0));
  const durations = items.map((i) => i.duration || "");
  const skills = items.map((i) => i.skills || []);

  const tx = await contract.batchIssueCertificates(
    studentNames,
    courses,
    ipfsHashes,
    fileHashes,
    studentWallets,
    studentIds,
    grades,
    credits,
    durations,
    skills
  );

  const receipt = await tx.wait();
  const issuedEvents = receipt.events?.filter((e) => e.event === "CertificateIssued") || [];
  const certificateIds = issuedEvents.map((e) => e.args?.certificateId);

  logFlow("Batch certificates issued", {
    count: items.length,
    txHash: tx.hash,
    certificateIds
  });

  return {
    success: true,
    hash: tx.hash,
    certificateIds,
    receipt
  };
}

export async function verifyCertificate(certId) {
  const contract = await getContract();
  const exists = await contract.certificateExists(certId);
  if (!exists) throw new Error("Certificate not found");

  const cert = await contract.certificates(certId);
  logFlow("Certificate verified", {
    certId,
    student: cert.studentName,
    course: cert.course,
    revoked: cert.revoked
  });

  return {
    studentName: cert.studentName,
    course: cert.course,
    ipfsHash: cert.ipfsHash,
    fileHash: cert.fileHash,
    issuer: cert.issuer,
    student: cert.student,
    issuedAt: new Date(asNumber(cert.issuedAt) * 1000),
    revoked: cert.revoked,
    instituteName: cert.instituteName,
    studentId: cert.studentId,
    grade: cert.grade,
    credits: asNumber(cert.credits),
    duration: cert.duration,
    skills: cert.skills
  };
}

export async function getStudentCertificates(student) {
  const contract = await getContract();
  const targetStudent = student || (await contract.signer.getAddress());
  const ids = await contract.getStudentCertificates(targetStudent);

  const certs = [];
  for (const id of ids) {
    const cert = await verifyCertificate(id);
    certs.push({ id, ...cert });
  }

  logFlow("Student certificates loaded", { student: targetStudent, count: certs.length });
  return certs;
}

export async function getIssuerCertificates(issuerAddress) {
  const contract = await getContract();
  const signer = await contract.signer.getAddress();
  const issuer = issuerAddress || signer;
  const ids = await contract.getIssuerCertificates(issuer);

  const certs = [];
  for (const id of ids) {
    const cert = await verifyCertificate(id);
    certs.push({ id, ...cert });
  }

  logFlow("Issuer certificates loaded", { issuer, count: certs.length });
  return certs;
}

export async function getCertificateActivity(limit = 12) {
  const contract = await getContract();
  const signer = await contract.signer.getAddress();

  const issuedLogs = await contract.queryFilter(contract.filters.CertificateIssued());
  const revokedLogs = await contract.queryFilter(contract.filters.CertificateRevoked());

  const issuedItems = issuedLogs
    .filter((l) => l.args?.issuer?.toLowerCase?.() === signer.toLowerCase())
    .map((l) => ({
      type: "issued",
      certificateId: l.args.certificateId,
      studentName: l.args.studentName,
      course: l.args.course,
      timestamp: new Date(asNumber(l.args.timestamp) * 1000),
      txHash: l.transactionHash
    }));

  const revokedItems = revokedLogs
    .filter((l) => l.args?.revokedBy?.toLowerCase?.() === signer.toLowerCase())
    .map((l) => ({
      type: "revoked",
      certificateId: l.args.certificateId,
      studentName: "",
      course: "",
      timestamp: null,
      txHash: l.transactionHash
    }));

  const activity = [...issuedItems, ...revokedItems]
    .sort((a, b) => {
      const aT = a.timestamp ? a.timestamp.getTime() : 0;
      const bT = b.timestamp ? b.timestamp.getTime() : 0;
      return bT - aT;
    })
    .slice(0, limit);

  logFlow("Activity loaded", { issuer: signer, count: activity.length });
  return activity;
}

export async function getCertificateHistory(certId) {
  const contract = await getContract();
  const provider = contract.provider;

  const issuedLogs = await contract.queryFilter(contract.filters.CertificateIssued(certId));
  const revokedLogs = await contract.queryFilter(contract.filters.CertificateRevoked(certId));

  const entries = [];

  for (const log of issuedLogs) {
    const block = await provider.getBlock(log.blockNumber);
    entries.push({
      type: "issued",
      certificateId: log.args.certificateId,
      issuer: log.args.issuer,
      student: log.args.student,
      studentName: log.args.studentName,
      course: log.args.course,
      instituteName: log.args.instituteName,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: new Date(asNumber(block.timestamp) * 1000)
    });
  }

  for (const log of revokedLogs) {
    const block = await provider.getBlock(log.blockNumber);
    entries.push({
      type: "revoked",
      certificateId: log.args.certificateId,
      revokedBy: log.args.revokedBy,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      timestamp: new Date(asNumber(block.timestamp) * 1000)
    });
  }

  return entries.sort((a, b) => b.blockNumber - a.blockNumber);
}

export async function getGlobalEventFeed(limit = 30) {
  const contract = await getContract();
  const provider = contract.provider;

  const issuedLogs = await contract.queryFilter(contract.filters.CertificateIssued());
  const revokedLogs = await contract.queryFilter(contract.filters.CertificateRevoked());

  const merged = [
    ...issuedLogs.map((log) => ({
      type: "issued",
      certificateId: log.args.certificateId,
      issuer: log.args.issuer,
      student: log.args.student,
      studentName: log.args.studentName,
      course: log.args.course,
      instituteName: log.args.instituteName,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber
    })),
    ...revokedLogs.map((log) => ({
      type: "revoked",
      certificateId: log.args.certificateId,
      revokedBy: log.args.revokedBy,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber
    }))
  ]
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, limit);

  const blockNumbers = [...new Set(merged.map((item) => item.blockNumber))];
  const blockMap = {};
  await Promise.all(
    blockNumbers.map(async (n) => {
      const b = await provider.getBlock(n);
      blockMap[n] = new Date(asNumber(b.timestamp) * 1000);
    })
  );

  return merged.map((item) => ({
    ...item,
    timestamp: blockMap[item.blockNumber] || null
  }));
}

export async function isAdmin() {
  const contract = await getContract();
  const owner = await contract.owner();
  const signer = await contract.signer.getAddress();
  return owner.toLowerCase() === signer.toLowerCase();
}

export async function isActiveInstitute() {
  const contract = await getContract();
  const signer = await contract.signer.getAddress();
  const info = await contract.getInstituteBasicInfo(signer);
  return info[4];
}

export async function getUserRole() {
  const contract = await getContract();
  const signer = await contract.signer.getAddress();
  const owner = await contract.owner();

  if (owner.toLowerCase() === signer.toLowerCase()) {
    logFlow("Role detected", "admin");
    return "admin";
  }

  try {
    const inst = await contract.getInstituteBasicInfo(signer);
    if (inst[4]) {
      logFlow("Role detected", "institute");
      return "institute";
    }
  } catch {}

  try {
    const certs = await getStudentCertificates(signer);
    if (certs.length > 0) {
      logFlow("Role detected", "student");
      return "student";
    }
  } catch {}

  logFlow("Role detected", "user");
  return "user";
}

export async function resolveRoleForWallet(walletAddress) {
  const contract = await getContract();
  const owner = await contract.owner();
  const wallet = String(walletAddress || "").toLowerCase();
  if (wallet === owner.toLowerCase()) return "admin";

  try {
    const inst = await contract.getInstituteBasicInfo(walletAddress);
    if (inst[4]) return "institute";
  } catch {}

  return "student";
}

export async function checkNetwork() {
  if (!window.ethereum) return false;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();
  return network.chainId === 31337 || network.chainId === 11155111;
}
