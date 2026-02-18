"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, GraduationCap, FileText, BookOpen, CheckCircle, XCircle, Search } from "lucide-react";

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
  temDados: boolean;
  finDocAtual: number;
  pe: number;
  confirmado: boolean;
  inscritosAtual: number;
  matFinAtual: number;
  matAcadAtual: number;
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

function getConfirmacaoBadge(confirmado: boolean, pe: number) {
  if (pe === 0) {
    return <Badge variant="secondary">Sem PE</Badge>;
  }
  if (confirmado) {
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Confirmada
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500 hover:bg-red-600">
      <XCircle className="h-3 w-3 mr-1" />
      Não Confirmada
    </Badge>
  );
}

export default function VisaoGeral({ totais, turmas }: VisaoGeralProps) {
  const [search, setSearch] = useState("");
  
  const totalTurmasComPE = totais.turmasConfirmadas + totais.turmasNaoConfirmadas;
  const percentConfirmadas = totalTurmasComPE > 0 
    ? Math.round((totais.turmasConfirmadas / totalTurmasComPE) * 100) 
    : 0;

  // Filter turmas by search and sort by fin_doc descending
  const filteredTurmas = useMemo(() => {
    const searchLower = search.toLowerCase();
    return turmas
      .filter((turma) =>
        turma.nomeCampus.toLowerCase().includes(searchLower) ||
        turma.nomeCurso.toLowerCase().includes(searchLower) ||
        turma.turno.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => b.finDocAtual - a.finDocAtual);
  }, [turmas, search]);

  // Get confirmed turmas for summary
  const turmasConfirmadasList = turmas.filter(t => t.confirmado).slice(0, 6);

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
          title="MAT FIN"
          value={totais.matFinAtual}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-400/30"
          icon={<GraduationCap className="h-6 w-6 text-white" />}
        />
        <KPICard
          title="FIN DOC"
          value={totais.finDocAtual}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          iconBg="bg-orange-400/30"
          icon={<FileText className="h-6 w-6 text-white" />}
        />
        <KPICard
          title="MAT ACAD"
          value={totais.matAcadAtual}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          iconBg="bg-purple-400/30"
          icon={<BookOpen className="h-6 w-6 text-white" />}
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
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="18" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="18"
                    strokeDasharray={`${(100 - percentConfirmadas) * 2.51} 251`}
                    strokeDashoffset="0" strokeLinecap="round"
                  />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="18"
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
                <p className="text-sm text-gray-500 text-center py-8">Nenhuma turma confirmada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Turmas */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Todas as Turmas</h3>
                <p className="text-xs text-gray-500">{turmas.length} turmas cadastradas • ordenado por FIN DOC</p>
              </div>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar campus, curso ou turno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="rounded-lg border overflow-hidden">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Campus</TableHead>
                    <TableHead className="font-semibold">Curso</TableHead>
                    <TableHead className="font-semibold">Turno</TableHead>
                    <TableHead className="text-center font-semibold">Inscritos</TableHead>
                    <TableHead className="text-center font-semibold">Mat Fin</TableHead>
                    <TableHead className="text-center font-semibold">Fin Doc</TableHead>
                    <TableHead className="text-center font-semibold">Mat Acad</TableHead>
                    <TableHead className="text-center font-semibold">PE</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTurmas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Nenhuma turma encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTurmas.map((turma) => (
                      <TableRow key={turma.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-800">{turma.nomeCampus}</TableCell>
                        <TableCell>{turma.nomeCurso}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{turma.turno}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{turma.temDados ? formatNumber(turma.inscritosAtual) : '-'}</TableCell>
                        <TableCell className="text-center">{turma.temDados ? formatNumber(turma.matFinAtual) : '-'}</TableCell>
                        <TableCell className="text-center">
                          {turma.temDados ? (
                            <span>
                              {formatNumber(turma.finDocAtual)}
                              {turma.pe > 0 && <span className="text-gray-400">/{turma.pe}</span>}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-center">{turma.temDados ? formatNumber(turma.matAcadAtual) : '-'}</TableCell>
                        <TableCell className="text-center">{turma.pe > 0 ? turma.pe : '-'}</TableCell>
                        <TableCell className="text-center">{getConfirmacaoBadge(turma.confirmado, turma.pe)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            Mostrando {filteredTurmas.length} de {turmas.length} turmas
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
