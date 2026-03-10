import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { getContract, resolveRoleForWallet } from "../utils/contract";
import { getAuthRole, getAuthToken, getAuthWallet } from "../utils/authApi";

const RoleGuard = ({ expectedRole, children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        if (!getAuthToken()) {
          setAllowed(false);
          return;
        }

        const contract = await getContract();
        const signer = await contract.signer.getAddress();
        const connected = signer.toLowerCase();
        const sessionWallet = getAuthWallet();
        const savedRole = getAuthRole();

        if (!sessionWallet || connected !== sessionWallet) {
          setAllowed(false);
          return;
        }

        const chainRole = await resolveRoleForWallet(signer);
        const expected = String(expectedRole || "").toLowerCase();

        if (savedRole !== expected || chainRole !== expected) {
          setAllowed(false);
          return;
        }

        setAllowed(true);
      } catch (error) {
        console.error("Role guard failed", error);
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [expectedRole]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleGuard;

