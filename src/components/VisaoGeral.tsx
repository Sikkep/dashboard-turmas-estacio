"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, FileText, BookOpen, CheckCircle, XCircle, Building2, AlertTriangle } from "lucide-react";

interface TotaisData {
  inscritosAtual: number;
  matFinAtual: number;
  finDocAtual: number;
  matAcadAtual: number;
  totalTurmas: number;
  turmasComDados: number;
  turmasConfirmadas: number;
  turmasNaoConfirmadas: number;
}

interface TurmaData {
  id: string;
  nomeCampus: string;
  nomeCurso: string;
  turno: string;
  finDocAtual: number;
  pe: number;
  confirmado: boolean;
}

interface VisaoGeralProps {
  totais: TotaisData;
  turmas: TurmaData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

function KPICard({ title, value, icon, gradient, iconBg }: KPICardProps) {
  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white">{formatNumber(value)}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full bg-white/40 w-full" />
      </div>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  showPercent?: boolean;
}

function StatCard({ label, value, total, color, bgColor, icon, showPercent = false }: StatCardProps) {
  const percent = total && total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className={`${bgColor} rounded-2xl p-5 border shadow-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${color}`}>{formatNumber(value)}</span>
        {total !== undefined && (
          <span className="text-sm text-gray-500 mb-1">de {formatNumber(total)}</span>
        )}
      </div>
      {showPercent && total !== undefined && total > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${color.replace('text-', 'bg-').replace('-600', '-500')}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{percent}% do total</p>
        </div>
      )}
    </div>
  );
}

export default function VisaoGeral({ totais, turmas }: VisaoGeralProps) {
  const totalTurmasComPE = totais.turmasConfirmadas + totais.turmasNaoConfirmadas;
  const percentConfirmadas = totalTurmasComPE > 0 
    ? Math.round((totais.turmasConfirmadas / totalTurmasComPE) * 100) 
    : 0;
  const turmasSemDados = totais.totalTurmas - totais.turmasComDados;

  // Get confirmed turmas
  const turmasConfirmadasList = turmas.filter(t => t.confirmado).slice(0, 6);
  const turmasNaoConfirmadasList = turmas.filter(t => t.pe > 0 && !t.confirmado).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-sm text-gray-500">Realizado e confirmação de turmas</p>
        </div>
      </div>

      {/* KPI Cards - Coloridos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="INSCRITOS"
          value={totais.inscritosAtual}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconBg="bg-blue-400/30"
          icon={<Users className="h-6 w-6 text-white" />}
        />
        <KPICard
          title="MATRÍCULAS FINALIZADAS"
          value={totais.matFinAtual}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-400/30"
          icon={<GraduationCap className="h-6 w-6 text-white" />}
        />
        <KPICard
          title="FINANCEIRO DOCUMENTADO"
          value={totais.finDocAtual}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          iconBg="bg-orange-400/30"
          icon={<FileText className="h-6 w-6 text-white" />}
        />
        <KPICard
          title="MATRÍCULAS ACADÊMICAS"
          value={totais.matAcadAtual}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          iconBg="bg-purple-400/30"
          icon={<BookOpen className="h-6 w-6 text-white" />}
        />
      </div>

      {/* Seção de Turmas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <Building2 className="h-8 w-8 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total de Turmas</p>
                <p className="text-3xl font-bold text-gray-800">{totais.totalTurmas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatCard
          label="Com Dados"
          value={totais.turmasComDados}
          total={totais.totalTurmas}
          color="text-emerald-600"
          bgColor="bg-emerald-50 border-emerald-200"
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
          showPercent
        />

        <StatCard
          label="Sem Dados"
          value={turmasSemDados}
          total={totais.totalTurmas}
          color="text-red-600"
          bgColor="bg-red-50 border-red-200"
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          showPercent
        />
      </div>

      {/* Confirmação de Turmas - Donut Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico Donut */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Confirmação de Turmas</h3>
                <p className="text-sm text-gray-500">Baseado no PE (Ponto de Equilíbrio)</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="18"
                  />
                  {/* Não confirmadas (laranja/vermelho) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="18"
                    strokeDasharray={`${(100 - percentConfirmadas) * 2.51} 251`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Confirmadas (verde) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="18"
                    strokeDasharray={`${percentConfirmadas * 2.51} 251`}
                    strokeDashoffset={`-${(100 - percentConfirmadas) * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-800">{percentConfirmadas}%</span>
                  <span className="text-sm text-gray-500">Confirmadas</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm text-gray-600">Confirmadas</p>
                  <p className="text-xl font-bold text-emerald-600">{totais.turmasConfirmadas}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Não Confirmadas</p>
                  <p className="text-xl font-bold text-orange-600">{totais.turmasNaoConfirmadas}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Turmas Confirmadas */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Turmas Confirmadas</h3>
                <p className="text-xs text-gray-500">fin_doc ≥ PE do curso</p>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {turmasConfirmadasList.length > 0 ? (
                turmasConfirmadasList.map((turma) => (
                  <div key={turma.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{turma.nomeCurso}</p>
                      <p className="text-xs text-gray-500">{turma.nomeCampus} - {turma.turno}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{turma.finDocAtual}</p>
                      <p className="text-xs text-gray-500">PE: {turma.pe}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Nenhuma turma confirmada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Turmas Não Confirmadas */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Turmas Não Confirmadas</h3>
              <p className="text-xs text-gray-500">fin_doc &lt; PE do curso</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              {totais.turmasNaoConfirmadas} turmas
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {turmasNaoConfirmadasList.length > 0 ? (
              turmasNaoConfirmadasList.map((turma) => (
                <div key={turma.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{turma.nomeCurso}</p>
                    <p className="text-xs text-gray-500">{turma.nomeCampus} - {turma.turno}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{turma.finDocAtual}/{turma.pe}</p>
                    <p className="text-xs text-gray-500">faltam {turma.pe - turma.finDocAtual}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8 col-span-full">
                Todas as turmas com PE estão confirmadas
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
