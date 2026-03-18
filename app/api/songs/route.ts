import { NextResponse } from 'next/server';
import { prisma } from '@/shared/server/prisma';

type CreateSongBody = {
    name: string;
};

export async function POST(req: Request) {
    try {
        const body: CreateSongBody = await req.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { message: 'El nombre es obligatorio' },
                { status: 400 }
            );
        }

        const data = await prisma.song.create({
            data: {
                name: name.trim(),
            },
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating songs:', error);

        return NextResponse.json(
            { message: 'Error al guardar la canción' },
            { status: 500 }
        );
    }
}