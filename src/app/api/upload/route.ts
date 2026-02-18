import { NextRequest, NextResponse } from 'next/server';
import { processUploadedCAPCSV } from '@/lib/processData';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nenhum arquivo enviado',
        },
        { status: 400 }
      );
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Por favor, envie um arquivo CSV',
        },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Process the uploaded CSV
    const result = await processUploadedCAPCSV(fileContent);

    return NextResponse.json({
      success: true,
      message: 'Arquivo processado com sucesso',
      data: {
        count: result.count,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar arquivo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
