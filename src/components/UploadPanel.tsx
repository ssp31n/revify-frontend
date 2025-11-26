import React, { useState, useRef, useEffect } from "react";
import { sessionsApi } from "@/lib/sessionsApi";
import {
  Upload,
  FileArchive,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

interface UploadPanelProps {
  sessionId: string;
  onUploadComplete: () => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({
  sessionId,
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);

  // 컴포넌트 언마운트 시 SSE 연결 종료
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // 간단한 ZIP 파일 검증
      if (
        !selectedFile.name.endsWith(".zip") &&
        selectedFile.type !== "application/zip" &&
        selectedFile.type !== "application/x-zip-compressed"
      ) {
        alert("Only ZIP files are allowed.");
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
      setErrorMsg("");
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      setMessage("Uploading file...");

      // 1. 파일 업로드 요청
      const { uploadId } = await sessionsApi.uploadFile(sessionId, file);

      setStatus("processing");
      setMessage("Processing on server...");

      // 2. SSE 연결 (진행 상황 수신)
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000";
      const sseUrl = `${backendUrl}/sessions/${sessionId}/uploads/${uploadId}/events`;

      // withCredentials: true로 설정하여 쿠키 전송 (백엔드 requireAuth 통과용)
      const evtSource = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = evtSource;

      evtSource.onmessage = (e) => {
        console.log("SSE Ping:", e.data);
      };

      evtSource.addEventListener("progress", (e) => {
        const msgEvent = e as MessageEvent;
        const data = JSON.parse(msgEvent.data);
        setProgress(data.percent);
        setMessage(data.message);
      });

      evtSource.addEventListener("done", (e) => {
        const msgEvent = e as MessageEvent;
        const data = JSON.parse(msgEvent.data);
        setProgress(100);
        setMessage(data.message);
        setStatus("done");
        evtSource.close();
        onUploadComplete(); // 부모 컴포넌트에 알림
      });

      evtSource.addEventListener("error", (e) => {
        console.error("SSE Error:", e);
        const msgEvent = e as MessageEvent;

        if (msgEvent.data) {
          try {
            const data = JSON.parse(msgEvent.data);
            setErrorMsg(data.message || "Processing failed");
          } catch {
            setErrorMsg("Unknown error occurred");
          }
        } else {
          setErrorMsg("Connection lost or server error");
        }
        setStatus("error");
        evtSource.close();
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.response?.data?.error?.message || "Upload failed");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setMessage("");
    setErrorMsg("");
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-card shadow-sm space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Upload className="h-5 w-5" /> Code Upload
      </h3>

      {status === "idle" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <FileArchive className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">
                  {file ? file.name : "Select a ZIP file"}
                </span>
                <input
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </label>
          </div>
          <button
            onClick={handleUpload}
            disabled={!file}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Start Upload
          </button>
        </div>
      )}

      {(status === "uploading" || status === "processing") && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{message}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex flex-col items-center justify-center py-4 text-green-600 gap-2">
          <CheckCircle className="h-10 w-10" />
          <p className="font-medium">Upload Complete!</p>
          <button
            onClick={resetUpload}
            className="text-sm underline text-muted-foreground hover:text-foreground"
          >
            Upload another file
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{errorMsg}</p>
          </div>
          <button
            onClick={resetUpload}
            className="text-destructive/80 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadPanel;
