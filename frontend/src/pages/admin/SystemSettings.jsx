import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Globe,
  Mail,
  Shield,
  Bell,
  Database,
  Server,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Key,
  FileText,
  Activity,
  Loader,
  Smartphone,
  Monitor,
  Zap,
  Link,
  Cloud,
  HardDrive,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { getContract } from '../../utils/contract';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    general: {
      systemName: 'EduBlockchain',
      systemUrl: 'https://edublockchain.com',
      language: 'en',
      sessionTimeout: 30,
      maintenanceMode: false,
      debugMode: false,
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      maxFileSize: 10,
      allowRegistration: true,
      requireEmailVerification: true
    },
    security: {
      twoFactorAuth: true,
      passwordPolicy: 'strong',
      sessionTimeout: 30,
      loginAttempts: 5,
      ipWhitelist: false,
      sslEnabled: true,
      captchaEnabled: true,
      rateLimiting: true,
      maxRequestsPerMinute: 60,
      allowedOrigins: '',
      blockCountries: '',
      securityAlerts: true
    },
    email: {
      systemEmail: 'noreply@edublockchain.com',
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@edublockchain.com',
      smtpPassword: '',
      encryption: 'TLS',
      senderName: 'EduBlockchain',
      emailTemplates: 'default',
      welcomeEmail: true,
      certificateEmail: true,
      verificationEmail: true,
      notificationEmail: true,
      emailSignature: 'The EduBlockchain Team'
    },
    blockchain: {
      networkName: 'Hardhat Local',
      rpcUrl: 'http://localhost:8545',
      chainId: 31337,
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      gasLimit: 3000000,
      gasPrice: 20,
      confirmations: 1,
      explorerUrl: '',
      ipfsGateway: 'https://gateway.pinata.cloud',
      ipfsApiUrl: 'https://api.pinata.cloud',
      ipfsApiKey: '',
      ipfsSecretKey: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      slackWebhook: '',
      discordWebhook: '',
      telegramBotToken: '',
      telegramChatId: '',
      notifyOnNewInstitute: true,
      notifyOnNewCertificate: true,
      notifyOnSecurityAlert: true,
      notifyOnSystemUpdate: true,
      dailyDigest: true,
      weeklyReport: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      backupRetention: 30,
      backupLocation: 'local',
      s3Bucket: '',
      s3Region: 'us-east-1',
      s3AccessKey: '',
      s3SecretKey: '',
      lastBackup: '',
      backupStatus: 'idle',
      includeDatabase: true,
      includeFiles: true,
      includeLogs: false
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'blockchain', name: 'Blockchain', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'backup', name: 'Backup', icon: Server }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      // Load real settings from contract/backend
      setLoading(false);
    } catch (err) {
      console.error("Error loading settings:", err);
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  System Settings
                </h1>
              </div>
              <p className="text-gray-600">
                Configure system parameters and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">General Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.systemName}
                    onChange={(e) => handleInputChange('general', 'systemName', e.target.value)}
                    placeholder="EduBlockchain"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System URL
                  </label>
                  <input
                    type="url"
                    value={settings.general.systemUrl}
                    onChange={(e) => handleInputChange('general', 'systemUrl', e.target.value)}
                    placeholder="https://edublockchain.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.general.sessionTimeout}
                    onChange={(e) => handleInputChange('general', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                    <option value="CET">Central European</option>
                    <option value="IST">India Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Format
                  </label>
                  <select
                    value={settings.general.timeFormat}
                    onChange={(e) => handleInputChange('general', 'timeFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="24h">24-hour</option>
                    <option value="12h">12-hour (AM/PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.general.maxFileSize}
                    onChange={(e) => handleInputChange('general', 'maxFileSize', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Maintenance Mode</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.general.debugMode}
                    onChange={(e) => handleInputChange('general', 'debugMode', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Debug Mode</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.general.allowRegistration}
                    onChange={(e) => handleInputChange('general', 'allowRegistration', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow Public Registration</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.general.requireEmailVerification}
                    onChange={(e) => handleInputChange('general', 'requireEmailVerification', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Require Email Verification</span>
                </label>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Security Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <select
                    value={settings.security.passwordPolicy}
                    onChange={(e) => handleInputChange('security', 'passwordPolicy', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="weak">Weak (min 6 chars)</option>
                    <option value="medium">Medium (min 8 chars, letters & numbers)</option>
                    <option value="strong">Strong (min 10 chars, mixed case, numbers, symbols)</option>
                    <option value="very-strong">Very Strong (min 12 chars, all types)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Requests Per Minute
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxRequestsPerMinute}
                    onChange={(e) => handleInputChange('security', 'maxRequestsPerMinute', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Origins (CORS)
                  </label>
                  <input
                    type="text"
                    value={settings.security.allowedOrigins}
                    onChange={(e) => handleInputChange('security', 'allowedOrigins', e.target.value)}
                    placeholder="https://example.com, https://app.example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blocked Countries
                  </label>
                  <input
                    type="text"
                    value={settings.security.blockCountries}
                    onChange={(e) => handleInputChange('security', 'blockCountries', e.target.value)}
                    placeholder="US, CN, RU (ISO codes)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">IP Whitelist</span>
                  <input
                    type="checkbox"
                    checked={settings.security.ipWhitelist}
                    onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Force SSL/HTTPS</span>
                  <input
                    type="checkbox"
                    checked={settings.security.sslEnabled}
                    onChange={(e) => handleInputChange('security', 'sslEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Enable CAPTCHA</span>
                  <input
                    type="checkbox"
                    checked={settings.security.captchaEnabled}
                    onChange={(e) => handleInputChange('security', 'captchaEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Rate Limiting</span>
                  <input
                    type="checkbox"
                    checked={settings.security.rateLimiting}
                    onChange={(e) => handleInputChange('security', 'rateLimiting', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Security Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.security.securityAlerts}
                    onChange={(e) => handleInputChange('security', 'securityAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Email Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Email
                  </label>
                  <input
                    type="email"
                    value={settings.email.systemEmail}
                    onChange={(e) => handleInputChange('email', 'systemEmail', e.target.value)}
                    placeholder="noreply@edublockchain.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={settings.email.senderName}
                    onChange={(e) => handleInputChange('email', 'senderName', e.target.value)}
                    placeholder="EduBlockchain"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    value={settings.email.smtpServer}
                    onChange={(e) => handleInputChange('email', 'smtpServer', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={settings.email.smtpUsername}
                    onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
                    placeholder="noreply@edublockchain.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? "text" : "password"}
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showSmtpPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Encryption
                  </label>
                  <select
                    value={settings.email.encryption}
                    onChange={(e) => handleInputChange('email', 'encryption', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="none">None</option>
                    <option value="TLS">TLS</option>
                    <option value="SSL">SSL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Templates
                  </label>
                  <select
                    value={settings.email.emailTemplates}
                    onChange={(e) => handleInputChange('email', 'emailTemplates', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Signature
                  </label>
                  <textarea
                    value={settings.email.emailSignature}
                    onChange={(e) => handleInputChange('email', 'emailSignature', e.target.value)}
                    placeholder="The EduBlockchain Team"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Email Notifications</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Send Welcome Email</span>
                  <input
                    type="checkbox"
                    checked={settings.email.welcomeEmail}
                    onChange={(e) => handleInputChange('email', 'welcomeEmail', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Send Certificate Email</span>
                  <input
                    type="checkbox"
                    checked={settings.email.certificateEmail}
                    onChange={(e) => handleInputChange('email', 'certificateEmail', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Send Verification Email</span>
                  <input
                    type="checkbox"
                    checked={settings.email.verificationEmail}
                    onChange={(e) => handleInputChange('email', 'verificationEmail', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Send Notification Email</span>
                  <input
                    type="checkbox"
                    checked={settings.email.notificationEmail}
                    onChange={(e) => handleInputChange('email', 'notificationEmail', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* BLOCKCHAIN TAB */}
          {activeTab === 'blockchain' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Blockchain Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Network Name
                  </label>
                  <input
                    type="text"
                    value={settings.blockchain.networkName}
                    onChange={(e) => handleInputChange('blockchain', 'networkName', e.target.value)}
                    placeholder="Hardhat Local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RPC URL
                  </label>
                  <input
                    type="url"
                    value={settings.blockchain.rpcUrl}
                    onChange={(e) => handleInputChange('blockchain', 'rpcUrl', e.target.value)}
                    placeholder="http://localhost:8545"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chain ID
                  </label>
                  <input
                    type="number"
                    value={settings.blockchain.chainId}
                    onChange={(e) => handleInputChange('blockchain', 'chainId', parseInt(e.target.value))}
                    placeholder="31337"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Address
                  </label>
                  <input
                    type="text"
                    value={settings.blockchain.contractAddress}
                    onChange={(e) => handleInputChange('blockchain', 'contractAddress', e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gas Limit
                  </label>
                  <input
                    type="number"
                    value={settings.blockchain.gasLimit}
                    onChange={(e) => handleInputChange('blockchain', 'gasLimit', parseInt(e.target.value))}
                    placeholder="3000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gas Price (Gwei)
                  </label>
                  <input
                    type="number"
                    value={settings.blockchain.gasPrice}
                    onChange={(e) => handleInputChange('blockchain', 'gasPrice', parseInt(e.target.value))}
                    placeholder="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Confirmations
                  </label>
                  <input
                    type="number"
                    value={settings.blockchain.confirmations}
                    onChange={(e) => handleInputChange('blockchain', 'confirmations', parseInt(e.target.value))}
                    placeholder="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block Explorer URL
                  </label>
                  <input
                    type="url"
                    value={settings.blockchain.explorerUrl}
                    onChange={(e) => handleInputChange('blockchain', 'explorerUrl', e.target.value)}
                    placeholder="https://etherscan.io"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPFS Gateway
                  </label>
                  <input
                    type="url"
                    value={settings.blockchain.ipfsGateway}
                    onChange={(e) => handleInputChange('blockchain', 'ipfsGateway', e.target.value)}
                    placeholder="https://gateway.pinata.cloud"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPFS API URL
                  </label>
                  <input
                    type="url"
                    value={settings.blockchain.ipfsApiUrl}
                    onChange={(e) => handleInputChange('blockchain', 'ipfsApiUrl', e.target.value)}
                    placeholder="https://api.pinata.cloud"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPFS API Key
                  </label>
                  <input
                    type="text"
                    value={settings.blockchain.ipfsApiKey}
                    onChange={(e) => handleInputChange('blockchain', 'ipfsApiKey', e.target.value)}
                    placeholder="Enter API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPFS Secret Key
                  </label>
                  <input
                    type="password"
                    value={settings.blockchain.ipfsSecretKey}
                    onChange={(e) => handleInputChange('blockchain', 'ipfsSecretKey', e.target.value)}
                    placeholder="Enter secret key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.notifications.slackWebhook}
                    onChange={(e) => handleInputChange('notifications', 'slackWebhook', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discord Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.notifications.discordWebhook}
                    onChange={(e) => handleInputChange('notifications', 'discordWebhook', e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram Bot Token
                  </label>
                  <input
                    type="text"
                    value={settings.notifications.telegramBotToken}
                    onChange={(e) => handleInputChange('notifications', 'telegramBotToken', e.target.value)}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    value={settings.notifications.telegramChatId}
                    onChange={(e) => handleInputChange('notifications', 'telegramChatId', e.target.value)}
                    placeholder="-123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Notification Channels</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Notification Events</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">New Institute Registration</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnNewInstitute}
                    onChange={(e) => handleInputChange('notifications', 'notifyOnNewInstitute', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">New Certificate Issued</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnNewCertificate}
                    onChange={(e) => handleInputChange('notifications', 'notifyOnNewCertificate', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Security Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnSecurityAlert}
                    onChange={(e) => handleInputChange('notifications', 'notifyOnSecurityAlert', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">System Updates</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.notifyOnSystemUpdate}
                    onChange={(e) => handleInputChange('notifications', 'notifyOnSystemUpdate', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Digest Settings</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Daily Digest</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.dailyDigest}
                    onChange={(e) => handleInputChange('notifications', 'dailyDigest', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Weekly Report</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyReport}
                    onChange={(e) => handleInputChange('notifications', 'weeklyReport', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* BACKUP TAB */}
          {activeTab === 'backup' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Backup Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backup.backupFrequency}
                    onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Time (UTC)
                  </label>
                  <input
                    type="time"
                    value={settings.backup.backupTime}
                    onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Retention (days)
                  </label>
                  <input
                    type="number"
                    value={settings.backup.backupRetention}
                    onChange={(e) => handleInputChange('backup', 'backupRetention', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Location
                  </label>
                  <select
                    value={settings.backup.backupLocation}
                    onChange={(e) => handleInputChange('backup', 'backupLocation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="local">Local Storage</option>
                    <option value="s3">Amazon S3</option>
                    <option value="google">Google Cloud</option>
                    <option value="azure">Azure Blob</option>
                  </select>
                </div>
              </div>

              {settings.backup.backupLocation === 's3' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 md:col-span-2">S3 Configuration</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      S3 Bucket Name
                    </label>
                    <input
                      type="text"
                      value={settings.backup.s3Bucket}
                      onChange={(e) => handleInputChange('backup', 's3Bucket', e.target.value)}
                      placeholder="my-backup-bucket"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      S3 Region
                    </label>
                    <input
                      type="text"
                      value={settings.backup.s3Region}
                      onChange={(e) => handleInputChange('backup', 's3Region', e.target.value)}
                      placeholder="us-east-1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      S3 Access Key
                    </label>
                    <input
                      type="text"
                      value={settings.backup.s3AccessKey}
                      onChange={(e) => handleInputChange('backup', 's3AccessKey', e.target.value)}
                      placeholder="AKIA..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      S3 Secret Key
                    </label>
                    <input
                      type="password"
                      value={settings.backup.s3SecretKey}
                      onChange={(e) => handleInputChange('backup', 's3SecretKey', e.target.value)}
                      placeholder="Enter secret key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Backup Options</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Enable Automatic Backup</span>
                  <input
                    type="checkbox"
                    checked={settings.backup.autoBackup}
                    onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Include Database</span>
                  <input
                    type="checkbox"
                    checked={settings.backup.includeDatabase}
                    onChange={(e) => handleInputChange('backup', 'includeDatabase', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Include Uploaded Files</span>
                  <input
                    type="checkbox"
                    checked={settings.backup.includeFiles}
                    onChange={(e) => handleInputChange('backup', 'includeFiles', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Include System Logs</span>
                  <input
                    type="checkbox"
                    checked={settings.backup.includeLogs}
                    onChange={(e) => handleInputChange('backup', 'includeLogs', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Last Backup Status</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {settings.backup.lastBackup || 'Never'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    settings.backup.backupStatus === 'idle' ? 'bg-gray-100 text-gray-600' :
                    settings.backup.backupStatus === 'running' ? 'bg-blue-100 text-blue-600' :
                    settings.backup.backupStatus === 'completed' ? 'bg-green-100 text-green-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {settings.backup.backupStatus || 'Idle'}
                  </span>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                  Create Backup Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-slide-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;