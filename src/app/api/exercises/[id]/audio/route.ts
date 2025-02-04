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
  { params }: { params: { id: string } }
) {
  try {
    // Buscar o exercício
    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: {
        language: true
      }
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    const lang = exercise.language.code.toLowerCase() as "en" | "es" | "fr" | "de" | "it" | "pt";
    const audioBuffer = await textToSpeech(exercise.content, lang);
    const uint8Array = new Uint8Array(audioBuffer);

    const rangeHeader = request.headers.get('range');
    const headers = new Headers();
    headers.set('Content-Type', 'audio/mpeg');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', uint8Array.byteLength.toString());

    if (!rangeHeader) {
      return new NextResponse(uint8Array, {
        status: 200,
        headers
      });
    }

    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : uint8Array.byteLength - 1;
    const chunksize = end - start + 1;

    headers.set('Content-Range', `bytes ${start}-${end}/${uint8Array.byteLength}`);
    headers.set('Content-Length', chunksize.toString());

    const chunk = uint8Array.slice(start, end + 1);
    return new NextResponse(chunk, {
      status: 206,
      headers
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
