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
import { AlertCircle, Search, Users, TrendingDown, CheckCircle } from "lucide-react";

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

interface GapEnturmacaoProps {
  turmas: TurmaData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

export default function GapEnturmacao({ turmas }: GapEnturmacaoProps) {
  const [search, setSearch] = useState("");

  // Get turmas com matrículas pendentes (confirmadas com mat_acad < fin_doc)
  const turmasComGap = useMemo(() => {
    return turmas
      .filter((turma) => {
        if (!turma.temDados || !turma.confirmado) return false;
        return turma.matAcadAtual < turma.finDocAtual;
      })
      .map((turma) => ({
        ...turma,
        gap: turma.finDocAtual - turma.matAcadAtual,
      }))
      .sort((a, b) => b.gap - a.gap);
  }, [turmas]);

  // Filter by search
  const filteredTurmas = useMemo(() => {
    const searchLower = search.toLowerCase();
    return turmasComGap.filter((turma) =>
      turma.nomeCampus.toLowerCase().includes(searchLower) ||
      turma.nomeCurso.toLowerCase().includes(searchLower) ||
      turma.turno.toLowerCase().includes(searchLower)
    );
  }, [turmasComGap, search]);

  // Calculate totals
  const totais = useMemo(() => {
    const totalFinDoc = turmasComGap.reduce((acc, t) => acc + t.finDocAtual, 0);
    const totalMatAcad = turmasComGap.reduce((acc, t) => acc + t.matAcadAtual, 0);
    const totalGap = turmasComGap.reduce((acc, t) => acc + t.gap, 0);
    return { totalFinDoc, totalMatAcad, totalGap };
  }, [turmasComGap]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Matrículas Pendentes</h2>
          <p className="text-sm text-gray-500">Turmas com <strong>MAT ACAD</strong> menor que <strong>FIN DOC</strong></p>
          <p className="text-xs text-gray-400 mt-1">⚠️ Considera cursos no status de <strong>Confirmado</strong> e <strong>A Confirmar</strong></p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Turmas com Gap</p>
                <p className="text-2xl font-bold text-white">{turmasComGap.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Gap</p>
                <p className="text-2xl font-bold text-white">{formatNumber(totais.totalGap)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela completa */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Lista Completa</h3>
                <p className="text-xs text-gray-500">
                  {turmasComGap.length} turmas com matrículas pendentes • ordenado por maior gap
                </p>
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

          {filteredTurmas.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma turma com matrículas pendentes</p>
              <p className="text-sm text-gray-400 mt-1">
                Todas as turmas têm MAT ACAD ≥ FIN DOC
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Campus</TableHead>
                      <TableHead className="font-semibold">Curso</TableHead>
                      <TableHead className="font-semibold">Turno</TableHead>
                      <TableHead className="text-center font-semibold">FIN DOC</TableHead>
                      <TableHead className="text-center font-semibold">MAT ACAD</TableHead>
                      <TableHead className="text-center font-semibold">Gap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTurmas.map((turma) => (
                      <TableRow key={turma.id} className="hover:bg-purple-50">
                        <TableCell className="font-medium text-gray-800">{turma.nomeCampus}</TableCell>
                        <TableCell>{turma.nomeCurso}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{turma.turno}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-blue-600">{formatNumber(turma.finDocAtual)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-emerald-600">{formatNumber(turma.matAcadAtual)}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-red-500 text-white">
                            {turma.gap}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-500">
            Mostrando {filteredTurmas.length} de {turmasComGap.length} turmas
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
