import { fullSync } from '../src/lib/processData';
import * as path from 'path';

async function sync() {
  try {
    const portfolioPath = path.join(process.cwd(), 'upload', 'portfolio.xlsx');
    const capPath = path.join(process.cwd(), 'upload', 'CAP_2026.csv');
    
    console.log('Iniciando sincronização...');
    console.log('Portfolio:', portfolioPath);
    console.log('CAP:', capPath);
    
    const result = await fullSync(portfolioPath, capPath);
    
    console.log('Sincronização concluída!');
    console.log('Turmas sincronizadas:', result.portfolioCount);
    console.log('Dados CAP sincronizados:', result.capCount);
    console.log('Timestamp:', result.timestamp);
  } catch (error) {
    console.error('Erro na sincronização:', error);
    process.exit(1);
  }
}

sync();
