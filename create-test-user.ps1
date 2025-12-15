# Test user registration
$registerBody = @{
    username = "testuser"
    email = "test@carwash.com"
    password = "Test1234!"
    firstName = "Test"
    lastName = "User"
    phone = "1234567890"
} | ConvertTo-Json

Write-Host "Creating test user..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing
    
    Write-Host "✅ User created successfully!" -ForegroundColor Green
    Write-Host "Email: test@carwash.com"
    Write-Host "Password: Test1234!"
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response.Content
} catch {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error: $responseBody"
    } else {
        Write-Host "Error: $($_.Exception.Message)"
    }
}
