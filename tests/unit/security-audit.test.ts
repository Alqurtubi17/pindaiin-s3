import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Privacy Compliance Audit (AGENTS.md)', () => {
  it('memastikan file .gitignore melindungi file .env dari commit ke repositori', () => {
    const gitignorePath = path.resolve(__dirname, '../../.gitignore');
    const content = fs.readFileSync(gitignorePath, 'utf-8');

    expect(content).toContain('.env');
    expect(content).toContain('!.env.example');
  });

  it('memastikan .env.example tidak memuat credential rahasia asli', () => {
    const envExamplePath = path.resolve(__dirname, '../../.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf-8');

    expect(content).not.toContain('sbp_');
    expect(content).not.toContain('secret_');
    expect(content).toContain('DATABASE_URL');
  });

  it('memastikan manifest.json PWA terdefinisi dengan tema dan orientasi yang tepat', () => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.short_name).toBe('Pindaiin');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#0284c7');
  });

  it('memastikan service worker sw.js terpasang untuk keandalan offline rural', () => {
    const swPath = path.resolve(__dirname, '../../public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);
  });

  it('memastikan halaman login publik merchant tidak mengekspos tautan portal internal admin (security.md)', () => {
    const loginPagePath = path.resolve(__dirname, '../../src/app/(auth)/login/page.tsx');
    const content = fs.readFileSync(loginPagePath, 'utf-8');

    expect(content).not.toContain('/admin-login');
    expect(content).not.toContain('Portal Admin');
  });
});

