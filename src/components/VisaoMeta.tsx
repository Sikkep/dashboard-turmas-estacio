"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, GraduationCap, FileText, BookOpen, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TotaisData {
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

interface CampusData {
  codCampus: string;
  nomeCampus: string;
  totalTurmas: number;
  turmasComDados: number;
  matAcadAtual: number;
  matAcadMeta: number;
  matAcadPercent: number;
}

interface VisaoMetaProps {
  totais: TotaisData;
  campusData: CampusData[];
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return "bg-green-500";
  if (percent >= 70) return "bg-yellow-500";
  if (percent >= 50) return "bg-orange-500";
  return "bg-red-500";
}

function getTrendIcon(percent: number) {
  if (percent >= 90) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (percent >= 70) return <Minus className="h-4 w-4 text-yellow-500" />;
  return <TrendingDown className="h-4 w-4 text-red-500" />;
}

function CardMetric({
  title,
  icon,
  atual,
  meta,
  percent,
}: {
  title: string;
  icon: React.ReactNode;
  atual: number;
  meta: number;
  percent: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{formatNumber(atual)}</span>
            <span className="text-sm text-muted-foreground">
              / {formatNumber(meta)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Atingimento</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all ${getProgressColor(percent)}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VisaoMeta({ totais, campusData }: VisaoMetaProps) {
  // Sort campus by mat_acad percent (descending)
  const sortedCampus = [...campusData].sort((a, b) => b.matAcadPercent - a.matAcadPercent);
  
  // Top 5 and bottom 5 campus
  const topCampus = sortedCampus.slice(0, 5);
  const bottomCampus = sortedCampus.filter(c => c.matAcadMeta > 0).slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Cards de Meta */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Inscritos"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          atual={totais.inscritosAtual}
          meta={totais.inscritosMeta}
          percent={totais.inscritosPercent}
        />
        <CardMetric
          title="Matrículas Finalizadas"
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
          atual={totais.matFinAtual}
          meta={totais.matFinMeta}
          percent={totais.matFinPercent}
        />
        <CardMetric
          title="Financeiro Documentado"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          atual={totais.finDocAtual}
          meta={totais.finDocMeta}
          percent={totais.finDocPercent}
        />
        <CardMetric
          title="Matrículas Acadêmicas"
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          atual={totais.matAcadAtual}
          meta={totais.matAcadMeta}
          percent={totais.matAcadPercent}
        />
      </div>

      {/* Gráfico de Barras Comparativo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativo Realizado vs Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Inscritos", atual: totais.inscritosAtual, meta: totais.inscritosMeta, percent: totais.inscritosPercent },
              { label: "Mat Fin", atual: totais.matFinAtual, meta: totais.matFinMeta, percent: totais.matFinPercent },
              { label: "Fin Doc", atual: totais.finDocAtual, meta: totais.finDocMeta, percent: totais.finDocPercent },
              { label: "Mat Acad", atual: totais.matAcadAtual, meta: totais.matAcadMeta, percent: totais.matAcadPercent },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(item.atual)} / {formatNumber(item.meta)} ({item.percent}%)
                  </span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${getProgressColor(item.percent)}`}
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acompanhamento por Campus - Mat Acad */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top 5 Campus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top 5 Campus - Mat Acad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCampus.map((campus, index) => (
                <div key={campus.codCampus} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">#{index + 1}</span>
                      <span className="truncate max-w-[150px]">{campus.nomeCampus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(campus.matAcadPercent)}
                      <span className="font-medium">{campus.matAcadPercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={campus.matAcadPercent} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {campus.matAcadAtual}/{campus.matAcadMeta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom 5 Campus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Campus com Menor Atingimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomCampus.map((campus, index) => (
                <div key={campus.codCampus} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">#{index + 1}</span>
                      <span className="truncate max-w-[150px]">{campus.nomeCampus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(campus.matAcadPercent)}
                      <span className="font-medium">{campus.matAcadPercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={campus.matAcadPercent} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {campus.matAcadAtual}/{campus.matAcadMeta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Completa de Campus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acompanhamento Individual por Campus - Mat Acad</CardTitle>
          <p className="text-sm text-muted-foreground">
            {campusData.filter(c => c.matAcadMeta > 0).length} campus com meta definida
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
            {sortedCampus.filter(c => c.matAcadMeta > 0).map((campus) => (
              <div 
                key={campus.codCampus} 
                className={`p-3 rounded-lg border ${
                  campus.matAcadPercent >= 90 ? 'border-green-200 bg-green-50' :
                  campus.matAcadPercent >= 70 ? 'border-yellow-200 bg-yellow-50' :
                  campus.matAcadPercent >= 50 ? 'border-orange-200 bg-orange-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate max-w-[150px]">{campus.nomeCampus}</span>
                  <span className={`text-sm font-bold ${
                    campus.matAcadPercent >= 90 ? 'text-green-600' :
                    campus.matAcadPercent >= 70 ? 'text-yellow-600' :
                    campus.matAcadPercent >= 50 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {campus.matAcadPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{campus.matAcadAtual} / {campus.matAcadMeta}</span>
                  <span>{campus.turmasComDados} turmas</span>
                </div>
                <Progress 
                  value={campus.matAcadPercent} 
                  className="h-1.5 mt-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
