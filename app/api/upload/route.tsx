import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  if (!req.body) {
    return NextResponse.json({ message: "No body found in the request" }, { status: 400 });
  }

  try {
    // Create a reader from the request body
    const reader = req.body.getReader();
    const chunks: Buffer[] = [];
    const contentType = req.headers.get('content-type') || '';
    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    const boundary = boundaryMatch ? boundaryMatch[1] : '';

    // Read chunks from the reader
    let result = await reader.read();
    while (!result.done) {
      chunks.push(Buffer.from(result.value)); // Convert Uint8Array to Buffer
      result = await reader.read();
    }

    if (chunks.length === 0) {
      throw new Error('No data received in the request body');
    }

    const buffer = Buffer.concat(chunks);

    // Find the boundary in the buffer
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const boundaryIndex = buffer.indexOf(boundaryBuffer);

    if (boundaryIndex === -1) {
      throw new Error('Boundary not found in buffer');
    }

    // Split the buffer into parts
    const parts = buffer.toString().split(boundaryBuffer.toString());

    // Extract transcript
    const transcriptPart = parts.find(part => part.includes('name="transcript"'));
    const transcript = transcriptPart?.split('\r\n\r\n')[1]?.split('\r\n')[0] || '';

    // Extract audio
    const audioPart = parts.find(part => part.includes('name="audio"'));
    const audioBuffer = audioPart
      ? Buffer.from(audioPart.slice(audioPart.indexOf('\r\n\r\n') + 4, audioPart.lastIndexOf('\r\n--')))
      : Buffer.alloc(0);

    // Save audio file
    const audioFilename = `${uuidv4()}.wav`;
    const audioPath = path.join(process.cwd(), 'public', 'audio', audioFilename);
    fs.mkdirSync(path.dirname(audioPath), { recursive: true });
    fs.writeFileSync(audioPath, audioBuffer);

    const audioUrl = `/audio/${audioFilename}`;

    // Save recording to database
    const savedRecording = await prisma.audioRecording.create({
      data: {
        transcript,
        audioUrl,
      },
    });

    return NextResponse.json({ message: "Success", data: savedRecording }, { status: 201 });
  } catch (err) {
    console.error('Error:', err); // Log the error for debugging
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
};
