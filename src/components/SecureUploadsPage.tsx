import React, { useState, useRef, useEffect } from 'react';
import { UserSubscription } from '../types';
import { 
  UploadCloud, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Image, 
  Sparkles, 
  RefreshCw, 
  Info, 
  Trash2, 
  Lock, 
  AlertTriangle, 
  FileCheck, 
  CheckCircle2, 
  Loader2,
  ExternalLink
} from 'lucide-react';

interface SecureUploadsPageProps {
  subscription: UserSubscription;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  s3Key: string;
  mimeType: string;
  fileSizeBytes: number;
  scanStatus: 'clean' | 'infected' | 'scanning' | 'unscanned';
  isSanitized: boolean;
  createdAt: string;
}

interface SecurityReport {
  scannedAt: string;
  engine: string;
  status: 'clean' | 'infected';
  statusMessage: string;
  sanitizationLog: string[];
  fileIntegrityHash: string;
}

export default function SecureUploadsPage({ subscription }: SecureUploadsPageProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // Drag & drop state
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Upload and verification states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [activeUploadName, setActiveUploadName] = useState<string>('');
  const [securityScanPhase, setSecurityScanPhase] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Detailed security audit review card
  const [activeReport, setActiveReport] = useState<{
    doc: UploadedDocument;
    report: SecurityReport;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/uploads/list');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching registered uploads:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setActiveUploadName(file.name);
    
    // 1. Client-Side Constraints Check
    const allowedMimeTypes = [
      'text/plain', 
      'text/markdown', 
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    if (file.size > maxSizeBytes) {
      setErrorMessage(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds standard 10MB secure quota boundary.`);
      return;
    }

    if (!allowedMimeTypes.includes(file.type)) {
      setErrorMessage(`Unsupported format (${file.type || 'unknown'}). Only plain text (.txt, .md), images (PNG, JPEG, WebP), PDF, and DOCX documents qualify.`);
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setSecurityScanPhase('requesting_presign');

    try {
      // 2. Query pre-signed URL from ScribeStone secure route
      setSecurityScanPhase('Acquiring pre-signed AWS S3 uplink credentials...');
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size
        })
      });

      if (!presignRes.ok) {
        const errorData = await presignRes.json();
        throw new Error(errorData.message || 'Failed to acquire S3 pre-signed upload credentials.');
      }

      const { presignedUrl, s3Key, fileName } = await presignRes.json();

      // 3. PUT raw file contents directly to S3 tracking upload progress
      setSecurityScanPhase('Streaming sanitized bits directly to cloud storage ledger...');
      
      const uploadSuccess = await new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentage);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(true);
          } else {
            console.error('S3 PUT returned status', xhr.status, xhr.responseText);
            reject(new Error(`S3 transfer failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during raw S3 stream transfer.'));
        };

        xhr.send(file);
      });

      if (!uploadSuccess) {
        throw new Error('Direct-to-S3 asset transmission stalled.');
      }

      // 4. Trigger active server-side ClamAV Virus scanning and Active code sanitization validation logic
      setUploadProgress(100);
      setSecurityScanPhase('Invoking GuardAV Antivirus Scan Engine...');
      await new Promise(resolve => setTimeout(resolve, 800)); // Cinematic pause

      setSecurityScanPhase('Purging EXIF metadata headers and script macros...');
      const verifyRes = await fetch('/api/uploads/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key })
      });

      if (!verifyRes.ok) {
        const errDetails = await verifyRes.json();
        throw new Error(errDetails.message || 'Sandbox verification stage failed.');
      }

      const verificationData = await verifyRes.json();
      
      // Update local history
      await fetchDocuments();

      // Automatically display the verification log report
      const matchingDoc = documents.find(d => d.s3Key === s3Key) || {
        id: 'temp-id',
        fileName,
        s3Key,
        mimeType: file.type,
        fileSizeBytes: file.size,
        scanStatus: verificationData.scanStatus,
        isSanitized: verificationData.isSanitized,
        createdAt: new Date().toISOString()
      } as UploadedDocument;

      setActiveReport({
        doc: matchingDoc,
        report: verificationData.securityReport
      });

    } catch (err: any) {
      console.error('File secure upload orchestration failed:', err);
      setErrorMessage(err.message || 'An unexpected error compromised document transmittal paths.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(null);
      setActiveUploadName('');
      setSecurityScanPhase('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const selectReportForDoc = async (doc: UploadedDocument) => {
    // Generate simulated/real detailed report for selected list item
    setIsProcessing(true);
    try {
      const verifyRes = await fetch('/api/uploads/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key: doc.s3Key })
      });
      if (verifyRes.ok) {
        const verificationData = await verifyRes.json();
        setActiveReport({
          doc,
          report: verificationData.securityReport
        });
      } else {
        alert('Could not retrieve audit details for this security transaction.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getMimeIcon = (mimeType: string) => {
    const mime = mimeType.toLowerCase();
    if (mime.startsWith('image/')) return <Image className="w-4 h-4 text-[#C8A97E]" />;
    return <FileText className="w-4 h-4 text-[#3E5C4B]" />;
  };

  return (
    <div className="animate-soft-fade px-6 py-10 max-w-7xl mx-auto">
      
      {/* Dynamic Navigation Title */}
      <div className="mb-8 border-b border-[#EBEAE4] pb-5">
        <span className="text-[10px] font-mono text-[#C8A97E] tracking-widest font-bold uppercase">SANDBOXED DATA STORAGE</span>
        <h1 className="font-serif text-2xl font-semibold text-[#1F1F1F]">Secure Asset Hub</h1>
        <p className="text-xs text-[#5C5A52] mt-1 font-light">
          Stream plain text, images, PDFs, or DOCX documents to AWS S3. Every document is audited using <strong>ScribeStone-GuardAV</strong> antivirus scans and active-code sanitizers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Section: Ingest and History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Drag & Drop Upload Zone Component */}
          <div 
            className={`border rounded-2xl p-8 text-center transition-all relative ${
              isDragActive 
                ? 'border-[#3E5C4B] bg-[#3E5C4B]/5' 
                : 'border-dashed border-[#C8A97E]/30 bg-white hover:border-[#3E5C4B]/40 hover:bg-[#FAF9F6]'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onFileInputChange} 
              className="hidden" 
              accept=".txt,.md,.pdf,.docx,image/*"
            />
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3E5C4B]/5 flex items-center justify-center mx-auto text-[#3E5C4B]">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              
              <div>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isProcessing}
                  className="font-serif text-sm font-semibold text-[#1F1F1F] hover:text-[#3E5C4B] underline decoration-[#C8A97E]/60 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Click to select file
                </button>
                <span className="text-xs text-[#5C5A52] font-light"> or drag and drop items here</span>
              </div>
              
              <p className="text-[10px] font-mono text-[#8E8C82] tracking-wider uppercase">
                PDF, WORD (.docx), PNG, JPEG, WEBP, Plain Text • Max 10MB
              </p>

              {/* Status or Progress Block */}
              {isProcessing && uploadProgress !== null && (
                <div className="bg-[#FAF9F6] border border-[#F1EFEA] rounded-xl p-4.5 space-y-3.5 animate-soft-fade text-left">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[#3E5C4B] font-semibold truncate max-w-[200px]">{activeUploadName}</span>
                    <span className="text-[#C8A97E] font-bold">{uploadProgress}%</span>
                  </div>
                  
                  {/* Progress bar scale */}
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#3E5C4B] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-[#5C5A52] font-serif leading-relaxed italic animate-pulse flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-[#C8A97E] animate-spin" />
                    {securityScanPhase}
                  </p>
                </div>
              )}

              {/* Error Callout */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-left flex items-start gap-2.5 animate-soft-fade">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-red-950 block">Sanitization Refused</span>
                    <p className="text-red-800 font-light mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Registered Uploads Audit Table Log */}
          <div className="bg-white border border-[#EBEAE4] rounded-xl overflow-hidden shadow-xs">
            
            <div className="px-5 py-4 border-b border-[#F1EFEA] flex justify-between items-center bg-[#FAF9F6]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#3E5C4B]" />
                <h3 className="font-serif text-sm font-semibold text-[#1F1F1F]">Isolated S3 Asset Ledger</h3>
              </div>
              <button 
                onClick={fetchDocuments}
                title="Refresh cloud inventory log"
                className="p-1 px-2.5 border border-[#E5E3DC] hover:border-[#1F1F1F] bg-white rounded-lg text-stone-500 hover:text-[#1F1F1F] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                REFRESH
              </button>
            </div>

            {isLoadingList ? (
              <div className="p-12 text-center text-xs text-[#5C5A52] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#C8A97E]" />
                <span>Synchronizing PostgreSQL secure asset records...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center max-w-sm mx-auto">
                <FileCheck className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h4 className="font-serif text-xs font-semibold text-[#1F1F1F]">Ledger Empty</h4>
                <p className="text-[11px] text-[#5C5A52] mt-1 leading-relaxed font-light">
                  No documents currently reside inside this user S3 prefix bucket. Drag a file above to begin validation scans.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1EFEA] max-h-96 overflow-y-auto">
                {documents.map((doc) => {
                  const isSelected = activeReport?.doc.id === doc.id;
                  return (
                    <div 
                      key={doc.id}
                      onClick={() => selectReportForDoc(doc)}
                      className={`px-5 py-4 hover:bg-[#FAF9F6] transition-all cursor-pointer flex items-center justify-between gap-4 border-l-2 text-left ${
                        isSelected 
                          ? 'bg-[#3E5C4B]/5 border-l-[#3E5C4B]' 
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getMimeIcon(doc.mimeType)}
                          <span className="text-xs font-semibold text-[#1F1F1F] block truncate" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8E8C82]">
                          <span>{formatFileSize(doc.fileSizeBytes)}</span>
                          <span>•</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Security Status Badge */}
                      <div className="flex items-center gap-1.5 shrink-0 select-none">
                        {doc.scanStatus === 'clean' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#3E5C4B]/10 border border-[#3E5C4B]/10 text-emerald-800 text-[10px] font-mono font-bold tracking-tight">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            SECURE
                          </span>
                        ) : doc.scanStatus === 'infected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-mono font-bold tracking-tight animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            BLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 text-stone-600 text-[10px] font-mono font-bold tracking-tight">
                            <RefreshCw className="w-3 h-3 animate-spin text-stone-500" />
                            SCANNING
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column Section: Detailed Security Audit Report View */}
        <div className="lg:col-span-5">
          
          {!activeReport ? (
            <div className="bg-[#FAF9F6] border border-dashed border-[#D9D6CE] rounded-2xl p-10 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-[#C8A97E] mx-auto opacity-70" />
              <h3 className="font-serif text-[#1F1F1F] font-semibold text-sm">Security Verification Portal</h3>
              <p className="text-[11px] text-[#5C5A52] max-w-xs mx-auto leading-relaxed font-light">
                Select an audited file from the inventory ledger on the left to review the deep GuardAV security scan findings.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#EBEAE4] rounded-2xl p-6 space-y-6 animate-soft-fade">
              
              {/* Header */}
              <div className="border-b border-[#F1EFEA] pb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-mono uppercase bg-[#C8A97E]/10 text-[#7C5A14] px-2 py-0.5 rounded border border-[#C8A97E]/20">
                    ScribeStone Shield Log
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                    POST-UPLOAD CHECK
                  </span>
                </div>
                
                <h3 className="font-serif text-[#1F1F1F] font-bold text-base line-clamp-2" title={activeReport.doc.fileName}>
                  {activeReport.doc.fileName}
                </h3>
                
                <span className="block text-[10px] font-mono text-[#8E8C82] mt-1">
                  Validated at: {new Date(activeReport.report.scannedAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Security Health Indicator Card */}
              <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                activeReport.report.status === 'clean'
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-rose-50 border-rose-100'
              }`}>
                {activeReport.report.status === 'clean' ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <span className="block text-xs font-serif font-semibold text-emerald-950 uppercase tracking-wide">Threat Clearance Match Verified</span>
                    <p className="text-[10px] text-emerald-800 font-light max-w-xs mx-auto">{activeReport.report.statusMessage}</p>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto animate-bounce" />
                    <span className="block text-xs font-serif font-semibold text-rose-950 uppercase tracking-wide">Infection Signature Detected</span>
                    <p className="text-[10px] text-rose-800 font-light max-w-xs mx-auto">{activeReport.report.statusMessage}</p>
                  </>
                )}
              </div>

              {/* Engine Audit Details */}
              <div className="space-y-4">
                <div className="bg-[#FAF9F6] p-4.5 rounded-xl border border-[#F1EFEA] space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#F1EFEA] pb-2">
                    <span className="text-[#8E8C82] uppercase">AUDIT ENGINE</span>
                    <span className="text-[#1F1F1F] font-semibold">{activeReport.report.engine}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#F1EFEA] pb-2">
                    <span className="text-[#8E8C82] uppercase">INTEGRITY HASH (SHA-256)</span>
                    <span className="text-[#1F1F1F] font-semibold max-w-[150px] truncate" title={activeReport.report.fileIntegrityHash}>
                      {activeReport.report.fileIntegrityHash}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#8E8C82] uppercase">IS SANITIZED STATE</span>
                    <span className={`font-semibold ${activeReport.doc.isSanitized ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {activeReport.doc.isSanitized ? 'TRUE (ACTIVE SANITIZED)' : 'FALSE'}
                    </span>
                  </div>
                </div>

                {/* Sanitization logs and actions taken */}
                {activeReport.report.status === 'clean' && (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-mono text-[#8E8C82] uppercase tracking-wider">Sanitization Measures Performed:</span>
                    
                    {activeReport.report.sanitizationLog.length === 0 ? (
                      <p className="text-[11px] text-[#5C5A52] font-light italic pl-1 leading-relaxed">
                        No secondary sanitization measures required for standard ASCII plain files.
                      </p>
                    ) : (
                      <div className="bg-[#FAF9F6] border border-[#F1EFEA] rounded-xl p-3.5 space-y-2">
                        {activeReport.report.sanitizationLog.map((log, index) => (
                          <div key={index} className="flex gap-2 items-start text-[11px] text-[#5C5A52] font-light">
                            <span className="text-emerald-600 font-bold mt-px">✔</span>
                            <p>{log}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Guidance section */}
                <div className="p-4 rounded-xl border border-[#FAF9F6] bg-[#FAF9F6]/50 flex gap-3 text-left">
                  <Info className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
                  <div className="text-[10px] leading-relaxed text-[#5C5A52] font-light">
                    {activeReport.report.status === 'clean' ? (
                      <p>
                        This file is quarantined within its sandboxed sub-directory prefix block in AWS S3 is declared clean. You can securely pull this document within other pipeline executors such as the Voice Refinement parser.
                      </p>
                    ) : (
                      <p>
                        <strong>Active Threat:</strong> ScribeStone Shield quarantined this asset immediately. Node system threads are forbidden from reading the contents of this target key to protect compiler environments.
                      </p>
                    )}
                  </div>
                </div>

                {/* Close Report */}
                <button
                  onClick={() => setActiveReport(null)}
                  className="w-full border border-[#FAF9F6] bg-stone-100 hover:bg-[#FAF9F6]/50 text-stone-700 text-xs font-semibold py-2 rounded-lg text-center cursor-pointer transition-colors"
                >
                  Dismiss Scan Report
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
