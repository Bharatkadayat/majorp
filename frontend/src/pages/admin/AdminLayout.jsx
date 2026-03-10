import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  Shield, 
  BarChart3, 
  User,
  Globe,
  Menu,
  X,
  LogOut,
  Bell
} from 'lucide-react';
import { getContract, isAdmin } from '../../utils/contract';
import { clearAuthSession } from '../../utils/authApi';
import { getProfile } from '../../utils/profileApi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    loadAdminProfile();
  }, [adminAddress]);

  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      const admin = await isAdmin();
      
      if (!admin) {
        setError("Access denied. Admin only area.");
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      const contract = await getContract();
      const signer = await contract.signer.getAddress();
      setAdminAddress(signer);
      setLoading(false);
    } catch (err) {
      console.error("Error checking admin:", err);
      setError("Failed to verify admin access");
      setLoading(false);
    }
  };

  const loadAdminProfile = () => {
    if (adminAddress) {
      getProfile("admin", adminAddress)
        .then((profile) => {
          if (!profile) return;
          setAdminName(profile.displayName || "Admin");
          setAvatarUrl(profile.avatarUrl || "");
          localStorage.setItem(`admin_profile_${adminAddress}`, JSON.stringify(profile));
        })
        .catch(() => {
          const saved = localStorage.getItem(`admin_profile_${adminAddress}`);
          if (saved) {
            const profile = JSON.parse(saved);
            setAdminName(profile.displayName || "Admin");
            setAvatarUrl(profile.avatarUrl || "");
          }
        });
    }
  };

  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail.role === 'admin') {
        setAdminName(e.detail.name || 'Admin');
        setAvatarUrl(e.detail.avatarUrl || '');
      }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Institutions', href: '/admin/institutions', icon: Building2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Security', href: '/admin/security', icon: Shield },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Website', href: '/admin/site-content', icon: Globe },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-md text-center border border-white/40">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="app-ambient" />
      <div className="app-grid-overlay" />
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl border-r border-white/40"></div>
        
        <div className="relative h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/40">
            <Link to="/admin" className="brand-chip">
              <div className="brand-icon-3d w-8 h-8 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">EduBlockchain</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile */}
          <div className="p-4 border-b border-white/40">
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="admin avatar"
                  className="w-10 h-10 rounded-lg object-cover shadow-md ring-2 ring-blue-100"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md ring-2 ring-blue-100">
                  <span className="text-white font-medium">{adminName.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-gray-800 font-medium truncate">{adminName}</p>
                <p className="text-gray-500 text-xs">{adminAddress.substring(0, 6)}...{adminAddress.substring(38)}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/40">
            <button 
              onClick={() => { clearAuthSession(); navigate('/'); }}
              className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/30 backdrop-blur-xl border-b border-white/40">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/50 lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <h1 className="text-gray-800 font-medium capitalize truncate max-w-[45vw]">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </h1>

            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-white/50">
                <Bell className="w-4 h-4 text-gray-600" />
              </button>
              <Link to="/admin/profile">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="admin avatar"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">{adminName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="content-wrap p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
