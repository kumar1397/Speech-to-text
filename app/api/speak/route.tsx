
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import say from 'say';
const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    const { text } = await request.json();
    try {
        say.speak(text, 'Alex', 1.0, (err: any) => {
            if (err) {

                return NextResponse.json({ message: "Error", err }, { status: 500 });
            }
            return NextResponse.json({ message: 'Text spoken.', error: false });
        });
    } catch (err) {
        return NextResponse.json({ message: (err as Error).message, error: true });
    }
}
