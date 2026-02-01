@echo off
echo Starting JTR-AuditLab - Frontend Server
echo ============================================
cd /d "%~dp0frontend"
npm run dev
pause
