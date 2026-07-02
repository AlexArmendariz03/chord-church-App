import { NextResponse } from 'next/server';
import { prisma } from '@/shared/server/prisma';
import bcrypt from 'bcryptjs';


export async function POST(request: Request) {
  try {
    const { username, password, role } = (await request.json()) as {
      username?: string;
      password?: string;
      role?: "leader" | "musico";
    };

    if (!username || !password) {
      return NextResponse.json(
          { message: 'Faltan campos obligatorios' },
          { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
          { message: 'El usuario ya existe' },
          { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role === "leader" ? "leader" : "musico",
      },
    });

    return NextResponse.json(
        {
          message: 'Usuario creado correctamente',
          user: {
            id: user.id,
            username: user.username,
          },
        },
        { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);

    return NextResponse.json(
        { message: 'Error del servidor' },
        { status: 500 }
    );
  }
}