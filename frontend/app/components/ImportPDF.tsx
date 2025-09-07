import React from "react";
import { Card, Button } from "@heroui/react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  ArrowRight,
  Eye,
} from "lucide-react";

type Course = {
  id: number;
  courseId: string;
  course: string;
  credits: number;
  requirements: string;
  semester?: string;
  professor?: string;
  description?: string;
  hubRequirements?: string[];
};

interface PdfUploadTabProps {
  pdfFile: File | null;
  pdfProcessing: boolean;
  handlePdfUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pdfError?: string | null;
  enrolledCourses?: Course[];
  onNavigate?: (page: string) => void;
}

export default function PdfUploadTab({
  pdfFile,
  pdfProcessing,
  handlePdfUpload,
  pdfError,
  enrolledCourses = [],
  onNavigate,
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
          {pdfError && (
            <div className="mt-3 flex items-center gap-2 text-red-500">
              <XCircle size={16} />
              <p className="text-sm">{pdfError}</p>
            </div>
          )}
        </Card>
      )}

      {!pdfProcessing && pdfFile && !pdfError && enrolledCourses.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={20} className="text-green-500" />
            <h4 className="font-semibold">PDF Processing Complete!</h4>
          </div>

          <div className="p-3 bg-green-50 rounded-lg mb-4">
            <p className="text-sm text-green-700">
              ✅ Your PDF has been processed and courses have been added to your
              enrolled courses list.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<Eye size={16} />}
              onPress={() => onNavigate && onNavigate("your-courses")}
              endContent={<ArrowRight size={14} />}
            >
              View Your Courses ({enrolledCourses.length})
            </Button>
            <Button variant="bordered" onPress={() => window.location.reload()}>
              Upload Another PDF
            </Button>
          </div>
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

      <Card className="p-4">
        <h4 className="font-semibold mb-2">How it works:</h4>
        <ol className="text-sm text-default-600 space-y-2">
          <li>1. Upload your MyBU schedule PDF using the button above</li>
          <li>
            2. Our system will process the PDF and extract course information
          </li>
          <li>
            3. Course details and hub requirements will be automatically
            identified
          </li>
          <li>
            4. All extracted courses will be added to your enrolled courses list
          </li>
          <li>
            5. Navigate to "Your Courses" to see the results and manage your
            courses
          </li>
        </ol>
      </Card>
    </div>
  );
}
