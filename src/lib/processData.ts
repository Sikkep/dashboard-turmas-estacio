import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { db } from './db';

// Types for the data
export interface TurmaPortfolio {
  sku: string;
  marca: string;
  codCampus: string;
  nomeCampus: string;
  codCurso: string;
  nomeCurso: string;
  codTurno: string;
  turno: string;
  tipoCurso: string | null;
  areaConhecimento: string | null;
  uf: string | null;
  nomeMunicipio: string | null;
}

export interface DadosCAPRow {
  periodoAcademico: string;
  marca: string;
  fDesistente: number;
  codCampus: string;
  nomCampus: string;
  codCurso: string;
  nomCurso: string;
  codTurno: string;
  nomTurno: string;
  acaoCaptacao: string;
  inscritosAtual: number;
  inscritosMeta: number;
  matFinAtual: number;
  matFinMeta: number;
  finDocAtual: number;
  finDocMeta: number;
  matAcadAtual: number;
  matAcadMeta: number;
  // Metas FECH
  inscritosMetaFech: number;
  matFinMetaFech: number;
  finDocMetaFech: number;
  matAcadMetaFech: number;
}

export interface AggregatedCAPData {
  codCampus: string;
  codCurso: string;
  codTurno: string;
  periodoAcademico: string;
  inscritosAtual: number;
  inscritosMeta: number;
  matFinAtual: number;
  matFinMeta: number;
  finDocAtual: number;
  finDocMeta: number;
  matAcadAtual: number;
  matAcadMeta: number;
}

export interface MetaData {
  codCampus: string;
  codCurso: string;
  inscritosMeta: number;
  matFinMeta: number;
  finDocMeta: number;
  matAcadMeta: number;
}

// Clean CSV value
function cleanCSVValue(value: string): string {
  let cleaned = value.trim().replace(/\r/g, '');
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned;
}

// Clean code value - remove decimal part
function cleanCodeValue(value: string): string {
  const cleaned = cleanCSVValue(value);
  if (cleaned.includes(',')) {
    return cleaned.split(',')[0];
  }
  return cleaned;
}

// Parse number with comma as decimal separator
function parseNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  let cleaned = value.toString();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  const normalized = cleaned.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

// Read and parse the portfolio Excel file
export function readPortfolioExcel(filePath: string): TurmaPortfolio[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  return data.map((row: Record<string, unknown>) => ({
    sku: String(row['SKU'] || ''),
    marca: String(row['MARCA'] || ''),
    codCampus: String(row['COD CAMPUS'] || ''),
    nomeCampus: String(row['NOME CAMPUS'] || ''),
    codCurso: String(row['COD CURSO'] || ''),
    nomeCurso: String(row['NOME CURSO'] || ''),
    codTurno: String(row['COD TURNO'] || ''),
    turno: String(row['TURNO'] || ''),
    tipoCurso: row['TIPO DE CURSO'] ? String(row['TIPO DE CURSO']) : null,
    areaConhecimento: row['AREA DO CONHECIMENTO'] ? String(row['AREA DO CONHECIMENTO']) : null,
    uf: row['UF'] ? String(row['UF']) : null,
    nomeMunicipio: row['NOME MUNICIPIO'] ? String(row['NOME MUNICIPIO']) : null,
  }));
}

// Read and parse the CAP CSV file
export function readCAPCSV(filePath: string): { dadosAtuais: DadosCAPRow[], metas: DadosCAPRow[] } {
  const fileContent = fs.readFileSync(filePath, { encoding: 'latin1' });
  const lines = fileContent.split('\n');
  if (lines.length === 0) return { dadosAtuais: [], metas: [] };

  const headers = lines[0].split(';').map(h => cleanCSVValue(h));
  const dadosAtuais: DadosCAPRow[] = [];
  const metas: DadosCAPRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = cleanCSVValue(values[index] || '');
    });

    const marca = row['MARCA'] || '';
    const periodoAcademico = row['PERIODO_ACADEMICO'] || '';
    const fDesistenteStr = row['F_DESISTENTE'] || '';
    const fDesistente = fDesistenteStr ? Math.round(parseNumber(fDesistenteStr)) : -1;
    const acaoCaptacao = row['ACAO_CAPTACAO'] || '';

    if (marca !== 'ESTACIO' || periodoAcademico !== '2026.1') {
      continue;
    }

    const dados: DadosCAPRow = {
      periodoAcademico,
      marca,
      fDesistente,
      codCampus: cleanCodeValue(row['COD_CAMPUS'] || ''),
      nomCampus: row['NOM_CAMPUS'] || '',
      codCurso: cleanCodeValue(row['COD_CURSO'] || ''),
      nomCurso: row['NOM_CURSO'] || '',
      codTurno: cleanCodeValue(row['COD_TURNO'] || ''),
      nomTurno: row['NOM_TURNO'] || '',
      acaoCaptacao,
      inscritosAtual: parseNumber(row['INSCRITOS_ATUAL']),
      inscritosMeta: parseNumber(row['INSCRITOS_META']),
      matFinAtual: parseNumber(row['MAT_FIN_ATUAL']),
      matFinMeta: parseNumber(row['MAT_FIN_META']),
      finDocAtual: parseNumber(row['FIN_DOC_ATUAL']),
      finDocMeta: parseNumber(row['FIN_DOC_META']),
      matAcadAtual: parseNumber(row['MAT_ACAD_ATUAL']),
      matAcadMeta: parseNumber(row['MAT_ACAD_META']),
      // Metas FECH (colunas 38-41)
      inscritosMetaFech: parseNumber(row['INSCRITOS_META_FECH']),
      matFinMetaFech: parseNumber(row['MAT_FIN_META_FECH']),
      finDocMetaFech: parseNumber(row['FIN_DOC_META_FECH']),
      matAcadMetaFech: parseNumber(row['MAT_ACAD_META_FECH']),
    };

    // Dados atuais: F_DESISTENTE = 0
    if (fDesistente === 0) {
      dadosAtuais.push(dados);
    }

    // Metas: usar linhas com COD_TURNO = 0 (linhas de alocação de meta)
    // Essas linhas têm F_DESISTENTE vazio e contêm as metas META_FECH
    if (dados.codTurno === '0' && (dados.inscritosMetaFech > 0 || dados.matFinMetaFech > 0)) {
      metas.push(dados);
    }
  }

  return { dadosAtuais, metas };
}

// Aggregate current data by turma (campus + curso + turno)
export function aggregateDadosAtuais(rows: DadosCAPRow[]): Map<string, AggregatedCAPData> {
  const aggregated = new Map<string, AggregatedCAPData>();

  rows.forEach(row => {
    const key = `${row.codCampus}_${row.codCurso}_${row.codTurno}`;
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.inscritosAtual += row.inscritosAtual;
      existing.matFinAtual += row.matFinAtual;
      existing.finDocAtual += row.finDocAtual;
      existing.matAcadAtual += row.matAcadAtual;
    } else {
      aggregated.set(key, {
        codCampus: row.codCampus,
        codCurso: row.codCurso,
        codTurno: row.codTurno,
        periodoAcademico: row.periodoAcademico,
        inscritosAtual: row.inscritosAtual,
        inscritosMeta: 0,
        matFinAtual: row.matFinAtual,
        matFinMeta: 0,
        finDocAtual: row.finDocAtual,
        finDocMeta: 0,
        matAcadAtual: row.matAcadAtual,
        matAcadMeta: 0,
      });
    }
  });

  return aggregated;
}

// Aggregate metas FECH by campus + curso (sum all ACAO_CAPTACAO metas)
export function aggregateMetas(rows: DadosCAPRow[]): Map<string, MetaData> {
  const aggregated = new Map<string, MetaData>();

  rows.forEach(row => {
    const key = `${row.codCampus}_${row.codCurso}`;
    
    // Usar META_FECH que são as metas corretas - somar todas as ACAO_CAPTACAO
    const inscritosMeta = row.inscritosMetaFech || row.inscritosMeta;
    const matFinMeta = row.matFinMetaFech || row.matFinMeta;
    const finDocMeta = row.finDocMetaFech || row.finDocMeta;
    const matAcadMeta = row.matAcadMetaFech || row.matAcadMeta;
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.inscritosMeta += inscritosMeta;
      existing.matFinMeta += matFinMeta;
      existing.finDocMeta += finDocMeta;
      existing.matAcadMeta += matAcadMeta;
    } else {
      aggregated.set(key, {
        codCampus: row.codCampus,
        codCurso: row.codCurso,
        inscritosMeta,
        matFinMeta,
        finDocMeta,
        matAcadMeta,
      });
    }
  });

  return aggregated;
}

// Count turnos per campus+curso from portfolio
async function countTurnosPerCurso(): Promise<Map<string, number>> {
  const turmas = await db.turma.findMany();
  const countMap = new Map<string, number>();
  
  turmas.forEach(t => {
    const key = `${t.codCampus}_${t.codCurso}`;
    countMap.set(key, (countMap.get(key) || 0) + 1);
  });
  
  return countMap;
}

// Sync portfolio data to database
export async function syncPortfolioToDatabase(filePath: string): Promise<{ count: number }> {
  const turmas = readPortfolioExcel(filePath);
  
  await db.dadosCAP.deleteMany();
  await db.turma.deleteMany();

  let count = 0;
  for (const turma of turmas) {
    await db.turma.create({
      data: {
        sku: turma.sku,
        marca: turma.marca,
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
      },
    });
    count++;
  }

  return { count };
}

// Sync CAP data to database
export async function syncCAPToDatabase(filePath: string): Promise<{ count: number }> {
  const { dadosAtuais, metas } = readCAPCSV(filePath);
  
  console.log('Dados atuais lidos:', dadosAtuais.length);
  console.log('Metas lidas:', metas.length);
  
  const dadosAggregated = aggregateDadosAtuais(dadosAtuais);
  const metasAggregated = aggregateMetas(metas);
  
  console.log('Turmas com dados atuais:', dadosAggregated.size);
  console.log('Combinações com metas:', metasAggregated.size);
  
  // Calcular totais das metas para verificação
  let totalMetaInsc = 0, totalMetaMatFin = 0;
  for (const [key, meta] of metasAggregated) {
    totalMetaInsc += meta.inscritosMeta;
    totalMetaMatFin += meta.matFinMeta;
  }
  console.log('Total metas inscritos:', totalMetaInsc);
  console.log('Total metas mat_fin:', totalMetaMatFin);
  
  // Contar turnos por campus+curso para distribuir metas proporcionalmente
  const turnosPorCurso = new Map<string, number>();
  for (const [key, data] of dadosAggregated) {
    const cursoKey = `${data.codCampus}_${data.codCurso}`;
    turnosPorCurso.set(cursoKey, (turnosPorCurso.get(cursoKey) || 0) + 1);
  }
  
  let count = 0;
  for (const [key, data] of dadosAggregated) {
    const turma = await db.turma.findFirst({
      where: {
        codCampus: data.codCampus,
        codCurso: data.codCurso,
        codTurno: data.codTurno,
      },
    });

    if (turma) {
      const metaKey = `${data.codCampus}_${data.codCurso}`;
      const meta = metasAggregated.get(metaKey);
      const numTurnos = turnosPorCurso.get(metaKey) || 1;
      
      // Dividir a meta proporcionalmente entre os turnos
      const inscritosMeta = meta ? meta.inscritosMeta / numTurnos : 0;
      const matFinMeta = meta ? meta.matFinMeta / numTurnos : 0;
      const finDocMeta = meta ? meta.finDocMeta / numTurnos : 0;
      const matAcadMeta = meta ? meta.matAcadMeta / numTurnos : 0;
      
      await db.dadosCAP.upsert({
        where: { turmaId: turma.id },
        create: {
          turmaId: turma.id,
          periodoAcademico: data.periodoAcademico,
          inscritosAtual: data.inscritosAtual,
          inscritosMeta,
          matFinAtual: data.matFinAtual,
          matFinMeta,
          finDocAtual: data.finDocAtual,
          finDocMeta,
          matAcadAtual: data.matAcadAtual,
          matAcadMeta,
        },
        update: {
          periodoAcademico: data.periodoAcademico,
          inscritosAtual: data.inscritosAtual,
          inscritosMeta,
          matFinAtual: data.matFinAtual,
          matFinMeta,
          finDocAtual: data.finDocAtual,
          finDocMeta,
          matAcadAtual: data.matAcadAtual,
          matAcadMeta,
        },
      });
      count++;
    }
  }

  return { count };
}

// Update last sync timestamp
export async function updateLastSyncTimestamp(): Promise<void> {
  await db.configuracao.upsert({
    where: { chave: 'last_sync' },
    create: { chave: 'last_sync', valor: new Date().toISOString() },
    update: { valor: new Date().toISOString() },
  });
}

// Get last sync timestamp
export async function getLastSyncTimestamp(): Promise<Date | null> {
  const config = await db.configuracao.findUnique({
    where: { chave: 'last_sync' },
  });
  return config ? new Date(config.valor) : null;
}

// Full sync process
export async function fullSync(portfolioPath: string, capPath: string): Promise<{
  portfolioCount: number;
  capCount: number;
  timestamp: Date;
}> {
  const portfolioResult = await syncPortfolioToDatabase(portfolioPath);
  const capResult = await syncCAPToDatabase(capPath);
  await updateLastSyncTimestamp();

  return {
    portfolioCount: portfolioResult.count,
    capCount: capResult.count,
    timestamp: new Date(),
  };
}

// Process uploaded CAP CSV file
export async function processUploadedCAPCSV(fileContent: string): Promise<{ count: number }> {
  const lines = fileContent.split('\n');
  if (lines.length === 0) return { count: 0 };

  const headers = lines[0].split(';').map(h => cleanCSVValue(h));
  const dadosAtuais: DadosCAPRow[] = [];
  const metas: DadosCAPRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = cleanCSVValue(values[index] || '');
    });

    const marca = row['MARCA'] || '';
    const periodoAcademico = row['PERIODO_ACADEMICO'] || '';
    const fDesistenteStr = row['F_DESISTENTE'] || '';
    const fDesistente = fDesistenteStr ? Math.round(parseNumber(fDesistenteStr)) : -1;

    if (marca !== 'ESTACIO' || periodoAcademico !== '2026.1') {
      continue;
    }

    const dados: DadosCAPRow = {
      periodoAcademico,
      marca,
      fDesistente,
      codCampus: cleanCodeValue(row['COD_CAMPUS'] || ''),
      nomCampus: row['NOM_CAMPUS'] || '',
      codCurso: cleanCodeValue(row['COD_CURSO'] || ''),
      nomCurso: row['NOM_CURSO'] || '',
      codTurno: cleanCodeValue(row['COD_TURNO'] || ''),
      nomTurno: row['NOM_TURNO'] || '',
      acaoCaptacao: row['ACAO_CAPTACAO'] || '',
      inscritosAtual: parseNumber(row['INSCRITOS_ATUAL']),
      inscritosMeta: parseNumber(row['INSCRITOS_META']),
      matFinAtual: parseNumber(row['MAT_FIN_ATUAL']),
      matFinMeta: parseNumber(row['MAT_FIN_META']),
      finDocAtual: parseNumber(row['FIN_DOC_ATUAL']),
      finDocMeta: parseNumber(row['FIN_DOC_META']),
      matAcadAtual: parseNumber(row['MAT_ACAD_ATUAL']),
      matAcadMeta: parseNumber(row['MAT_ACAD_META']),
      inscritosMetaFech: parseNumber(row['INSCRITOS_META_FECH']),
      matFinMetaFech: parseNumber(row['MAT_FIN_META_FECH']),
      finDocMetaFech: parseNumber(row['FIN_DOC_META_FECH']),
      matAcadMetaFech: parseNumber(row['MAT_ACAD_META_FECH']),
    };

    if (fDesistente === 0) {
      dadosAtuais.push(dados);
    }
    // Metas: usar linhas com COD_TURNO = 0 (linhas de alocação de meta)
    if (dados.codTurno === '0' && (dados.inscritosMetaFech > 0 || dados.matFinMetaFech > 0)) {
      metas.push(dados);
    }
  }

  await db.dadosCAP.deleteMany();

  const dadosAggregated = aggregateDadosAtuais(dadosAtuais);
  const metasAggregated = aggregateMetas(metas);
  
  let count = 0;
  for (const [_key, data] of dadosAggregated) {
    const turma = await db.turma.findFirst({
      where: {
        codCampus: data.codCampus,
        codCurso: data.codCurso,
        codTurno: data.codTurno,
      },
    });

    if (turma) {
      const metaKey = `${data.codCampus}_${data.codCurso}`;
      const meta = metasAggregated.get(metaKey);
      
      // Cada turma mostra a META TOTAL do campus+curso (não dividir por turnos)
      await db.dadosCAP.create({
        data: {
          turmaId: turma.id,
          periodoAcademico: data.periodoAcademico,
          inscritosAtual: data.inscritosAtual,
          inscritosMeta: meta ? meta.inscritosMeta : 0,
          matFinAtual: data.matFinAtual,
          matFinMeta: meta ? meta.matFinMeta : 0,
          finDocAtual: data.finDocAtual,
          finDocMeta: meta ? meta.finDocMeta : 0,
          matAcadAtual: data.matAcadAtual,
          matAcadMeta: meta ? meta.matAcadMeta : 0,
        },
      });
      count++;
    }
  }

  await updateLastSyncTimestamp();
  return { count };
}
