"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TotaisData {
  inscritosAtual: number;
  inscritosMeta: number;
  matFinAtual: number;
  matFinMeta: number;
  finDocAtual: number;
  finDocMeta: number;
  matAcadAtual: number;
  matAcadMeta: number;
}

interface PerformanceChartProps {
  totais: TotaisData;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(num);
}

export default function PerformanceChart({ totais }: PerformanceChartProps) {
  const data = [
    {
      name: "Inscritos",
      Atual: totais.inscritosAtual,
      Meta: totais.inscritosMeta,
    },
    {
      name: "Mat. Finalizadas",
      Atual: totais.matFinAtual,
      Meta: totais.matFinMeta,
    },
    {
      name: "Fin. Documentado",
      Atual: totais.finDocAtual,
      Meta: totais.finDocMeta,
    },
    {
      name: "Mat. Acadêmicas",
      Atual: totais.matAcadAtual,
      Meta: totais.matAcadMeta,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparativo Atual vs Meta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), ""]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Bar dataKey="Atual" fill="#22c55e" name="Atual" />
              <Bar dataKey="Meta" fill="#6366f1" name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
