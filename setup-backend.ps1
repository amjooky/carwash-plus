# CarWash+ Backend Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CarWash+ Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Close this PowerShell window completely" -ForegroundColor Yellow
    Write-Host "2. Open a NEW PowerShell window" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If Node.js is still not found:" -ForegroundColor Yellow
    Write-Host "- Restart your computer" -ForegroundColor Yellow
    Write-Host "- Or reinstall Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is NOT found!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All prerequisites are ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask to continue
$continue = Read-Host "Do you want to continue with backend setup? (Y/N)"
if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ npm install failed!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 2: Creating .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host ".env already exists, skipping..." -ForegroundColor Yellow
} else {
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You need to edit .env file with your database settings!" -ForegroundColor Yellow
    Write-Host "Opening .env in notepad..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    notepad .env
    Write-Host ""
    $dbReady = Read-Host "Have you updated the DATABASE_URL in .env? (Y/N)"
    if ($dbReady -ne "Y" -and $dbReady -ne "y") {
        Write-Host "Please update .env file and run this script again." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "Step 3: Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

Write-Host ""
Write-Host "Step 4: Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate

Write-Host ""
Write-Host "Step 5: Seeding database..." -ForegroundColor Yellow
npm run prisma:seed

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backend Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the backend, run:" -ForegroundColor Cyan
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "Backend will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host "  http://localhost:3000/api/docs (Swagger)" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Do you want to start the backend now? (Y/N)"
if ($startNow -eq "Y" -or $startNow -eq "y") {
    Write-Host ""
    Write-Host "Starting backend..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run start:dev
}
