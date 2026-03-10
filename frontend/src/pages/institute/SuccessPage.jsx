import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  Award, 
  ExternalLink,
  Copy,
  Fingerprint,
  Calendar,
  User,
  BookOpen,
  Hash
} from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    mode,
    certificateId,
    fileHash,
    ipfsHash,
    studentName,
    course,
    transactionHash,
    certificateIds = [],
    readyCount = 0,
    totalPrepared = 0
  } = location.state || {};
  const finalFileHash = fileHash || certificateId;
  const isBatch = mode === "batch";

  useEffect(() => {
    // Redirect to records page after 10 seconds
    const timer = setTimeout(() => {
      navigate('/institute/records');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!certificateId && !isBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Certificate Data</h2>
          <p className="text-gray-600 mb-6">No certificate was issued.</p>
          <button 
            onClick={() => navigate('/institute/upload')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Issue New Certificate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isBatch ? "Batch Issued Successfully!" : "Certificate Issued Successfully!"}
          </h1>
          <p className="text-gray-600">
            {isBatch
              ? "Batch certificates have been submitted on-chain and recorded."
              : "The certificate has been permanently stored on the blockchain and IPFS"}
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/40 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Certificate Details</h2>
          </div>

          <div className="space-y-4">
            {isBatch ? (
              <>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Prepared / Issued</p>
                    <p className="text-gray-800 font-medium">{readyCount} issued from {totalPrepared} prepared</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Fingerprint className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Certificate IDs</p>
                    {certificateIds.length > 0 ? (
                      <div className="space-y-1">
                        {certificateIds.map((id, idx) => (
                          <p key={`${id}-${idx}`} className="text-sm font-mono text-gray-800 break-all">
                            {id}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No certificate IDs returned by receipt parsing.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
            {/* Student Name */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Student Name</p>
                <p className="text-gray-800 font-medium">{studentName}</p>
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Course</p>
                <p className="text-gray-800 font-medium">{course}</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Fingerprint className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Certificate ID (File Hash)</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono text-gray-800 break-all">{certificateId}</p>
                  <button
                    onClick={() => copyToClipboard(certificateId)}
                    className="p-1 hover:bg-white rounded transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Raw File Hash */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Fingerprint className="w-5 h-5 text-teal-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">File Hash (SHA-256)</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono text-gray-800 break-all">{finalFileHash}</p>
                  <button
                    onClick={() => copyToClipboard(finalFileHash)}
                    className="p-1 hover:bg-white rounded transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* IPFS Hash */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">IPFS Hash (CID)</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono text-gray-800 break-all">{ipfsHash}</p>
                  <button
                    onClick={() => copyToClipboard(ipfsHash)}
                    className="p-1 hover:bg-white rounded transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Issued On</p>
                <p className="text-gray-800 font-medium">{new Date().toLocaleString()}</p>
              </div>
            </div>
              </>
            )}

            {/* Transaction Hash */}
            {transactionHash && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <ExternalLink className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <p className="text-sm font-mono text-gray-800 break-all">{transactionHash}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isBatch && ipfsHash ? (
            <a
              href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              View on IPFS
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          ) : null}
          {!isBatch && certificateId ? (
            <button
              onClick={() => navigate(`/certificate/${certificateId}`)}
              className="px-6 py-3 border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Open Certificate Details
            </button>
          ) : null}
          <button
            onClick={() => navigate('/institute/records')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go to Records
          </button>
          <button
            onClick={() => navigate(isBatch ? '/institute/batch' : '/institute/upload')}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:shadow-lg transition-all duration-300 border border-blue-200"
          >
            {isBatch ? "Issue Another Batch" : "Issue Another Certificate"}
          </button>
        </div>

        {/* Auto-redirect message */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Redirecting to records page in 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
