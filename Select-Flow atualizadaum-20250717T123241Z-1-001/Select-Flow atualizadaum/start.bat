@echo off
REM Script para rodar backend e frontend juntos

REM Inicia o backend em um terminal separado
start "Backend" cmd /k "cd /d %~dp0select_flow\backend && C:\Users\usrlabecon\AppData\Local\Programs\Python\Python313\python.exe run.py"

REM Inicia o servidor HTTP local para o frontend em outro terminal
start "Frontend" cmd /k "cd /d %~dp0select_flow && C:\Users\usrlabecon\AppData\Local\Programs\Python\Python313\python.exe -m http.server 8080"

REM Aguarda alguns segundos para o servidor subir
timeout /t 3 >nul

REM Abre o navegador na URL correta
start http://localhost:8080/index.html

REM Mensagem de status
ECHO Backend rodando em http://localhost:5000
ECHO Frontend rodando em http://localhost:8080/index.html
PAUSE
