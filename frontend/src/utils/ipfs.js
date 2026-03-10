import { ethers } from "ethers";
import { authFetch, getAuthToken } from "./authApi";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:4000";



// Generate keccak256 hash of certificate file
export const generateFileHash = async (file) => {

  const buffer = await file.arrayBuffer();

  const hash = ethers.utils.keccak256(new Uint8Array(buffer));

  return hash;

};



// Upload certificate file to Pinata (IPFS)
export const uploadToIPFS = async (file, metadata = {}) => {

  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Not authenticated for upload. Login again.");
    }
    const formData = new FormData();

    formData.append("file", file);



    const pinataMetadata = JSON.stringify({

      name: file.name,

      keyvalues: {

        studentName: metadata.studentName || "",

        course: metadata.course || "",

        studentWallet: metadata.studentWallet || "",

        issuedAt: Date.now().toString()

      }

    });



    formData.append("pinataMetadata", pinataMetadata);



    const pinataOptions = JSON.stringify({

      cidVersion: 1

    });



    formData.append("pinataOptions", pinataOptions);



    const response = await authFetch(

      `${API_BASE}/api/ipfs/upload`,

      {

        method: "POST",

        body: formData

      }

    );



    if (!response.ok) {

      const text = await response.text();

      throw new Error("IPFS upload failed: " + text);

    }



    const result = await response.json();



    console.log("✅ IPFS Upload Success:", result.IpfsHash);



    return {

      IpfsHash: result.IpfsHash,

      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`

    };



  } catch (error) {

    console.error("IPFS Upload Error:", error);

    throw error;

  }

};



// Fetch file from IPFS
export const getFromIPFS = async (hash) => {

  const response = await fetch(

    `https://gateway.pinata.cloud/ipfs/${hash}`

  );



  if (!response.ok) {

    throw new Error("Failed to fetch from IPFS");

  }



  return await response.blob();

};



// Verify file integrity using blockchain hash
export const verifyFileIntegrity = async (file, blockchainHash) => {

  const hash = await generateFileHash(file);

  return hash === blockchainHash;

};
