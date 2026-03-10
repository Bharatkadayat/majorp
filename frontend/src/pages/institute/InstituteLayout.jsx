import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload,
  Users,
  Database,
  Layers3,
  FileText,
  BarChart3,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  GraduationCap,
  ChevronDown,
  Award
} from 'lucide-react';
import { getContract } from '../../utils/contract';
import { clearAuthSession } from '../../utils/authApi';
import { getProfile } from '../../utils/profileApi';

const InstituteLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [instituteName, setInstituteName] = useState('Institute');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadInstituteData();
  }, []);

  const loadInstituteData = async () => {
    try {
      const contract = await getContract();
      const signer = await contract.signer.getAddress();
      setWalletAddress(signer);

      // Load institute profile
      try {
        const profile = await getProfile("institute", signer);
        if (profile) {
          setInstituteName(profile.displayName || "Institute");
          setAvatarUrl(profile.avatarUrl || "");
          localStorage.setItem(`institute_profile_${signer}`, JSON.stringify(profile));
        }
      } catch {
        const saved = localStorage.getItem(`institute_profile_${signer}`);
        if (saved) {
          const profile = JSON.parse(saved);
          setInstituteName(profile.displayName || "Institute");
          setAvatarUrl(profile.avatarUrl || "");
        }
      }

      // Get institute ID from contract
      const basicInfo = await contract.getInstituteBasicInfo(signer);
      setInstituteId(basicInfo[1]);
    } catch (err) {
      console.error("Error loading institute:", err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail.role === 'institute') {
        setInstituteName(e.detail.name || 'Institute');
        setAvatarUrl(e.detail.avatarUrl || '');
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/institute/dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: '/institute/upload', icon: Upload },
    { name: 'Students', href: '/institute/students', icon: Users },
    { name: 'Saved Students', href: '/institute/students/saved', icon: Database },
    { name: 'Batch', href: '/institute/batch', icon: Layers3 },
    { name: 'Records', href: '/institute/records', icon: FileText },
    { name: 'Analytics', href: '/institute/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/institute/profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading institute dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="app-ambient" />
      <div className="app-grid-overlay" />
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-white/20`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
          <Link to="/institute/dashboard" className="brand-chip">
            <div className="brand-icon-3d w-8 h-8 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">EduBlockchain</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Institute Info */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="institute avatar"
                className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-cyan-100"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md ring-2 ring-cyan-100">
                <span className="text-white font-bold text-lg">
                  {instituteName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{instituteName}</p>
              <p className="text-xs text-gray-500">ID: {instituteId}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
          <button 
            onClick={() => { clearAuthSession(); navigate('/'); }}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-300`}>
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-white/20">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/50 lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm min-w-0">
                <Link to="/institute/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">
                  Institute
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-medium capitalize truncate">
                  {location.pathname.split('/').pop() || 'dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Institute ID Badge */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-mono text-blue-700">{instituteId}</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-white/50 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Profile */}
              <Link to="/institute/profile" className="flex items-center space-x-3 p-2 hover:bg-white/50 rounded-lg transition-colors">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="institute avatar"
                    className="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-blue-100"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm ring-1 ring-blue-100">
                    <span className="text-white font-bold text-sm">
                      {instituteName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">{instituteName}</p>
                  <p className="text-xs text-gray-500">Institute</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstituteLayout;
