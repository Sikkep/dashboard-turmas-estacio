import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campus = searchParams.get('campus');
    const curso = searchParams.get('curso');
    const turno = searchParams.get('turno');

    // Build filter conditions
    const where: Record<string, unknown> = {};
    
    if (campus && campus !== 'all') {
      where.codCampus = campus;
    }
    if (curso && curso !== 'all') {
      where.codCurso = curso;
    }
    if (turno && turno !== 'all') {
      where.codTurno = turno;
    }

    // Get all turmas with their CAP data
    const turmas = await db.turma.findMany({
      where,
      include: {
        dadosCAP: true,
      },
      orderBy: [
        { nomeCampus: 'asc' },
        { nomeCurso: 'asc' },
        { turno: 'asc' },
      ],
    });

    // Calculate totals for dashboard
    let totalInscritosAtual = 0;
    let totalInscritosMeta = 0;
    let totalMatFinAtual = 0;
    let totalMatFinMeta = 0;
    let totalFinDocAtual = 0;
    let totalFinDocMeta = 0;
    let totalMatAcadAtual = 0;
    let totalMatAcadMeta = 0;

    const turmasComDados = turmas.map(turma => {
      const dados = turma.dadosCAP;
      
      const inscritosAtual = dados?.inscritosAtual || 0;
      const inscritosMeta = dados?.inscritosMeta || 0;
      const matFinAtual = dados?.matFinAtual || 0;
      const matFinMeta = dados?.matFinMeta || 0;
      const finDocAtual = dados?.finDocAtual || 0;
      const finDocMeta = dados?.finDocMeta || 0;
      const matAcadAtual = dados?.matAcadAtual || 0;
      const matAcadMeta = dados?.matAcadMeta || 0;

      totalInscritosAtual += inscritosAtual;
      totalInscritosMeta += inscritosMeta;
      totalMatFinAtual += matFinAtual;
      totalMatFinMeta += matFinMeta;
      totalFinDocAtual += finDocAtual;
      totalFinDocMeta += finDocMeta;
      totalMatAcadAtual += matAcadAtual;
      totalMatAcadMeta += matAcadMeta;

      // Calculate percentage for each metric
      const calcPercent = (atual: number, meta: number) => 
        meta > 0 ? Math.round((atual / meta) * 100) : 0;

      return {
        id: turma.id,
        sku: turma.sku,
        codCampus: turma.codCampus,
        nomeCampus: turma.nomeCampus,
        codCurso: turma.codCurso,
        nomeCurso: turma.nomeCurso,
        codTurno: turma.codTurno,
        turno: turma.turno,
        tipoCurso: turma.tipoCurso,
        areaConhecimento: turma.areaConhecimento,
        uf: turma.uf,
        nomeMunicipio: turma.nomeMunicipio,
        temDados: !!dados,
        inscritosAtual,
        inscritosMeta,
        inscritosPercent: calcPercent(inscritosAtual, inscritosMeta),
        matFinAtual,
        matFinMeta,
        matFinPercent: calcPercent(matFinAtual, matFinMeta),
        finDocAtual,
        finDocMeta,
        finDocPercent: calcPercent(finDocAtual, finDocMeta),
        matAcadAtual,
        matAcadMeta,
        matAcadPercent: calcPercent(matAcadAtual, matAcadMeta),
      };
    });

    // Get filter options
    const campusOptions = await db.turma.groupBy({
      by: ['codCampus', 'nomeCampus'],
      orderBy: { nomeCampus: 'asc' },
    });

    const cursoOptions = await db.turma.groupBy({
      by: ['codCurso', 'nomeCurso'],
      orderBy: { nomeCurso: 'asc' },
    });

    const turnoOptions = await db.turma.groupBy({
      by: ['codTurno', 'turno'],
      orderBy: { turno: 'asc' },
    });

    // Aggregate data by campus
    const campusAggregated = await db.turma.groupBy({
      by: ['codCampus', 'nomeCampus'],
      where,
      _count: {
        id: true,
      },
    });

    // Get CAP data aggregated by campus
    const turmasByCampus = new Map<string, typeof turmasComDados>();
    turmasComDados.forEach(t => {
      const key = t.codCampus;
      if (!turmasByCampus.has(key)) {
        turmasByCampus.set(key, []);
      }
      turmasByCampus.get(key)!.push(t);
    });

    const campusData = campusAggregated.map(c => {
      const turmasDoCampus = turmasByCampus.get(c.codCampus) || [];
      const inscritosAtual = turmasDoCampus.reduce((sum, t) => sum + t.inscritosAtual, 0);
      const inscritosMeta = turmasDoCampus.reduce((sum, t) => sum + t.inscritosMeta, 0);
      const matFinAtual = turmasDoCampus.reduce((sum, t) => sum + t.matFinAtual, 0);
      const matFinMeta = turmasDoCampus.reduce((sum, t) => sum + t.matFinMeta, 0);
      const finDocAtual = turmasDoCampus.reduce((sum, t) => sum + t.finDocAtual, 0);
      const finDocMeta = turmasDoCampus.reduce((sum, t) => sum + t.finDocMeta, 0);
      const matAcadAtual = turmasDoCampus.reduce((sum, t) => sum + t.matAcadAtual, 0);
      const matAcadMeta = turmasDoCampus.reduce((sum, t) => sum + t.matAcadMeta, 0);

      return {
        codCampus: c.codCampus,
        nomeCampus: c.nomeCampus,
        totalTurmas: c._count.id,
        turmasComDados: turmasDoCampus.filter(t => t.temDados).length,
        inscritosAtual,
        inscritosMeta,
        inscritosPercent: inscritosMeta > 0 ? Math.round((inscritosAtual / inscritosMeta) * 100) : 0,
        matFinAtual,
        matFinMeta,
        matFinPercent: matFinMeta > 0 ? Math.round((matFinAtual / matFinMeta) * 100) : 0,
        finDocAtual,
        finDocMeta,
        finDocPercent: finDocMeta > 0 ? Math.round((finDocAtual / finDocMeta) * 100) : 0,
        matAcadAtual,
        matAcadMeta,
        matAcadPercent: matAcadMeta > 0 ? Math.round((matAcadAtual / matAcadMeta) * 100) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totais: {
          inscritosAtual: totalInscritosAtual,
          inscritosMeta: totalInscritosMeta,
          inscritosPercent: totalInscritosMeta > 0 ? Math.round((totalInscritosAtual / totalInscritosMeta) * 100) : 0,
          matFinAtual: totalMatFinAtual,
          matFinMeta: totalMatFinMeta,
          matFinPercent: totalMatFinMeta > 0 ? Math.round((totalMatFinAtual / totalMatFinMeta) * 100) : 0,
          finDocAtual: totalFinDocAtual,
          finDocMeta: totalFinDocMeta,
          finDocPercent: totalFinDocMeta > 0 ? Math.round((totalFinDocAtual / totalFinDocMeta) * 100) : 0,
          matAcadAtual: totalMatAcadAtual,
          matAcadMeta: totalMatAcadMeta,
          matAcadPercent: totalMatAcadMeta > 0 ? Math.round((totalMatAcadAtual / totalMatAcadMeta) * 100) : 0,
          totalTurmas: turmas.length,
          turmasComDados: turmas.filter(t => t.dadosCAP).length,
        },
        turmas: turmasComDados,
        campusData,
        filtros: {
          campus: campusOptions.map(c => ({ value: c.codCampus, label: c.nomeCampus })),
          cursos: cursoOptions.map(c => ({ value: c.codCurso, label: c.nomeCurso })),
          turnos: turnoOptions.map(t => ({ value: t.codTurno, label: t.turno })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao buscar dados',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
