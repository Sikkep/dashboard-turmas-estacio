"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface UploadFormProps {
  lastSync: string | null;
  onSyncComplete: () => void;
}

export default function UploadForm({ lastSync, onSyncComplete }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  } | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus({
          type: "success",
          message: `Arquivo processado: ${data.data.count} registros atualizados`,
        });
        setFile(null);
        onSyncComplete();
      } else {
        setUploadStatus({
          type: "error",
          message: data.message || "Erro ao processar arquivo",
        });
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Erro ao enviar arquivo",
      });
    } finally {
      setIsUploading(false);
    }
  }, [file, onSyncComplete]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setSyncStatus({
          type: "success",
          message: `Sincronização completa: ${data.data.portfolioCount} turmas, ${data.data.capCount} registros CAP`,
        });
        onSyncComplete();
      } else {
        setSyncStatus({
          type: "error",
          message: data.message || "Erro ao sincronizar dados",
        });
      }
    } catch (error) {
      setSyncStatus({
        type: "error",
        message: "Erro ao sincronizar dados",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [onSyncComplete]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Nunca";
    const date = new Date(dateStr);
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload e Sincronização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Last sync info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última atualização: {formatDate(lastSync)}</span>
        </div>

        {/* Sync from files */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sincronizar dados dos arquivos existentes</Label>
          <p className="text-xs text-muted-foreground">
            Lê os arquivos portfolio.xlsx e CAP_2026.csv da pasta upload e sincroniza com o banco de dados.
          </p>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar Dados
              </>
            )}
          </Button>
          {syncStatus && (
            <div
              className={`flex items-center gap-2 text-sm ${
                syncStatus.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {syncStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {syncStatus.message}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou envie um novo arquivo
            </span>
          </div>
        </div>

        {/* Upload new CAP file */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Upload de novo arquivo CAP</Label>
          <p className="text-xs text-muted-foreground">
            Envie um novo arquivo CSV do CAP para atualizar os dados. O arquivo deve ter encoding ISO-8859-1 e separador ponto-e-vírgula.
          </p>
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              variant="secondary"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </div>
          {file && !uploadStatus && (
            <p className="text-xs text-muted-foreground">
              Arquivo selecionado: {file.name}
            </p>
          )}
          {uploadStatus && (
            <div
              className={`flex items-center gap-2 text-sm ${
                uploadStatus.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {uploadStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {uploadStatus.message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
