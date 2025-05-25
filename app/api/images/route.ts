import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación mediante Authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'No autorizado - Token requerido' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se ha proporcionado ninguna imagen' },
        { status: 400 }
      );
    }

    // Validaciones básicas en el frontend
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'La imagen no puede ser mayor a 50MB' },
        { status: 400 }
      );
    }

    // Crear FormData para enviar al backend
    const backendFormData = new FormData();
    backendFormData.append('image', file);

    // Enviar al backend usando el mismo token de autorización
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/links/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
      },
      body: backendFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.message || 'Error al subir la imagen' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.data.url,
      data: result.data
    });

  } catch (error) {
    console.error('Error en upload de imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Nombre de archivo requerido' },
        { status: 400 }
      );
    }

    // Aquí podrías implementar la lógica para eliminar la imagen del storage
    // Por ahora solo retornamos success
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
}