"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, FileText, BookOpen, CheckCircle, XCircle } from "lucide-react";

interface TotaisData {
  inscritosAtual: number;
  matFinAtual: number;
  finDocAtual: number;
  matAcadAtual: number;
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

export default function VisaoGeral({ totais, turmas }: VisaoGeralProps) {
  const totalTurmasComPE = totais.turmasConfirmadas + totais.turmasNaoConfirmadas;
  const percentConfirmadas = totalTurmasComPE > 0 
    ? Math.round((totais.turmasConfirmadas / totalTurmasComPE) * 100) 
    : 0;

  // Get confirmed turmas
  const turmasConfirmadasList = turmas.filter(t => t.confirmado).slice(0, 10);
  const turmasNaoConfirmadasList = turmas.filter(t => t.pe > 0 && !t.confirmado).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Cards de Realizado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totais.inscritosAtual)}</div>
            <p className="text-xs text-muted-foreground">Total realizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matrículas Finalizadas
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totais.matFinAtual)}</div>
            <p className="text-xs text-muted-foreground">Total realizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financeiro Documentado
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totais.finDocAtual)}</div>
            <p className="text-xs text-muted-foreground">Total realizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matrículas Acadêmicas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totais.matAcadAtual)}</div>
            <p className="text-xs text-muted-foreground">Total realizado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pizza e Status de Confirmação */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status das Turmas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Confirmação baseada no PE (Ponto de Equilíbrio)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  {/* Confirmed portion */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="20"
                    strokeDasharray={`${percentConfirmadas * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{percentConfirmadas}%</span>
                  <span className="text-sm text-muted-foreground">Confirmadas</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Confirmadas</span>
                </div>
                <span className="font-medium">{totais.turmasConfirmadas}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <span className="text-sm">Não Confirmadas</span>
                </div>
                <span className="font-medium">{totais.turmasNaoConfirmadas}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Turmas Confirmadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Turmas Confirmadas ({totais.turmasConfirmadas})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              fin_doc ≥ PE do curso
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {turmasConfirmadasList.length > 0 ? (
                turmasConfirmadasList.map((turma) => (
                  <div key={turma.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{turma.nomeCurso}</p>
                      <p className="text-xs text-muted-foreground">{turma.nomeCampus} - {turma.turno}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{turma.finDocAtual}</p>
                      <p className="text-xs text-muted-foreground">PE: {turma.pe}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma turma confirmada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Turmas Não Confirmadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Turmas Não Confirmadas ({totais.turmasNaoConfirmadas})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            fin_doc &lt; PE do curso
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
            {turmasNaoConfirmadasList.length > 0 ? (
              turmasNaoConfirmadasList.map((turma) => (
                <div key={turma.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{turma.nomeCurso}</p>
                    <p className="text-xs text-muted-foreground">{turma.nomeCampus} - {turma.turno}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{turma.finDocAtual}/{turma.pe}</p>
                    <p className="text-xs text-muted-foreground">faltam {turma.pe - turma.finDocAtual}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                Todas as turmas com PE estão confirmadas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
