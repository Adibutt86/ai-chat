import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'chatbox-ai-widget.php');
    const phpContent = fs.readFileSync(filePath, 'utf-8');

    const zip = new JSZip();
    // WordPress plugins expect a folder containing the main plugin file inside the .zip
    const pluginFolder = zip.folder('chatbox-ai-widget');
    pluginFolder?.file('chatbox-ai-widget.php', phpContent);

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="chatbox-ai-widget.zip"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Plugin ZIP generation failed' }, { status: 500 });
  }
}
