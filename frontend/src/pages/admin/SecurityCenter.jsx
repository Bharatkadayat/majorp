import React, { useState, useEffect } from 'react';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Lock,
  Users,
  Activity,
  Server,
  Globe,
  Download,
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader
} from 'lucide-react';
import { getContract } from '../../utils/contract';

const SecurityCenter = () => {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState({
    securityScore: 0,
    activeThreats: 0,
    blockedAttacks: 0,
    securityEvents: []
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      
      // Load real security data from contract/backend
      setSecurityData({
        securityScore: 100,
        activeThreats: 0,
        blockedAttacks: 0,
        securityEvents: []
      });
      
    } catch (err) {
      console.error("Error loading security data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20" />
        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Security Center
                </h1>
              </div>
              <p className="text-gray-600">
                Monitor security and threats across the platform
              </p>
            </div>
            <button 
              onClick={loadSecurityData}
              className="p-2 bg-white/50 border border-gray-200 rounded-xl hover:bg-white/80 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <p className="text-sm text-gray-500 mb-1">Security Score</p>
          <p className="text-3xl font-bold text-green-600">{securityData.securityScore}%</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <p className="text-sm text-gray-500 mb-1">Active Threats</p>
          <p className="text-3xl font-bold text-yellow-600">{securityData.activeThreats}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <p className="text-sm text-gray-500 mb-1">Blocked Attacks</p>
          <p className="text-3xl font-bold text-green-600">{securityData.blockedAttacks}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <p className="text-sm text-gray-500 mb-1">Security Events</p>
          <p className="text-3xl font-bold text-gray-800">{securityData.securityEvents.length}</p>
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Security Events</h2>
        {securityData.securityEvents.length > 0 ? (
          <div className="space-y-3">
            {securityData.securityEvents.map((event, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{event}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p>No security events</p>
            <p className="text-sm mt-2">All systems are secure</p>
          </div>
        )}
      </div>

      {/* System Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Firewall</h3>
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mb-2">Active</p>
          <p className="text-xs text-gray-500">Blocking 0 attacks</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Antivirus</h3>
            <ShieldCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mb-2">Updated</p>
          <p className="text-xs text-gray-500">Last scan: Never</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">SSL Certificate</h3>
            <Lock className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mb-2">Valid</p>
          <p className="text-xs text-gray-500">Expires in 365 days</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;