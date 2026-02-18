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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface TurmasTableProps {
  turmas: TurmaData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

function getStatusBadge(percent: number) {
  if (percent >= 90) {
    return <Badge className="bg-green-500 hover:bg-green-600">Bom</Badge>;
  }
  if (percent >= 70) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">Médio</Badge>;
  }
  return <Badge className="bg-red-500 hover:bg-red-600">Ruim</Badge>;
}

function getConfirmacaoBadge(confirmado: boolean, pe: number) {
  if (pe === 0) {
    return <Badge variant="secondary">Sem PE</Badge>;
  }
  if (confirmado) {
    return (
      <Badge className="bg-green-500 hover:bg-green-600">
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

type SortField = "nomeCampus" | "nomeCurso" | "turno" | "inscritosPercent" | "matFinPercent" | "finDocPercent" | "matAcadPercent" | "pe" | "confirmado";
type SortDirection = "asc" | "desc";

function SortButton({ 
  field, 
  label, 
  currentField, 
  direction, 
  onSort 
}: { 
  field: SortField; 
  label: string;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2"
      onClick={() => onSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );
}

export default function TurmasTable({ turmas }: TurmasTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("nomeCampus");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredTurmas = useMemo(() => {
    const filtered = turmas.filter((turma) => {
      const searchLower = search.toLowerCase();
      return (
        turma.nomeCampus.toLowerCase().includes(searchLower) ||
        turma.nomeCurso.toLowerCase().includes(searchLower) ||
        turma.turno.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "nomeCampus" || sortField === "nomeCurso" || sortField === "turno") {
        comparison = a[sortField].localeCompare(b[sortField]);
      } else if (sortField === "confirmado") {
        comparison = (a.confirmado ? 1 : 0) - (b.confirmado ? 1 : 0);
      } else {
        comparison = a[sortField] - b[sortField];
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [turmas, search, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por campus, curso ou turno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>
                  <SortButton field="nomeCampus" label="Campus" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortButton field="nomeCurso" label="Curso" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                </TableHead>
                <TableHead>
                  <SortButton field="turno" label="Turno" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-center">Inscritos</TableHead>
                <TableHead className="text-center">Mat. Fin.</TableHead>
                <TableHead className="text-center">Fin. Doc.</TableHead>
                <TableHead className="text-center">Mat. Acad.</TableHead>
                <TableHead className="text-center">PE</TableHead>
                <TableHead className="text-center">
                  <SortButton field="confirmado" label="Status" currentField={sortField} direction={sortDirection} onSort={handleSort} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTurmas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Nenhuma turma encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredTurmas.map((turma) => (
                  <TableRow key={turma.id}>
                    <TableCell className="font-medium">
                      {turma.nomeCampus}
                    </TableCell>
                    <TableCell>{turma.nomeCurso}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{turma.turno}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {turma.temDados ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatNumber(turma.inscritosAtual)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {turma.temDados ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatNumber(turma.matFinAtual)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {turma.temDados ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatNumber(turma.finDocAtual)}
                            {turma.pe > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                /{turma.pe}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {turma.temDados ? (
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatNumber(turma.matAcadAtual)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {turma.pe > 0 ? (
                        <span className="font-medium">{turma.pe}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getConfirmacaoBadge(turma.confirmado, turma.pe)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredTurmas.length} de {turmas.length} turmas
      </div>
    </div>
  );
}
