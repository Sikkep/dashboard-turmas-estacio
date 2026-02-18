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
import { AlertCircle, Search, TrendingUp, Users } from "lucide-react";

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

interface TurmasProximasProps {
  turmas: TurmaData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

export default function TurmasProximas({ turmas }: TurmasProximasProps) {
  const [search, setSearch] = useState("");

  // Get turmas proximas de confirmar (fin_doc até 3 menor que PE)
  const turmasProximasConfirmar = useMemo(() => {
    return turmas
      .filter((turma) => {
        if (turma.pe <= 0 || turma.confirmado || !turma.temDados) return false;
        const diferenca = turma.pe - turma.finDocAtual;
        return diferenca > 0 && diferenca <= 3;
      })
      .sort((a, b) => {
        // Ordenar por diferença (menor diferença primeiro)
        const difA = a.pe - a.finDocAtual;
        const difB = b.pe - b.finDocAtual;
        return difA - difB;
      });
  }, [turmas]);

  // Filter by search
  const filteredTurmas = useMemo(() => {
    const searchLower = search.toLowerCase();
    return turmasProximasConfirmar.filter((turma) =>
      turma.nomeCampus.toLowerCase().includes(searchLower) ||
      turma.nomeCurso.toLowerCase().includes(searchLower) ||
      turma.turno.toLowerCase().includes(searchLower)
    );
  }, [turmasProximasConfirmar, search]);

  // Agrupar por diferença
  const turmasPorDiferenca = useMemo(() => {
    const grupos: Record<number, TurmaData[]> = {};
    filteredTurmas.forEach((turma) => {
      const diferenca = turma.pe - turma.finDocAtual;
      if (!grupos[diferenca]) grupos[diferenca] = [];
      grupos[diferenca].push(turma);
    });
    return grupos;
  }, [filteredTurmas]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Turmas Próximas de Confirmar</h2>
          <p className="text-sm text-gray-500">Turmas com fin_doc até 3 menor que o PE</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total</p>
                <p className="text-2xl font-bold text-white">{turmasProximasConfirmar.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Falta 1</p>
                <p className="text-2xl font-bold text-white">{turmasPorDiferenca[1]?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Faltam 2</p>
                <p className="text-2xl font-bold text-white">{turmasPorDiferenca[2]?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-500 to-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Faltam 3</p>
                <p className="text-2xl font-bold text-white">{turmasPorDiferenca[3]?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups by Difference */}
      {Object.keys(turmasPorDiferenca).length > 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((diferenca) => {
            const turmasGrupo = turmasPorDiferenca[diferenca];
            if (!turmasGrupo || turmasGrupo.length === 0) return null;

            const colors = {
              1: "from-red-50 to-red-100 border-red-300",
              2: "from-orange-50 to-orange-100 border-orange-300",
              3: "from-yellow-50 to-yellow-100 border-yellow-300",
            };

            const badgeColors = {
              1: "bg-red-500",
              2: "bg-orange-500",
              3: "bg-yellow-500",
            };

            return (
              <Card key={diferenca} className={`border-0 shadow-md bg-gradient-to-br ${colors[diferenca as 1|2|3]}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`${badgeColors[diferenca as 1|2|3]} text-white`}>
                      Falta {diferenca}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {turmasGrupo.length} turma{turmasGrupo.length > 1 ? "s" : ""} necessitando de {diferenca} aluno{diferenca > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {turmasGrupo.map((turma) => (
                      <div
                        key={turma.id}
                        className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{turma.nomeCurso}</p>
                            <p className="text-xs text-gray-500 truncate">{turma.nomeCampus} - {turma.turno}</p>
                          </div>
                          <div className="text-right ml-2">
                            <div className="flex items-center gap-1">
                              <span className="text-lg font-bold text-amber-600">{turma.finDocAtual}</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-lg text-gray-600">{turma.pe}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Inscritos: {turma.inscritosAtual}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tabela completa */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Lista Completa</h3>
                <p className="text-xs text-gray-500">
                  {turmasProximasConfirmar.length} turmas próximas de confirmar
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
              <p className="text-gray-500">Nenhuma turma próxima de confirmar</p>
              <p className="text-sm text-gray-400 mt-1">
                Todas as turmas estão confirmadas ou muito distantes do PE
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
                      <TableHead className="text-center font-semibold">Inscritos</TableHead>
                      <TableHead className="text-center font-semibold">Mat Fin</TableHead>
                      <TableHead className="text-center font-semibold">Fin Doc</TableHead>
                      <TableHead className="text-center font-semibold">PE</TableHead>
                      <TableHead className="text-center font-semibold">Falta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTurmas.map((turma) => {
                      const diferenca = turma.pe - turma.finDocAtual;
                      return (
                        <TableRow key={turma.id} className="hover:bg-amber-50">
                          <TableCell className="font-medium text-gray-800">{turma.nomeCampus}</TableCell>
                          <TableCell>{turma.nomeCurso}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{turma.turno}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{formatNumber(turma.inscritosAtual)}</TableCell>
                          <TableCell className="text-center">{formatNumber(turma.matFinAtual)}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-amber-600">{formatNumber(turma.finDocAtual)}</span>
                          </TableCell>
                          <TableCell className="text-center">{turma.pe}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={
                              diferenca === 1 ? "bg-red-500" :
                              diferenca === 2 ? "bg-orange-500" : "bg-yellow-500"
                            }>
                              {diferenca}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-500">
            Mostrando {filteredTurmas.length} de {turmasProximasConfirmar.length} turmas
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
