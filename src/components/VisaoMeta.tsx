"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, FileText, BookOpen, TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react";

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

function getProgressGradient(percent: number): string {
  if (percent >= 90) return "from-emerald-500 to-green-500";
  if (percent >= 70) return "from-yellow-500 to-amber-500";
  if (percent >= 50) return "from-orange-500 to-amber-500";
  return "from-red-500 to-rose-500";
}

function getProgressBg(percent: number): string {
  if (percent >= 90) return "bg-emerald-100";
  if (percent >= 70) return "bg-yellow-100";
  if (percent >= 50) return "bg-orange-100";
  return "bg-red-100";
}

function getTextColor(percent: number): string {
  if (percent >= 90) return "text-emerald-600";
  if (percent >= 70) return "text-yellow-600";
  if (percent >= 50) return "text-orange-600";
  return "text-red-600";
}

interface MetaCardProps {
  title: string;
  atual: number;
  meta: number;
  percent: number;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

function MetaCard({ title, atual, meta, percent, icon, gradient, iconBg }: MetaCardProps) {
  const progressWidth = Math.min(percent, 100);
  
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">atingimento</p>
            <p className={`text-2xl font-bold ${getTextColor(percent)}`}>{percent}%</p>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        </div>
        
        <div className="flex items-end gap-2 mb-4">
          <span className="text-3xl font-bold text-gray-800">{formatNumber(atual)}</span>
          <span className="text-sm text-gray-500 mb-1">/ {formatNumber(meta)}</span>
        </div>
        
        <div className={`h-3 rounded-full overflow-hidden ${getProgressBg(percent)}`}>
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(percent)} transition-all duration-500`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient}`} />
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

  // Calculate gap values
  const inscritosGap = totais.inscritosMeta - totais.inscritosAtual;
  const matFinGap = totais.matFinMeta - totais.matFinAtual;
  const finDocGap = totais.finDocMeta - totais.finDocAtual;
  const matAcadGap = totais.matAcadMeta - totais.matAcadAtual;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Atingimento de Meta</h2>
          <p className="text-sm text-gray-500">Realizado vs Meta estabelecida</p>
        </div>
      </div>

      {/* Cards de Meta - Coloridos com Progress */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetaCard
          title="INSCRITOS"
          atual={totais.inscritosAtual}
          meta={totais.inscritosMeta}
          percent={totais.inscritosPercent}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          gradient="from-blue-500 to-blue-600"
          iconBg="bg-blue-100"
        />
        <MetaCard
          title="MATRÍCULAS FINALIZADAS"
          atual={totais.matFinAtual}
          meta={totais.matFinMeta}
          percent={totais.matFinPercent}
          icon={<GraduationCap className="h-6 w-6 text-emerald-600" />}
          gradient="from-emerald-500 to-emerald-600"
          iconBg="bg-emerald-100"
        />
        <MetaCard
          title="FINANCEIRO DOCUMENTADO"
          atual={totais.finDocAtual}
          meta={totais.finDocMeta}
          percent={totais.finDocPercent}
          icon={<FileText className="h-6 w-6 text-orange-600" />}
          gradient="from-orange-500 to-orange-600"
          iconBg="bg-orange-100"
        />
        <MetaCard
          title="MATRÍCULAS ACADÊMICAS"
          atual={totais.matAcadAtual}
          meta={totais.matAcadMeta}
          percent={totais.matAcadPercent}
          icon={<BookOpen className="h-6 w-6 text-purple-600" />}
          gradient="from-purple-500 to-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Gaps Summary */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">Gap para Meta</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Inscritos</p>
              <p className={`text-xl font-bold ${inscritosGap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {inscritosGap > 0 ? '-' : '+'}{formatNumber(Math.abs(inscritosGap))}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Mat. Finalizadas</p>
              <p className={`text-xl font-bold ${matFinGap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {matFinGap > 0 ? '-' : '+'}{formatNumber(Math.abs(matFinGap))}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Fin. Documentado</p>
              <p className={`text-xl font-bold ${finDocGap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {finDocGap > 0 ? '-' : '+'}{formatNumber(Math.abs(finDocGap))}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Mat. Acadêmicas</p>
              <p className={`text-xl font-bold ${matAcadGap > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {matAcadGap > 0 ? '-' : '+'}{formatNumber(Math.abs(matAcadGap))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo Visual */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">Comparativo Realizado vs Meta</h3>
          </div>
          <div className="space-y-5">
            {[
              { label: "Inscritos", atual: totais.inscritosAtual, meta: totais.inscritosMeta, percent: totais.inscritosPercent, color: "blue" },
              { label: "Mat Fin", atual: totais.matFinAtual, meta: totais.matFinMeta, percent: totais.matFinPercent, color: "emerald" },
              { label: "Fin Doc", atual: totais.finDocAtual, meta: totais.finDocMeta, percent: totais.finDocPercent, color: "orange" },
              { label: "Mat Acad", atual: totais.matAcadAtual, meta: totais.matAcadMeta, percent: totais.matAcadPercent, color: "purple" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {formatNumber(item.atual)} / {formatNumber(item.meta)}
                    </span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getProgressBg(item.percent)} ${getTextColor(item.percent)}`}>
                      {item.percent}%
                    </span>
                  </div>
                </div>
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getProgressGradient(item.percent)} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                  <div 
                    className="absolute inset-y-0 flex items-center"
                    style={{ left: `${Math.min(item.percent, 100)}%` }}
                  >
                    <div className="w-1 h-6 bg-gray-400 rounded-full -ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acompanhamento por Campus - Mat Acad */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Campus */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Top 5 Campus</h3>
                <p className="text-xs text-gray-500">Maior atingimento de Mat Acad</p>
              </div>
            </div>
            <div className="space-y-3">
              {topCampus.map((campus, index) => (
                <div key={campus.codCampus} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-amber-600' : 'bg-emerald-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{campus.nomeCampus}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-emerald-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(campus.matAcadPercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-emerald-600">{campus.matAcadPercent}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{campus.matAcadAtual}</p>
                    <p className="text-xs text-gray-500">/ {campus.matAcadMeta}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom 5 Campus */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Atenção Necessária</h3>
                <p className="text-xs text-gray-500">Menor atingimento de Mat Acad</p>
              </div>
            </div>
            <div className="space-y-3">
              {bottomCampus.map((campus, index) => (
                <div key={campus.codCampus} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{campus.nomeCampus}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-red-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${Math.min(campus.matAcadPercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-red-600">{campus.matAcadPercent}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{campus.matAcadAtual}</p>
                    <p className="text-xs text-gray-500">/ {campus.matAcadMeta}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Completa de Campus */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Ranking Completo por Campus</h3>
              <p className="text-xs text-gray-500">{campusData.filter(c => c.matAcadMeta > 0).length} campus com meta definida</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {sortedCampus.filter(c => c.matAcadMeta > 0).map((campus, index) => (
              <div 
                key={campus.codCampus} 
                className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${
                  campus.matAcadPercent >= 90 ? 'border-emerald-200 bg-emerald-50' :
                  campus.matAcadPercent >= 70 ? 'border-yellow-200 bg-yellow-50' :
                  campus.matAcadPercent >= 50 ? 'border-orange-200 bg-orange-50' :
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      index < 5 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{campus.nomeCampus}</span>
                  </div>
                  <span className={`text-lg font-bold ${getTextColor(campus.matAcadPercent)}`}>
                    {campus.matAcadPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{campus.matAcadAtual} / {campus.matAcadMeta}</span>
                  <span>{campus.turmasComDados} turmas</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${getProgressBg(campus.matAcadPercent)}`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(campus.matAcadPercent)}`}
                    style={{ width: `${Math.min(campus.matAcadPercent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
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
