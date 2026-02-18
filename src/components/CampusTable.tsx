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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

interface CampusTableProps {
  campusData: CampusData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

function getStatusColor(percent: number): string {
  if (percent >= 90) return "text-green-600";
  if (percent >= 70) return "text-yellow-600";
  return "text-red-600";
}

export default function CampusTable({ campusData }: CampusTableProps) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const searchLower = search.toLowerCase();
    return campusData
      .filter((campus) => campus.nomeCampus.toLowerCase().includes(searchLower))
      .sort((a, b) => a.nomeCampus.localeCompare(b.nomeCampus));
  }, [campusData, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar campus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Campus</TableHead>
                <TableHead className="text-center">Turmas</TableHead>
                <TableHead className="text-center">Inscritos</TableHead>
                <TableHead className="text-center">Mat. Fin.</TableHead>
                <TableHead className="text-center">Fin. Doc.</TableHead>
                <TableHead className="text-center">Mat. Acad.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum campus encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((campus) => (
                  <TableRow key={campus.codCampus}>
                    <TableCell className="font-medium">
                      <div>
                        {campus.nomeCampus}
                        <div className="text-xs text-muted-foreground">
                          {campus.turmasComDados}/{campus.totalTurmas} turmas com dados
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{campus.totalTurmas}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatNumber(campus.inscritosAtual)} / {formatNumber(campus.inscritosMeta)}
                        </div>
                        <div className={`text-xs font-medium ${getStatusColor(campus.inscritosPercent)}`}>
                          {campus.inscritosPercent}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatNumber(campus.matFinAtual)} / {formatNumber(campus.matFinMeta)}
                        </div>
                        <div className={`text-xs font-medium ${getStatusColor(campus.matFinPercent)}`}>
                          {campus.matFinPercent}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatNumber(campus.finDocAtual)} / {formatNumber(campus.finDocMeta)}
                        </div>
                        <div className={`text-xs font-medium ${getStatusColor(campus.finDocPercent)}`}>
                          {campus.finDocPercent}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatNumber(campus.matAcadAtual)} / {formatNumber(campus.matAcadMeta)}
                        </div>
                        <div className={`text-xs font-medium ${getStatusColor(campus.matAcadPercent)}`}>
                          {campus.matAcadPercent}%
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredData.length} campi
      </div>
    </div>
  );
}
