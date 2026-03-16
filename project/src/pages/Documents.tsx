import React, { useEffect, useState } from 'react';
import { FileText, Download, File } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  created_at: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'claim_form':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'manual':
        return <File className="w-8 h-8 text-purple-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFileTypeBadge = (fileType: string) => {
    const badges: Record<string, string> = {
      claim_form: 'bg-blue-100 text-blue-700',
      application_letter: 'bg-green-100 text-green-700',
      manual: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return badges[fileType] || badges.other;
  };

  const formatFileType = (fileType: string) => {
    return fileType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">Download claim forms, application letters, manuals, and guides</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents available yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{getFileIcon(doc.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{doc.title}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeBadge(
                      doc.file_type
                    )}`}
                  >
                    {formatFileType(doc.file_type)}
                  </span>
                  {doc.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Added {formatDate(doc.created_at)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={doc.file_url}
                  download
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Please ensure all forms are filled out completely and accurately. Incomplete forms may delay processing
                of your referral cases. If you need assistance, contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
