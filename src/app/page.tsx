"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import DashboardCards from "@/components/DashboardCards";
import PerformanceChart from "@/components/PerformanceChart";
import TurmasTable from "@/components/TurmasTable";
import CampusTable from "@/components/CampusTable";
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

// Check if running in production (Vercel)
const isProduction = process.env.NODE_ENV === 'production';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse["data"] | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Filter states
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [selectedCurso, setSelectedCurso] = useState("all");
  const [selectedTurno, setSelectedTurno] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use static API in production, dynamic in development
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
    if (isProduction) return; // Skip in production
    
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

  // Client-side filtering for production
  const filteredData = useMemo(() => {
    if (!data || !isProduction) return data;
    
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

    // Recalculate totals
    const totais = {
      inscritosAtual: 0, inscritosMeta: 0, inscritosPercent: 0,
      matFinAtual: 0, matFinMeta: 0, matFinPercent: 0,
      finDocAtual: 0, finDocMeta: 0, finDocPercent: 0,
      matAcadAtual: 0, matAcadMeta: 0, matAcadPercent: 0,
      totalTurmas: filteredTurmas.length,
      turmasComDados: filteredTurmas.filter(t => t.temDados).length,
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
    });

    totais.inscritosPercent = totais.inscritosMeta > 0 ? Math.round((totais.inscritosAtual / totais.inscritosMeta) * 100) : 0;
    totais.matFinPercent = totais.matFinMeta > 0 ? Math.round((totais.matFinAtual / totais.matFinMeta) * 100) : 0;
    totais.finDocPercent = totais.finDocMeta > 0 ? Math.round((totais.finDocAtual / totais.finDocMeta) * 100) : 0;
    totais.matAcadPercent = totais.matAcadMeta > 0 ? Math.round((totais.matAcadAtual / totais.matAcadMeta) * 100) : 0;

    return { ...data, turmas: filteredTurmas, campusData: filteredCampus, totais };
  }, [data, selectedCampus, selectedCurso, selectedTurno]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
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
      <div className="container mx-auto p-4 md:p-6">
        <Alert>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Dashboard - Desempenho Turmas Estácio
              </h1>
              <p className="text-muted-foreground">
                Acompanhamento de desempenho das turmas - Período 2026.1
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {displayData.totais.turmasComDados} de {displayData.totais.totalTurmas} turmas com dados
              {lastSync && <span className="ml-2">• Atualizado: {new Date(lastSync).toLocaleString('pt-BR')}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <DashboardCards totais={displayData.totais} />

        {/* Filters */}
        <FilterBar
          filtros={data.filtros}
          selectedCampus={selectedCampus}
          selectedCurso={selectedCurso}
          selectedTurno={selectedTurno}
          onCampusChange={setSelectedCampus}
          onCursoChange={setSelectedCurso}
          onTurnoChange={setSelectedTurno}
        />

        {/* Chart */}
        <PerformanceChart totais={displayData.totais} />

        {/* Tabs for detailed views */}
        <Tabs defaultValue="campus" className="space-y-4">
          <TabsList>
            <TabsTrigger value="campus">Por Campus</TabsTrigger>
            <TabsTrigger value="turmas">Por Turma</TabsTrigger>
            {!isProduction && <TabsTrigger value="upload">Upload</TabsTrigger>}
          </TabsList>

          <TabsContent value="campus">
            <CampusTable campusData={displayData.campusData} />
          </TabsContent>

          <TabsContent value="turmas">
            <TurmasTable turmas={displayData.turmas} />
          </TabsContent>

          {!isProduction && (
            <TabsContent value="upload">
              <UploadForm lastSync={lastSync} onSyncComplete={handleSyncComplete} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
