"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, GraduationCap, Calendar, RefreshCw } from "lucide-react";
import VisaoGeral from "@/components/VisaoGeral";
import VisaoMeta from "@/components/VisaoMeta";
import TurmasProximas from "@/components/TurmasProximas";
import GapEnturmacao from "@/components/GapEnturmacao";
import UploadForm from "@/components/UploadForm";
import FilterBar from "@/components/FilterBar";

interface Totals {
  inscritosAtual: number;
  inscritosMeta: number;
  inscritosPercent: number;
  matFinAtual: number;
  matFinMeta: number;
  matFinPercent: number;
  finDocAtual: number;
  finDocMeta: number;
  finDocPercent: number;
  matAcadAtual: number;
  matAcadMeta: number;
  matAcadPercent: number;
  totalTurmas: number;
  turmasComDados: number;
  turmasConfirmadas: number;
  turmasNaoConfirmadas: number;
}

interface TurmaData {
  id: string;
  sku: string;
  codCampus: string;
  nomeCampus: string;
  codCurso: string;
  nomeCurso: string;
  codTurno: string;
  turno: string;
  temDados: boolean;
  inscritosAtual: number;
  inscritosMeta: number;
  inscritosPercent: number;
  matFinAtual: number;
  matFinMeta: number;
  matFinPercent: number;
  finDocAtual: number;
  finDocMeta: number;
  finDocPercent: number;
  matAcadAtual: number;
  matAcadMeta: number;
  matAcadPercent: number;
  pe: number;
  confirmado: boolean;
}

interface CampusData {
  codCampus: string;
  nomeCampus: string;
  totalTurmas: number;
  turmasComDados: number;
  inscritosAtual: number;
  inscritosMeta: number;
  inscritosPercent: number;
  matFinAtual: number;
  matFinMeta: number;
  matFinPercent: number;
  finDocAtual: number;
  finDocMeta: number;
  finDocPercent: number;
  matAcadAtual: number;
  matAcadMeta: number;
  matAcadPercent: number;
  turmasConfirmadas: number;
  turmasNaoConfirmadas: number;
}

interface FilterOption {
  value: string;
  label: string;
}

interface Filters {
  campus: FilterOption[];
  cursos: FilterOption[];
  turnos: FilterOption[];
}

interface ApiResponse {
  success: boolean;
  data: {
    totais: Totals;
    turmas: TurmaData[];
    campusData: CampusData[];
    filtros: Filters;
    lastSync?: string;
  };
  message?: string;
}

const isProduction = process.env.NODE_ENV === 'production';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse["data"] | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [selectedCampus, setSelectedCampus] = useState("all");
  const [selectedCurso, setSelectedCurso] = useState("all");
  const [selectedTurno, setSelectedTurno] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiEndpoint = isProduction ? '/api/static' : '/api/dados';
      
      const params = new URLSearchParams();
      if (!isProduction) {
        if (selectedCampus !== "all") params.append("campus", selectedCampus);
        if (selectedCurso !== "all") params.append("curso", selectedCurso);
        if (selectedTurno !== "all") params.append("turno", selectedTurno);
      }

      const response = await fetch(`${apiEndpoint}?${params.toString()}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setData(result.data);
        if (result.data.lastSync) {
          setLastSync(result.data.lastSync);
        }
      } else {
        setError(result.message || "Erro ao carregar dados");
      }
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCampus, selectedCurso, selectedTurno]);

  const fetchLastSync = useCallback(async () => {
    if (isProduction) return;
    
    try {
      const response = await fetch("/api/sync");
      const result = await response.json();
      if (result.success) {
        setLastSync(result.lastSync);
      }
    } catch (err) {
      console.error("Error fetching last sync:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchLastSync();
  }, [fetchData, fetchLastSync]);

  const handleSyncComplete = useCallback(() => {
    fetchData();
    fetchLastSync();
  }, [fetchData, fetchLastSync]);

  const filteredData = useMemo(() => {
    if (!data) return null;
    
    if (!isProduction) return data;
    
    if (selectedCampus === "all" && selectedCurso === "all" && selectedTurno === "all") {
      return data;
    }
    
    let filteredTurmas = data.turmas;
    let filteredCampus = data.campusData;

    if (selectedCampus !== "all") {
      filteredTurmas = filteredTurmas.filter(t => t.codCampus === selectedCampus);
      filteredCampus = filteredCampus.filter(c => c.codCampus === selectedCampus);
    }
    if (selectedCurso !== "all") {
      filteredTurmas = filteredTurmas.filter(t => t.codCurso === selectedCurso);
    }
    if (selectedTurno !== "all") {
      filteredTurmas = filteredTurmas.filter(t => t.codTurno === selectedTurno);
    }

    const totais = {
      inscritosAtual: 0, inscritosMeta: 0, inscritosPercent: 0,
      matFinAtual: 0, matFinMeta: 0, matFinPercent: 0,
      finDocAtual: 0, finDocMeta: 0, finDocPercent: 0,
      matAcadAtual: 0, matAcadMeta: 0, matAcadPercent: 0,
      totalTurmas: filteredTurmas.length,
      turmasComDados: filteredTurmas.filter(t => t.temDados).length,
      turmasConfirmadas: 0,
      turmasNaoConfirmadas: 0,
    };

    filteredTurmas.forEach(t => {
      totais.inscritosAtual += t.inscritosAtual;
      totais.inscritosMeta += t.inscritosMeta;
      totais.matFinAtual += t.matFinAtual;
      totais.matFinMeta += t.matFinMeta;
      totais.finDocAtual += t.finDocAtual;
      totais.finDocMeta += t.finDocMeta;
      totais.matAcadAtual += t.matAcadAtual;
      totais.matAcadMeta += t.matAcadMeta;
      if (t.pe > 0) {
        if (t.confirmado) totais.turmasConfirmadas++;
        else totais.turmasNaoConfirmadas++;
      }
    });

    totais.inscritosMeta = Math.round(totais.inscritosMeta);
    totais.matFinMeta = Math.round(totais.matFinMeta);
    totais.finDocMeta = Math.round(totais.finDocMeta);
    totais.matAcadMeta = Math.round(totais.matAcadMeta);

    totais.inscritosPercent = totais.inscritosMeta > 0 ? Math.round((totais.inscritosAtual / totais.inscritosMeta) * 100) : 0;
    totais.matFinPercent = totais.matFinMeta > 0 ? Math.round((totais.matFinAtual / totais.matFinMeta) * 100) : 0;
    totais.finDocPercent = totais.finDocMeta > 0 ? Math.round((totais.finDocAtual / totais.finDocMeta) * 100) : 0;
    totais.matAcadPercent = totais.matAcadMeta > 0 ? Math.round((totais.matAcadAtual / totais.matAcadMeta) * 100) : 0;

    return { ...data, turmas: filteredTurmas, campusData: filteredCampus, totais };
  }, [data, selectedCampus, selectedCurso, selectedTurno]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
            <GraduationCap className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">Carregando dados...</p>
            <p className="text-sm text-gray-500">Aguarde enquanto preparamos seu dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {!isProduction && (
          <div className="mt-4">
            <UploadForm lastSync={lastSync} onSyncComplete={handleSyncComplete} />
          </div>
        )}
      </div>
    );
  }

  if (!data || !filteredData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sem dados</AlertTitle>
          <AlertDescription>
            Nenhum dado encontrado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayData = filteredData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-4">
              <img 
                src="https://logodownload.org/wp-content/uploads/2014/12/estacio-logo-faculdade-5.jpg" 
                alt="Estácio" 
                className="h-10 md:h-12 w-auto object-contain"
              />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg md:text-xl font-bold text-gray-800">
                  Dashboard Turmas
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Período 2026.1</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">
                © Daniel Villa
              </div>
              {lastSync && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <RefreshCw className="h-3 w-3" />
                  <span>Atualizado: {new Date(lastSync).toLocaleString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          filtros={data.filtros}
          selectedCampus={selectedCampus}
          selectedCurso={selectedCurso}
          selectedTurno={selectedTurno}
          onCampusChange={setSelectedCampus}
          onCursoChange={setSelectedCurso}
          onTurnoChange={setSelectedTurno}
        />

        {/* Tabs */}
        <Tabs defaultValue="visao-geral" className="space-y-4">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border inline-flex">
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger
                value="visao-geral"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md px-6 rounded-xl transition-all"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="visao-meta"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md px-6 rounded-xl transition-all"
              >
                Atingimento de Meta
              </TabsTrigger>
              <TabsTrigger
                value="turmas-proximas"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md px-6 rounded-xl transition-all"
              >
                Próximas de Confirmar
              </TabsTrigger>
              <TabsTrigger
                value="gap-enturmacao"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md px-6 rounded-xl transition-all"
              >
                Gap de Enturmação
              </TabsTrigger>
              {!isProduction && (
                <TabsTrigger
                  value="upload"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md px-6 rounded-xl transition-all"
                >
                  Upload
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="visao-geral" className="mt-0">
            <VisaoGeral totais={displayData.totais} turmas={displayData.turmas} />
          </TabsContent>

          <TabsContent value="visao-meta" className="mt-0">
            <VisaoMeta totais={displayData.totais} campusData={displayData.campusData} turmas={displayData.turmas} />
          </TabsContent>

          <TabsContent value="turmas-proximas" className="mt-0">
            <TurmasProximas turmas={displayData.turmas} />
          </TabsContent>

          <TabsContent value="gap-enturmacao" className="mt-0">
            <GapEnturmacao turmas={displayData.turmas} />
          </TabsContent>

          {!isProduction && (
            <TabsContent value="upload" className="mt-0">
              <UploadForm lastSync={lastSync} onSyncComplete={handleSyncComplete} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8 py-4">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-sm text-gray-500">
            Dashboard de Desempenho das Turmas Estácio • Período 2026.1
          </p>
        </div>
      </footer>
    </div>
  );
}
