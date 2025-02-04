import { NextResponse } from 'next/server';
import prisma from '@/lib/database/prisma';
import { textToSpeech } from '@/lib/text-to-speech';

// ====== FORÇAR ROTA 100% DINÂMICA ======
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Validar ID
    if (!context.params?.id) {
      return NextResponse.json(
        { error: 'ID do exercício não fornecido' },
        { status: 400 }
      );
    }

    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // Buscar o exercício
    const exercise = await prisma.exercise.findUnique({
      where: { 
        id: context.params.id 
      },
      select: {
        content: true,
        language: {
          select: { 
            code: true 
          }
        }
      }
    });

    if (!exercise?.content) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      );
    }

    // Gerar o áudio
    const audioBuffer = await textToSpeech(exercise.content, lang);

    // Headers para streaming e cache
    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
      'Content-Length': audioBuffer.length.toString(),
      'Accept-Ranges': 'bytes'
    });

    // Suporte a streaming de áudio
    const range = request.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : audioBuffer.length - 1;
      const chunkSize = end - start + 1;

      headers.set('Content-Range', `bytes ${start}-${end}/${audioBuffer.length}`);
      headers.set('Content-Length', chunkSize.toString());

      return new NextResponse(audioBuffer.slice(start, end + 1), {
        status: 206,
        headers
      });
    }

    // Resposta completa se não houver range
    return new NextResponse(audioBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Erro ao gerar áudio:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao gerar áudio',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
