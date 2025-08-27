import React from "react";
import { Card, Button } from "@heroui/react";
import { Upload, FileText } from "lucide-react";

interface PdfUploadTabProps {
  pdfFile: File | null;
  pdfProcessing: boolean;
  handlePdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PdfUploadTab({
  pdfFile,
  pdfProcessing,
  handlePdfUpload,
}: PdfUploadTabProps) {
  return (
    <div className="pt-4 space-y-4">
      <div className="text-center p-8 border-2 border-dashed border-default-300 rounded-lg">
        <Upload size={48} className="mx-auto mb-4 text-default-400" />
        <h3 className="text-lg font-semibold mb-2">Upload Course List PDF</h3>
        <p className="text-default-500 mb-4">
          Upload a PDF containing your course list. The system will
          automatically parse and extract course information.
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="hidden"
          id="pdf-upload"
        />
        <Button
          as="label"
          htmlFor="pdf-upload"
          color="primary"
          startContent={<Upload size={16} />}
          disabled={pdfProcessing}
        >
          {pdfProcessing ? "Processing..." : "Choose PDF File"}
        </Button>
      </div>

      {pdfFile && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText size={20} />
            <div>
              <p className="font-medium">{pdfFile.name}</p>
              <p className="text-sm text-default-500">
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {pdfProcessing && (
            <div className="mt-3">
              <div className="w-full bg-default-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-sm text-default-500 mt-1">Processing PDF...</p>
            </div>
          )}
        </Card>
      )}

      <div className="bg-default-100 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">PDF Format Guidelines:</h4>
        <ul className="text-sm text-default-600 space-y-1">
          <li>
            • The PDF <b>must</b> be downloaded from MyBU - Schedule
          </li>
          <li>• Each semester's PDF must be uploaded as separate files</li>
          <li>
            • Supported formats: PDF downloaded directly from MyBU <b>only</b>
          </li>
        </ul>
      </div>
    </div>
  );
}
