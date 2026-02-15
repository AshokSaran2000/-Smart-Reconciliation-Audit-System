powershell -Command "
`$email = 'autocreate$([System.DateTime]::Now.Ticks)@test.com'
`$password = 'TestPass123'
`$body = @{email=`$email; password=`$password} | ConvertTo-Json

Write-Host 'Testing auto-create login with email:' `$email
Write-Host 'Testing auto-create login with password:' `$password
Write-Host 'Request body:' `$body
Write-Host ''

`$response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body `$body -ErrorAction SilentlyContinue

Write-Host 'Response status:' `$response.StatusCode
Write-Host 'Response body:' (`$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3)
" | powershell
