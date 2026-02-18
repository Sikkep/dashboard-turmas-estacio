import { NextResponse } from 'next/server';
import * as path from 'path';
import { fullSync, getLastSyncTimestamp } from '@/lib/processData';

export async function POST() {
  try {
    const portfolioPath = path.join(process.cwd(), 'upload', 'portfolio.xlsx');
    const capPath = path.join(process.cwd(), 'upload', 'CAP_2026.csv');

    const result = await fullSync(portfolioPath, capPath);

    return NextResponse.json({
      success: true,
      message: 'Dados sincronizados com sucesso',
      data: result,
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao sincronizar dados',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const lastSync = await getLastSyncTimestamp();
    
    return NextResponse.json({
      success: true,
      lastSync: lastSync ? lastSync.toISOString() : null,
    });
  } catch (error) {
    console.error('Error getting last sync:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao obter última sincronização',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
