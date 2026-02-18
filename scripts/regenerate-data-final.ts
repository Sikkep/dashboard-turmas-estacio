import * as XLSX from 'xlsx';
import * as fs from 'fs';

function cleanCSVValue(value: string): string {
  let cleaned = value.trim().replace(/\r/g, '');
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned;
}

function cleanCodeValue(value: string): string {
  const cleaned = cleanCSVValue(value);
  if (cleaned.includes(',')) {
    return cleaned.split(',')[0];
  }
  return cleaned;
}

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

interface DadosCAPRow {
  codCampus: string;
  codCurso: string;
  codTurno: string;
  nomTurno: string;
  inscritosAtual: number;
  matFinAtual: number;
  finDocAtual: number;
  matAcadAtual: number;
  inscritosMetaFech: number;
  matFinMetaFech: number;
  finDocMetaFech: number;
  matAcadMetaFech: number;
}

interface TurmaPortfolio {
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

function readPortfolioExcel(filePath: string): TurmaPortfolio[] {
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

function readCAPCSV(filePath: string): { dadosAtuais: DadosCAPRow[], metas: DadosCAPRow[] } {
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

    if (marca !== 'ESTACIO' || periodoAcademico !== '2026.1') {
      continue;
    }

    const dados: DadosCAPRow = {
      codCampus: cleanCodeValue(row['COD_CAMPUS'] || ''),
      codCurso: cleanCodeValue(row['COD_CURSO'] || ''),
      codTurno: cleanCodeValue(row['COD_TURNO'] || ''),
      nomTurno: row['NOM_TURNO'] || '',
      inscritosAtual: parseNumber(row['INSCRITOS_ATUAL']),
      matFinAtual: parseNumber(row['MAT_FIN_ATUAL']),
      finDocAtual: parseNumber(row['FIN_DOC_ATUAL']),
      matAcadAtual: parseNumber(row['MAT_ACAD_ATUAL']),
      inscritosMetaFech: parseNumber(row['INSCRITOS_META_FECH']),
      matFinMetaFech: parseNumber(row['MAT_FIN_META_FECH']),
      finDocMetaFech: parseNumber(row['FIN_DOC_META_FECH']),
      matAcadMetaFech: parseNumber(row['MAT_ACAD_META_FECH']),
    };

    if (fDesistente === 0) {
      dadosAtuais.push(dados);
    }
    
    if (dados.inscritosMetaFech > 0 || dados.matFinMetaFech > 0) {
      metas.push(dados);
    }
  }

  return { dadosAtuais, metas };
}

function aggregateDadosAtuais(rows: DadosCAPRow[]): Map<string, any> {
  const aggregated = new Map<string, any>();

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
        inscritosAtual: row.inscritosAtual,
        matFinAtual: row.matFinAtual,
        finDocAtual: row.finDocAtual,
        matAcadAtual: row.matAcadAtual,
      });
    }
  });

  return aggregated;
}

// Sum all metas by campus+curso
function aggregateMetas(rows: DadosCAPRow[]): Map<string, any> {
  const aggregated = new Map<string, any>();

  rows.forEach(row => {
    const key = `${row.codCampus}_${row.codCurso}`;
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.inscritosMeta += row.inscritosMetaFech;
      existing.matFinMeta += row.matFinMetaFech;
      existing.finDocMeta += row.finDocMetaFech;
      existing.matAcadMeta += row.matAcadMetaFech;
    } else {
      aggregated.set(key, {
        codCampus: row.codCampus,
        codCurso: row.codCurso,
        inscritosMeta: row.inscritosMetaFech,
        matFinMeta: row.matFinMetaFech,
        finDocMeta: row.finDocMetaFech,
        matAcadMeta: row.matAcadMetaFech,
      });
    }
  });

  return aggregated;
}

async function main() {
  console.log('Lendo portfolio...');
  const portfolio = readPortfolioExcel('/home/z/my-project/upload/portfolio.xlsx');
  console.log('Portfolio turmas:', portfolio.length);
  
  console.log('\nLendo CAP 1702.csv...');
  const capResult = readCAPCSV('/home/z/my-project/upload/cap 1702.csv');
  console.log('Dados atuais:', capResult.dadosAtuais.length);
  console.log('Metas:', capResult.metas.length);
  
  const dadosAggregated = aggregateDadosAtuais(capResult.dadosAtuais);
  const metasAggregated = aggregateMetas(capResult.metas);
  
  console.log('\nTurmas com dados:', dadosAggregated.size);
  console.log('Combinações com metas:', metasAggregated.size);
  
  // Calculate totals - current values are summed per turma
  let totalInscritosAtual = 0;
  let totalMatFinAtual = 0;
  let totalFinDocAtual = 0;
  let totalMatAcadAtual = 0;
  
  for (const [key, data] of dadosAggregated) {
    totalInscritosAtual += data.inscritosAtual;
    totalMatFinAtual += data.matFinAtual;
    totalFinDocAtual += data.finDocAtual;
    totalMatAcadAtual += data.matAcadAtual;
  }
  
  // Calculate totals - metas are summed once per campus+curso
  let totalInscritosMeta = 0;
  let totalMatFinMeta = 0;
  let totalFinDocMeta = 0;
  let totalMatAcadMeta = 0;
  
  for (const [key, meta] of metasAggregated) {
    totalInscritosMeta += meta.inscritosMeta;
    totalMatFinMeta += meta.matFinMeta;
    totalFinDocMeta += meta.finDocMeta;
    totalMatAcadMeta += meta.matAcadMeta;
  }
  
  const turmasData: any[] = [];
  
  for (const [key, data] of dadosAggregated) {
    const metaKey = `${data.codCampus}_${data.codCurso}`;
    const meta = metasAggregated.get(metaKey);
    
    // Each turma shows the FULL meta for its campus+curso
    const inscritosMeta = meta ? meta.inscritosMeta : 0;
    const matFinMeta = meta ? meta.matFinMeta : 0;
    const finDocMeta = meta ? meta.finDocMeta : 0;
    const matAcadMeta = meta ? meta.matAcadMeta : 0;
    
    const turmaMatch = portfolio.find(t => 
      t.codCampus === data.codCampus && 
      t.codCurso === data.codCurso && 
      t.codTurno === data.codTurno
    );
    
    if (turmaMatch) {
      turmasData.push({
        id: `turma_${key}`,
        sku: turmaMatch.sku,
        codCampus: data.codCampus,
        nomeCampus: turmaMatch.nomeCampus,
        codCurso: data.codCurso,
        nomeCurso: turmaMatch.nomeCurso,
        codTurno: data.codTurno,
        turno: turmaMatch.turno,
        tipoCurso: turmaMatch.tipoCurso,
        areaConhecimento: turmaMatch.areaConhecimento,
        uf: turmaMatch.uf,
        nomeMunicipio: turmaMatch.nomeMunicipio,
        temDados: true,
        inscritosAtual: data.inscritosAtual,
        inscritosMeta,
        inscritosPercent: inscritosMeta > 0 ? Math.round((data.inscritosAtual / inscritosMeta) * 100) : 0,
        matFinAtual: data.matFinAtual,
        matFinMeta,
        matFinPercent: matFinMeta > 0 ? Math.round((data.matFinAtual / matFinMeta) * 100) : 0,
        finDocAtual: data.finDocAtual,
        finDocMeta,
        finDocPercent: finDocMeta > 0 ? Math.round((data.finDocAtual / finDocMeta) * 100) : 0,
        matAcadAtual: data.matAcadAtual,
        matAcadMeta,
        matAcadPercent: matAcadMeta > 0 ? Math.round((data.matAcadAtual / matAcadMeta) * 100) : 0,
      });
    }
  }
  
  // Add turmas without CAP data
  for (const turma of portfolio) {
    const key = `${turma.codCampus}_${turma.codCurso}_${turma.codTurno}`;
    if (!dadosAggregated.has(key)) {
      // Check if there's a meta for this campus+curso
      const metaKey = `${turma.codCampus}_${turma.codCurso}`;
      const meta = metasAggregated.get(metaKey);
      
      turmasData.push({
        id: `turma_${key}`,
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
        temDados: false,
        inscritosAtual: 0,
        inscritosMeta: meta ? meta.inscritosMeta : 0,
        inscritosPercent: 0,
        matFinAtual: 0,
        matFinMeta: meta ? meta.matFinMeta : 0,
        matFinPercent: 0,
        finDocAtual: 0,
        finDocMeta: meta ? meta.finDocMeta : 0,
        finDocPercent: 0,
        matAcadAtual: 0,
        matAcadMeta: meta ? meta.matAcadMeta : 0,
        matAcadPercent: 0,
      });
    }
  }
  
  console.log('\n=== TOTAIS ===');
  console.log('Inscritos:', totalInscritosAtual, '/', Math.round(totalInscritosMeta * 100) / 100);
  console.log('Mat Fin:', totalMatFinAtual, '/', Math.round(totalMatFinMeta * 100) / 100);
  console.log('Fin Doc:', totalFinDocAtual, '/', Math.round(totalFinDocMeta * 100) / 100);
  console.log('Mat Acad:', totalMatAcadAtual, '/', Math.round(totalMatAcadMeta * 100) / 100);
  
  const inscritosPercent = totalInscritosMeta > 0 ? Math.round((totalInscritosAtual / totalInscritosMeta) * 100) : 0;
  const matFinPercent = totalMatFinMeta > 0 ? Math.round((totalMatFinAtual / totalMatFinMeta) * 100) : 0;
  const finDocPercent = totalFinDocMeta > 0 ? Math.round((totalFinDocAtual / totalFinDocMeta) * 100) : 0;
  const matAcadPercent = totalMatAcadMeta > 0 ? Math.round((totalMatAcadAtual / totalMatAcadMeta) * 100) : 0;
  
  console.log('\nPercentuais:', inscritosPercent + '%', matFinPercent + '%', finDocPercent + '%', matAcadPercent + '%');
  
  const dashboardData = {
    totais: {
      inscritosAtual: totalInscritosAtual,
      inscritosMeta: Math.round(totalInscritosMeta * 100) / 100,
      matFinAtual: totalMatFinAtual,
      matFinMeta: Math.round(totalMatFinMeta * 100) / 100,
      finDocAtual: totalFinDocAtual,
      finDocMeta: Math.round(totalFinDocMeta * 100) / 100,
      matAcadAtual: totalMatAcadAtual,
      matAcadMeta: Math.round(totalMatAcadMeta * 100) / 100,
      totalTurmas: portfolio.length,
      turmasComDados: dadosAggregated.size,
      inscritosPercent,
      matFinPercent,
      finDocPercent,
      matAcadPercent,
    },
    turmas: turmasData,
  };
  
  fs.writeFileSync('/home/z/my-project/src/data/dashboard.json', JSON.stringify(dashboardData, null, 2));
  console.log('\nDados salvos em /home/z/my-project/src/data/dashboard.json');
}

main().catch(console.error);
