import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken || !session?.refreshToken) {
      return NextResponse.json({ error: "Não autorizado - faça login novamente" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Buscar arquivo de backup no Drive
    const response = await drive.files.list({
      q: "name='timeflow-backup.json' and trashed=false",
      spaces: "drive",
      fields: "files(id, name, modifiedTime)",
    });

    if (response.data.files && response.data.files.length > 0) {
      const fileId = response.data.files[0].id;
      
      if (!fileId) {
        return NextResponse.json({ data: null });
      }

      const fileResponse = await drive.files.get({
        fileId: fileId,
        alt: "media",
      });

      return NextResponse.json({
        data: fileResponse.data,
        fileId: fileId,
      });
    }

    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("Erro ao carregar do Drive:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken || !session?.refreshToken) {
      return NextResponse.json({ error: "Não autorizado - faça login novamente" }, { status: 401 });
    }

    // Receber dados do corpo da requisição
    const { activities, feedbacks } = await request.json();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const backupData = {
      activities: activities || [],
      feedbacks: feedbacks || [],
      timestamp: new Date().toISOString(),
      userId: session.user?.id,
    };

    const fileMetadata = {
      name: "timeflow-backup.json",
      parents: ["root"],
    };

    const media = {
      mimeType: "application/json",
      body: JSON.stringify(backupData, null, 2),
    };

    // Verificar se já existe um backup
    const existingFiles = await drive.files.list({
      q: "name='timeflow-backup.json' and trashed=false",
      spaces: "drive",
      fields: "files(id)",
    });

    let response;
    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      // Atualizar arquivo existente
      const fileId = existingFiles.data.files[0].id;
      
      if (!fileId) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }

      response = await drive.files.update({
        fileId: fileId,
        media: media,
        fields: "id",
      });
    } else {
      // Criar novo arquivo
      response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });
    }

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
    });
  } catch (error) {
    console.error("Erro ao salvar no Drive:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}