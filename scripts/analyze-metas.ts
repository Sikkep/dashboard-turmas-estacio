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

function parseNumber(value: string): number {
  if (!value) return 0;
  let cleaned = value.toString();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  const normalized = cleaned.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

const fileContent = fs.readFileSync('/home/z/my-project/upload/cap 1702.csv', { encoding: 'latin1' });
const lines = fileContent.split('\n');
const headers = lines[0].split(';').map(h => cleanCSVValue(h));

// Map to store metas by campus+curso
const metasByCampusCurso = new Map<string, any[]>();

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
  
  if (marca !== 'ESTACIO' || periodoAcademico !== '2026.1') {
    continue;
  }

  const inscritosMetaFech = parseNumber(row['INSCRITOS_META_FECH']);
  const matFinMetaFech = parseNumber(row['MAT_FIN_META_FECH']);
  
  if (inscritosMetaFech > 0 || matFinMetaFech > 0) {
    const codCampus = cleanCodeValue(row['COD_CAMPUS'] || '');
    const codCurso = cleanCodeValue(row['COD_CURSO'] || '');
    const acaoCaptacao = row['ACAO_CAPTACAO'] || '';
    const key = `${codCampus}_${codCurso}`;
    
    if (!metasByCampusCurso.has(key)) {
      metasByCampusCurso.set(key, []);
    }
    
    metasByCampusCurso.get(key)!.push({
      acaoCaptacao,
      inscritosMetaFech,
      matFinMetaFech,
      finDocMetaFech: parseNumber(row['FIN_DOC_META_FECH']),
      matAcadMetaFech: parseNumber(row['MAT_ACAD_META_FECH']),
    });
  }
}

console.log('Total campus+curso com metas:', metasByCampusCurso.size);

// Check for duplicates
let duplicates = 0;
let total = 0;
for (const [key, metas] of metasByCampusCurso) {
  if (metas.length > 1) {
    duplicates++;
    total += metas.length;
  }
}

console.log('Campus+curso com múltiplas entradas de meta:', duplicates);
console.log('Total de entradas de metas:', total);

// Show example
const firstKey = Array.from(metasByCampusCurso.keys())[0];
console.log(`\nExemplo para ${firstKey}:`);
for (const m of metasByCampusCurso.get(firstKey) || []) {
  console.log(`  ${m.acaoCaptacao}: insc=${m.inscritosMetaFech.toFixed(2)}, matFin=${m.matFinMetaFech.toFixed(2)}`);
}

// Calculate total using MAX per campus+curso instead of sum
let totalInscritosMax = 0;
let totalMatFinMax = 0;
let totalFinDocMax = 0;
let totalMatAcadMax = 0;

for (const [key, metas] of metasByCampusCurso) {
  const maxInsc = Math.max(...metas.map(m => m.inscritosMetaFech));
  const maxMatFin = Math.max(...metas.map(m => m.matFinMetaFech));
  const maxFinDoc = Math.max(...metas.map(m => m.finDocMetaFech));
  const maxMatAcad = Math.max(...metas.map(m => m.matAcadMetaFech));
  
  totalInscritosMax += maxInsc;
  totalMatFinMax += maxMatFin;
  totalFinDocMax += maxFinDoc;
  totalMatAcadMax += maxMatAcad;
}

console.log('\n=== USANDO MAX POR CAMPUS+CURSO ===');
console.log('Inscritos Meta:', Math.round(totalInscritosMax * 100) / 100);
console.log('Mat Fin Meta:', Math.round(totalMatFinMax * 100) / 100);
console.log('Fin Doc Meta:', Math.round(totalFinDocMax * 100) / 100);
console.log('Mat Acad Meta:', Math.round(totalMatAcadMax * 100) / 100);

// Calculate total using SUM
let totalInscritosSum = 0;
let totalMatFinSum = 0;
let totalFinDocSum = 0;
let totalMatAcadSum = 0;

for (const [key, metas] of metasByCampusCurso) {
  for (const m of metas) {
    totalInscritosSum += m.inscritosMetaFech;
    totalMatFinSum += m.matFinMetaFech;
    totalFinDocSum += m.finDocMetaFech;
    totalMatAcadSum += m.matAcadMetaFech;
  }
}

console.log('\n=== USANDO SUM DE TODAS AS ENTRADAS ===');
console.log('Inscritos Meta:', Math.round(totalInscritosSum * 100) / 100);
console.log('Mat Fin Meta:', Math.round(totalMatFinSum * 100) / 100);
console.log('Fin Doc Meta:', Math.round(totalFinDocSum * 100) / 100);
console.log('Mat Acad Meta:', Math.round(totalMatAcadSum * 100) / 100);

console.log('\n=== ESPERADO (da imagem) ===');
console.log('Inscritos Meta: 14268');
console.log('Mat Fin Meta: 4999');
console.log('Fin Doc Meta: 4749');
console.log('Mat Acad Meta: 3609');
