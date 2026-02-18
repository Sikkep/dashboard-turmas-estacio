"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, TrendingUp, TrendingDown, Building2 } from "lucide-react";

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

interface CampusTableProps {
  campusData: CampusData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return "bg-emerald-500";
  if (percent >= 70) return "bg-yellow-500";
  if (percent >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function getTextColor(percent: number): string {
  if (percent >= 90) return "text-emerald-600";
  if (percent >= 70) return "text-yellow-600";
  if (percent >= 50) return "text-orange-600";
  return "text-red-600";
}

function PercentBadge({ percent }: { percent: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-sm font-bold ${getTextColor(percent)}`}>{percent}%</span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${getProgressColor(percent)}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function CampusTable({ campusData }: CampusTableProps) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const searchLower = search.toLowerCase();
    return campusData
      .filter((campus) => campus.nomeCampus.toLowerCase().includes(searchLower))
      .sort((a, b) => a.nomeCampus.localeCompare(b.nomeCampus));
  }, [campusData, search]);

  const totais = useMemo(() => {
    return filteredData.reduce((acc, campus) => ({
      totalTurmas: acc.totalTurmas + campus.totalTurmas,
      turmasComDados: acc.turmasComDados + campus.turmasComDados,
      turmasConfirmadas: acc.turmasConfirmadas + campus.turmasConfirmadas,
      turmasNaoConfirmadas: acc.turmasNaoConfirmadas + campus.turmasNaoConfirmadas,
      inscritosAtual: acc.inscritosAtual + campus.inscritosAtual,
      inscritosMeta: acc.inscritosMeta + campus.inscritosMeta,
      matFinAtual: acc.matFinAtual + campus.matFinAtual,
      matFinMeta: acc.matFinMeta + campus.matFinMeta,
      finDocAtual: acc.finDocAtual + campus.finDocAtual,
      finDocMeta: acc.finDocMeta + campus.finDocMeta,
      matAcadAtual: acc.matAcadAtual + campus.matAcadAtual,
      matAcadMeta: acc.matAcadMeta + campus.matAcadMeta,
    }), {
      totalTurmas: 0,
      turmasComDados: 0,
      turmasConfirmadas: 0,
      turmasNaoConfirmadas: 0,
      inscritosAtual: 0,
      inscritosMeta: 0,
      matFinAtual: 0,
      matFinMeta: 0,
      finDocAtual: 0,
      finDocMeta: 0,
      matAcadAtual: 0,
      matAcadMeta: 0,
    });
  }, [filteredData]);

  const totaisPercent = {
    inscritos: totais.inscritosMeta > 0 ? Math.round((totais.inscritosAtual / totais.inscritosMeta) * 100) : 0,
    matFin: totais.matFinMeta > 0 ? Math.round((totais.matFinAtual / totais.matFinMeta) * 100) : 0,
    finDoc: totais.finDocMeta > 0 ? Math.round((totais.finDocAtual / totais.finDocMeta) * 100) : 0,
    matAcad: totais.matAcadMeta > 0 ? Math.round((totais.matAcadAtual / totais.matAcadMeta) * 100) : 0,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Dados por Campus</h2>
            <p className="text-sm text-gray-500">Visualização detalhada de cada campus</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar campus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white border-gray-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-gradient-to-r from-slate-50 to-gray-50 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Campus</TableHead>
                <TableHead className="text-center font-semibold text-gray-700">Turmas</TableHead>
                <TableHead className="text-center font-semibold text-gray-700">Confirmação</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 min-w-[140px]">Inscritos</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 min-w-[140px]">Mat. Fin.</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 min-w-[140px]">Fin. Doc.</TableHead>
                <TableHead className="text-center font-semibold text-gray-700 min-w-[140px]">Mat. Acad.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-b-2 border-blue-200">
                <TableCell className="font-bold text-gray-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    TOTAL GERAL
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-bold text-gray-800">{totais.totalTurmas}</span>
                  <p className="text-xs text-gray-500">{totais.turmasComDados} com dados</p>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="font-bold text-emerald-600">{totais.turmasConfirmadas}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-bold text-red-600">{totais.turmasNaoConfirmadas}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">{formatNumber(totais.inscritosAtual)} / {formatNumber(totais.inscritosMeta)}</span>
                    <PercentBadge percent={totaisPercent.inscritos} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">{formatNumber(totais.matFinAtual)} / {formatNumber(totais.matFinMeta)}</span>
                    <PercentBadge percent={totaisPercent.matFin} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">{formatNumber(totais.finDocAtual)} / {formatNumber(totais.finDocMeta)}</span>
                    <PercentBadge percent={totaisPercent.finDoc} />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">{formatNumber(totais.matAcadAtual)} / {formatNumber(totais.matAcadMeta)}</span>
                    <PercentBadge percent={totaisPercent.matAcad} />
                  </div>
                </TableCell>
              </TableRow>

              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-10 w-10 text-gray-300" />
                      <p className="text-gray-500">Nenhum campus encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((campus) => (
                  <TableRow key={campus.codCampus} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-gray-800">{campus.nomeCampus}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{campus.codCampus}</span>
                          <span>•</span>
                          <span>{campus.turmasComDados}/{campus.totalTurmas} com dados</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 font-bold text-gray-700">
                        {campus.totalTurmas}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-emerald-600">{campus.turmasConfirmadas}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-600">{campus.turmasNaoConfirmadas}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{formatNumber(campus.inscritosAtual)} / {formatNumber(campus.inscritosMeta)}</span>
                        <PercentBadge percent={campus.inscritosPercent} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{formatNumber(campus.matFinAtual)} / {formatNumber(campus.matFinMeta)}</span>
                        <PercentBadge percent={campus.matFinPercent} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{formatNumber(campus.finDocAtual)} / {formatNumber(campus.finDocMeta)}</span>
                        <PercentBadge percent={campus.finDocPercent} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{formatNumber(campus.matAcadAtual)} / {formatNumber(campus.matAcadMeta)}</span>
                        <PercentBadge percent={campus.matAcadPercent} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
        <span>Mostrando {filteredData.length} campus</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            {totais.turmasConfirmadas} confirmadas
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-red-500" />
            {totais.turmasNaoConfirmadas} não confirmadas
          </span>
        </span>
      </div>
    </div>
  );
}
