"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filtros: {
    campus: FilterOption[];
    cursos: FilterOption[];
    turnos: FilterOption[];
  };
  selectedCampus: string;
  selectedCurso: string;
  selectedTurno: string;
  onCampusChange: (value: string) => void;
  onCursoChange: (value: string) => void;
  onTurnoChange: (value: string) => void;
}

export default function FilterBar({
  filtros,
  selectedCampus,
  selectedCurso,
  selectedTurno,
  onCampusChange,
  onCursoChange,
  onTurnoChange,
}: FilterBarProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Campus
            </label>
            <Select value={selectedCampus} onValueChange={onCampusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os campus</SelectItem>
                {filtros.campus.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Curso
            </label>
            <Select value={selectedCurso} onValueChange={onCursoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {filtros.cursos.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Turno
            </label>
            <Select value={selectedTurno} onValueChange={onTurnoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os turnos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os turnos</SelectItem>
                {filtros.turnos.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
