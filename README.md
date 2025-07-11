# SelectFlow - Plataforma de Recrutamento com IA

Uma plataforma moderna de recrutamento que conecta empresas e candidatos através de tecnologia avançada e inteligência artificial.

## 🚀 Como executar o projeto

### Opção 1: Servidor de desenvolvimento automático
```bash
python start-dev.py
```

### Opção 2: Servidores separados

#### Backend (Flask)
```bash
cd backend
python run.py
```

#### Frontend (HTTP Server)
```bash
python -m http.server 8000
```

## 🌐 URLs de acesso

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5001

## 📋 Pré-requisitos

- Python 3.7 ou superior
- Navegador web moderno

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências do backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Execute o projeto:
   ```bash
   python start-dev.py
   ```

## 📋 Funcionalidades

### Para Empresas
- Dashboard com métricas de recrutamento
- Gerenciamento de vagas
- Análise de candidatos
- Sistema de entrevistas

### Para Candidatos
- Busca inteligente de vagas
- Perfil profissional completo
- Acompanhamento de candidaturas
- Matching automático

## 🛠️ Tecnologias

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Design responsivo
- Interface moderna e intuitiva

### Backend
- Python Flask
- SQLite Database
- RESTful API

## 👥 Usuários de teste

### Empresa
- **Email**: empresa@techcorp.com
- **Senha**: 123456

### Candidatos
- **Email**: joao@email.com | **Senha**: 123456
- **Email**: amanda@email.com | **Senha**: 123456
- **Email**: bruno@email.com | **Senha**: 123456
- **Email**: carla@email.com | **Senha**: 123456

## 📁 Estrutura do projeto

```
selectflow/
├── backend/           # Servidor Flask
│   ├── app/          # Aplicação principal
│   ├── database/     # Banco de dados
│   └── models.py     # Modelos de dados
├── js/               # JavaScript frontend
├── styles/           # Estilos CSS
├── public/           # Imagens e assets
└── index.html        # Página principal
```

## 🔧 Desenvolvimento

O projeto está configurado para desenvolvimento local. As alterações no frontend são refletidas imediatamente ao recarregar a página, e o backend pode ser reiniciado manualmente quando necessário.

### 🐛 Solução de problemas

- **Erro de porta ocupada**: Certifique-se de que as portas 8000 e 5001 estão livres
- **Erro de dependências**: Execute `pip install -r requirements.txt` no diretório backend
- **Banco de dados**: O banco SQLite é criado automaticamente na primeira execução

## 📝 Licença

Este projeto está sob a licença MIT.