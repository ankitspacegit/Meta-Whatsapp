import React, { useState } from 'react';
import {
  Upload, FileText, CheckCircle, AlertCircle, Clock,
  X, Download, Eye, ChevronDown, Plus, FileSpreadsheet,
} from 'lucide-react';
import { useWhatsAppData } from '../context/WhatsAppDataContext';
import { useToast } from '../context/ToastContext';

const STATUS_META = {
  pending:    { color: 'bg-amber-100 text-amber-700',  icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-700',    icon: Clock },
  completed:  { color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  failed:     { color: 'bg-red-100 text-red-600',      icon: AlertCircle },
};

export default function ImportLogsPage() {
  const { importLogs, createImportLog, contacts } = useWhatsAppData();
  const { showSuccess, showError } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
    } else {
      showError('Invalid File', 'Please upload a CSV or XLSX file.');
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;
    const rowCount = Math.floor(Math.random() * 400) + 50;
    createImportLog({
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      rowCount,
      successCount: rowCount - Math.floor(rowCount * 0.05),
      failCount: Math.floor(rowCount * 0.05),
      status: 'completed',
      importedAt: new Date().toISOString(),
    });
    showSuccess('Import Complete', `${selectedFile.name} imported successfully.`);
    setSelectedFile(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Import Logs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {importLogs.length === 0
              ? 'Bulk-import contacts from CSV or Excel files.'
              : `${importLogs.length} import${importLogs.length !== 1 ? 's' : ''} · ${contacts.length} total contacts`}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-5">
        <h2 className="font-bold text-gray-900 text-sm mb-4">Upload Contact File</h2>

        {!selectedFile ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition text-center ${
              isDragging ? 'border-wa-teal bg-green-50' : 'border-gray-200 hover:border-wa-teal/50 hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('file-input-import')?.click()}
          >
            <input
              id="file-input-import"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleFileDrop}
            />
            <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-wa-teal' : 'text-gray-300'}`} />
            <p className="text-sm font-semibold text-gray-700">
              {isDragging ? 'Drop your file here' : 'Drag & drop your CSV or XLSX file'}
            </p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <div className="mt-4 flex gap-2">
              {['CSV', 'XLSX'].map((ext) => (
                <span key={ext} className="px-2 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-lg">.{ext.toLowerCase()}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-wa-teal" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-wa-teal hover:bg-wa-dark text-white text-xs font-bold rounded-xl transition"
              >
                Start Import
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CSV Format Guide */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-[11px] font-semibold text-gray-600 mb-1.5">Required CSV Format:</p>
          <code className="text-[11px] text-gray-500 font-mono block">
            name, mobile_number, email (optional), tags (optional)
          </code>
          <p className="text-[11px] text-gray-400 mt-1">
            Mobile numbers must be in E.164 format (e.g. +919876543210).
          </p>
        </div>
      </div>

      {/* Import History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">Import History</h2>
        </div>

        {importLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No imports yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload a CSV file above to import contacts in bulk.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">File</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Rows</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Success / Failed</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {importLogs.map((log) => {
                const meta = STATUS_META[log.status] || STATUS_META.pending;
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-5 h-5 text-gray-300 shrink-0" />
                        <span className="font-semibold text-gray-800 text-xs">{log.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell text-xs text-gray-500 font-mono">{log.rowCount?.toLocaleString()}</td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <span className="text-xs text-green-600 font-semibold">{log.successCount?.toLocaleString()}</span>
                      <span className="text-xs text-gray-300 mx-1">/</span>
                      <span className="text-xs text-red-500 font-semibold">{log.failCount?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${meta.color}`}>
                        <meta.icon className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell text-[11px] text-gray-400">
                      {log.importedAt ? new Date(log.importedAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
