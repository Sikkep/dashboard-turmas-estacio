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
import { Search, ArrowUpDown } from "lucide-react";
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

type SortField = "nomeCampus" | "nomeCurso" | "turno" | "inscritosPercent" | "matFinPercent" | "finDocPercent" | "matAcadPercent";
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
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTurmas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
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
                            {formatNumber(turma.inscritosAtual)} /{" "}
                            {formatNumber(turma.inscritosMeta)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {turma.inscritosPercent}%
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
                            {formatNumber(turma.matFinAtual)} /{" "}
                            {formatNumber(turma.matFinMeta)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {turma.matFinPercent}%
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
                            {formatNumber(turma.finDocAtual)} /{" "}
                            {formatNumber(turma.finDocMeta)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {turma.finDocPercent}%
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
                            {formatNumber(turma.matAcadAtual)} /{" "}
                            {formatNumber(turma.matAcadMeta)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {turma.matAcadPercent}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {turma.temDados ? (
                        getStatusBadge(turma.matFinPercent)
                      ) : (
                        <Badge variant="secondary">Sem dados</Badge>
                      )}
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
