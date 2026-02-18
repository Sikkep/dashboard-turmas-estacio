"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const hasActiveFilters = selectedCampus !== "all" || selectedCurso !== "all" || selectedTurno !== "all";

  const clearFilters = () => {
    onCampusChange("all");
    onCursoChange("all");
    onTurnoChange("all");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Filter className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Filtros</h3>
          <p className="text-xs text-gray-500">Selecione os critérios para filtrar os dados</p>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Campus
          </label>
          <Select value={selectedCampus} onValueChange={onCampusChange}>
            <SelectTrigger className="bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
              <SelectValue placeholder="Todos os campus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="text-gray-600">Todos os campus</span>
              </SelectItem>
              {filtros.campus.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Curso
          </label>
          <Select value={selectedCurso} onValueChange={onCursoChange}>
            <SelectTrigger className="bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
              <SelectValue placeholder="Todos os cursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="text-gray-600">Todos os cursos</span>
              </SelectItem>
              {filtros.cursos.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Turno
          </label>
          <Select value={selectedTurno} onValueChange={onTurnoChange}>
            <SelectTrigger className="bg-gray-50 border-gray-200 hover:border-blue-300 transition-colors">
              <SelectValue placeholder="Todos os turnos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="text-gray-600">Todos os turnos</span>
              </SelectItem>
              {filtros.turnos.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtros ativos:</span>
          {selectedCampus !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Campus: {filtros.campus.find(f => f.value === selectedCampus)?.label || selectedCampus}
              <button onClick={() => onCampusChange("all")} className="hover:bg-blue-200 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCurso !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              Curso: {filtros.cursos.find(f => f.value === selectedCurso)?.label || selectedCurso}
              <button onClick={() => onCursoChange("all")} className="hover:bg-emerald-200 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedTurno !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Turno: {filtros.turnos.find(f => f.value === selectedTurno)?.label || selectedTurno}
              <button onClick={() => onTurnoChange("all")} className="hover:bg-purple-200 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
