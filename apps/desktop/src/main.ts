import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(process.env.WEB_APP_URL ?? 'http://localhost:3000');
}

ipcMain.handle('cli:run', async (_event, command: string, args: string[]) => {
  return new Promise<{ stdout: string[]; stderr: string[]; exitCode: number | null }>((resolve) => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk.toString('utf8')));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk.toString('utf8')));
    child.on('close', (exitCode) => resolve({ stdout, stderr, exitCode }));
  });
});

ipcMain.handle('fs:read', async (_event, path: string) => {
  const content = await readFile(path, 'utf8');
  return { path, content };
});

app.whenReady().then(createWindow);
