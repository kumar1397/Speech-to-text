import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveRecording = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const boundary = buffer.slice(0, buffer.indexOf('\r\n')).toString();

      const parts = buffer.toString().split(boundary);
      const transcriptPart = parts.find(part => part.includes('Content-Disposition: form-data; name="transcript"'));
      const transcript = transcriptPart?.split('\r\n\r\n')[1].split('\r\n')[0];

      const audioPart = parts.find(part => part.includes('Content-Disposition: form-data; name="audio"'));
      const audioBuffer = audioPart
        ? Buffer.from(audioPart.slice(audioPart.indexOf('\r\n\r\n') + 4, audioPart.length - 4))
        : Buffer.alloc(0);

      const audioFilename = `${uuidv4()}.wav`;
      const audioPath = path.join(process.cwd(), 'public', 'audio', audioFilename);

      fs.writeFileSync(audioPath, audioBuffer);

      const audioUrl = `/audio/${audioFilename}`;

      const savedRecording = await prisma.audioRecording.create({
        data: {
          transcript: transcript || '',
          audioUrl,
        },
      });

      res.status(200).json({ success: true, data: savedRecording });
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default saveRecording;
