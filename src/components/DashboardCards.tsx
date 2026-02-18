"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, GraduationCap, FileText, BookOpen } from "lucide-react";

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
  totalTurmas: number;
  turmasComDados: number;
}

interface DashboardCardsProps {
  totais: TotaisData;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return "bg-green-500";
  if (percent >= 70) return "bg-yellow-500";
  return "bg-red-500";
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

export default function DashboardCards({ totais }: DashboardCardsProps) {
  const cards = [
    {
      title: "Inscritos",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      atual: totais.inscritosAtual,
      meta: totais.inscritosMeta,
      percent: totais.inscritosPercent,
    },
    {
      title: "Matrículas Finalizadas",
      icon: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
      atual: totais.matFinAtual,
      meta: totais.matFinMeta,
      percent: totais.matFinPercent,
    },
    {
      title: "Financeiro Documentado",
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      atual: totais.finDocAtual,
      meta: totais.finDocMeta,
      percent: totais.finDocPercent,
    },
    {
      title: "Matrículas Acadêmicas",
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
      atual: totais.matAcadAtual,
      meta: totais.matAcadMeta,
      percent: totais.matAcadPercent,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <CardMetric key={index} {...card} />
      ))}
    </div>
  );
}
