from flask import Blueprint, request, jsonify, session
import sqlite3
import hashlib
import json
from datetime import datetime
from models import get_db_connection

main = Blueprint('main', __name__)

def hash_senha(senha):
    """Hash password using SHA256"""
    return hashlib.sha256(senha.encode()).hexdigest()

def get_user_by_id(user_id):
    """Get user information by ID"""
    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, nome, email, tipo, avatar, created_at FROM usuarios WHERE id = ?",
        (user_id,)
    ).fetchone()
    conn.close()
    return dict(user) if user else None

# Authentication routes
@main.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType')
    
    if not email or not password:
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    hashed_password = hash_senha(password)
    
    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, nome, email, tipo, avatar FROM usuarios WHERE email = ? AND senha = ? AND tipo = ?",
        (email, hashed_password, user_type)
    ).fetchone()
    conn.close()
    
    if user:
        user_data = dict(user)
        session['user_id'] = user_data['id']
        session['user_type'] = user_data['tipo']
        
        return jsonify({
            'success': True,
            'user': {
                'id': user_data['id'],
                'name': user_data['nome'],
                'email': user_data['email'],
                'type': user_data['tipo'],
                'avatar': user_data['avatar'] or f"https://ui-avatars.com/api/?name={user_data['nome']}&background=7c3aed&color=fff"
            }
        })
    else:
        return jsonify({'error': 'Credenciais inválidas'}), 401

@main.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType')
    company_name = data.get('companyName')
    
    if not all([name, email, password, user_type]):
        return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
    
    hashed_password = hash_senha(password)
    avatar = f"https://ui-avatars.com/api/?name={name}&background=7c3aed&color=fff"
    
    conn = get_db_connection()
    
    try:
        # Check if email already exists
        existing_user = conn.execute("SELECT id FROM usuarios WHERE email = ?", (email,)).fetchone()
        if existing_user:
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Insert user
        cursor = conn.execute(
            "INSERT INTO usuarios (nome, email, senha, tipo, avatar) VALUES (?, ?, ?, ?, ?)",
            (name, email, hashed_password, user_type, avatar)
        )
        user_id = cursor.lastrowid
        
        # Create profile based on user type
        if user_type == 'company':
            conn.execute(
                "INSERT INTO company_profiles (user_id, company_name) VALUES (?, ?)",
                (user_id, company_name or name)
            )
        else:
            conn.execute(
                "INSERT INTO candidate_profiles (user_id, skills, experience, education, languages) VALUES (?, ?, ?, ?, ?)",
                (user_id, '[]', '[]', '[]', '[]')
            )
        
        conn.commit()
        
        session['user_id'] = user_id
        session['user_type'] = user_type
        
        return jsonify({
            'success': True,
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'type': user_type,
                'avatar': avatar
            }
        })
        
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email já cadastrado'}), 400
    finally:
        conn.close()

@main.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@main.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Não autenticado'}), 401
    
    user = get_user_by_id(session['user_id'])
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'id': user['id'],
        'name': user['nome'],
        'email': user['email'],
        'type': user['tipo'],
        'avatar': user['avatar'] or f"https://ui-avatars.com/api/?name={user['nome']}&background=7c3aed&color=fff",
        'createdAt': user['created_at']
    })

# Public routes for preview
@main.route('/api/public/jobs', methods=['GET'])
def get_public_jobs():
    """Get public jobs for preview"""
    conn = get_db_connection()
    
    jobs = conn.execute("""
        SELECT j.*, cp.company_name, COUNT(a.id) as applicants
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
        WHERE j.status = 'active'
        GROUP BY j.id
        ORDER BY j.created_at DESC
        LIMIT 10
    """).fetchall()
    
    conn.close()
    
    jobs_list = []
    for job in jobs:
        requirements = json.loads(job['requirements'] or '[]')
        tags = json.loads(job['tags'] or '[]')
        jobs_list.append({
            'id': job['id'],
            'title': job['title'],
            'description': job['description'],
            'company': job['company_name'],
            'location': job['location'],
            'workLocation': job['work_location'],
            'salary': job['salary'],
            'type': job['job_type'],
            'applicants': job['applicants'],
            'postedAt': job['created_at'],
            'requirements': requirements,
            'tags': tags
        })
    
    return jsonify(jobs_list)

@main.route('/api/public/stats', methods=['GET'])
def get_public_stats():
    """Get public statistics for preview"""
    conn = get_db_connection()
    
    total_jobs = conn.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'").fetchone()[0]
    total_companies = conn.execute("SELECT COUNT(*) FROM usuarios WHERE tipo = 'company'").fetchone()[0]
    total_candidates = conn.execute("SELECT COUNT(*) FROM usuarios WHERE tipo = 'candidate'").fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'totalJobs': total_jobs,
        'totalCompanies': total_companies,
        'totalCandidates': total_candidates
    })

# Dashboard routes
@main.route('/api/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    if 'user_id' not in session:
        return jsonify({'error': 'Não autenticado'}), 401
    
    conn = get_db_connection()
    
    if session['user_type'] == 'company':
        # Company metrics
        company_id = session['user_id']
        
        # Total candidates who applied to company jobs
        total_candidates = conn.execute("""
            SELECT COUNT(DISTINCT a.candidate_id) 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.company_id = ?
        """, (company_id,)).fetchone()[0]
        
        # Active jobs
        active_jobs = conn.execute(
            "SELECT COUNT(*) FROM jobs WHERE company_id = ? AND status = 'active'",
            (company_id,)
        ).fetchone()[0]
        
        # Candidates in review
        candidates_in_review = conn.execute("""
            SELECT COUNT(*) 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.company_id = ? AND a.status = 'under_review'
        """, (company_id,)).fetchone()[0]
        
        # Scheduled interviews
        scheduled_interviews = conn.execute("""
            SELECT COUNT(*) 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.company_id = ? AND a.current_stage IN ('interview', 'final_interview')
        """, (company_id,)).fetchone()[0]
        
        # Total applications
        total_applications = conn.execute("""
            SELECT COUNT(*) 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.company_id = ?
        """, (company_id,)).fetchone()[0]
        
        # Hired candidates
        hired_candidates = conn.execute("""
            SELECT COUNT(*) 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE j.company_id = ? AND a.current_stage = 'hired'
        """, (company_id,)).fetchone()[0]
        
    else:
        # Candidate metrics
        candidate_id = session['user_id']
        
        total_candidates = 1
        active_jobs = conn.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'").fetchone()[0]
        candidates_in_review = 0
        scheduled_interviews = conn.execute(
            "SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND current_stage IN ('interview', 'final_interview')",
            (candidate_id,)
        ).fetchone()[0]
        total_applications = conn.execute(
            "SELECT COUNT(*) FROM applications WHERE candidate_id = ?",
            (candidate_id,)
        ).fetchone()[0]
        hired_candidates = conn.execute(
            "SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND current_stage = 'hired'",
            (candidate_id,)
        ).fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'totalCandidates': total_candidates,
        'activeJobs': active_jobs,
        'candidatesInReview': candidates_in_review,
        'scheduledInterviews': scheduled_interviews,
        'totalApplications': total_applications,
        'hiredCandidates': hired_candidates
    })

# Candidates routes
@main.route('/api/candidates', methods=['GET'])
def get_candidates():
    if 'user_id' not in session or session['user_type'] != 'company':
        return jsonify({'error': 'Acesso negado'}), 403
    
    conn = get_db_connection()
    
    # Get candidates who applied to company jobs
    candidates = conn.execute("""
        SELECT DISTINCT 
            u.id, u.nome, u.email, u.avatar,
            cp.phone, cp.location, cp.skills,
            a.status, a.current_stage, a.submitted_at,
            j.title as position
        FROM usuarios u
        JOIN applications a ON u.id = a.candidate_id
        JOIN jobs j ON a.job_id = j.id
        LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
        WHERE j.company_id = ? AND u.tipo = 'candidate'
        ORDER BY a.submitted_at DESC
    """, (session['user_id'],)).fetchall()
    
    conn.close()
    
    candidates_list = []
    for candidate in candidates:
        skills = json.loads(candidate['skills'] or '[]')
        candidates_list.append({
            'id': candidate['id'],
            'name': candidate['nome'],
            'email': candidate['email'],
            'position': candidate['position'],
            'location': candidate['location'] or 'Não informado',
            'experience': '3 anos',  # This would come from experience data
            'skills': skills,
            'status': candidate['current_stage'],
            'appliedAt': candidate['submitted_at']
        })
    
    return jsonify(candidates_list)

# Jobs routes
@main.route('/api/jobs', methods=['GET'])
def get_jobs():
    if 'user_id' not in session:
        return jsonify({'error': 'Não autenticado'}), 401
    
    conn = get_db_connection()
    
    if session['user_type'] == 'company':
        # Company's jobs
        jobs = conn.execute("""
            SELECT j.*, COUNT(a.id) as applicants
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            WHERE j.company_id = ?
            GROUP BY j.id
            ORDER BY j.created_at DESC
        """, (session['user_id'],)).fetchall()
    else:
        # All active jobs for candidates
        jobs = conn.execute("""
            SELECT j.*, COUNT(a.id) as applicants, cp.company_name
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
            WHERE j.status = 'active'
            GROUP BY j.id
            ORDER BY j.created_at DESC
        """).fetchall()
    
    conn.close()
    
    jobs_list = []
    for job in jobs:
        requirements = json.loads(job['requirements'] or '[]')
        tags = json.loads(job['tags'] or '[]')
        jobs_list.append({
            'id': job['id'],
            'title': job['title'],
            'description': job['description'],
            'location': job['location'],
            'workLocation': job['work_location'],
            'salary': job['salary'],
            'type': job['job_type'],
            'status': job['status'],
            'applicants': job['applicants'],
            'postedAt': job['created_at'],
            'requirements': requirements,
            'tags': tags
        })
    
    return jsonify(jobs_list)

@main.route('/api/jobs', methods=['POST'])
def create_job():
    if 'user_id' not in session or session['user_type'] != 'company':
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    requirements = data.get('requirements', [])
    location = data.get('location')
    work_location = data.get('workLocation')
    salary = data.get('salary')
    job_type = data.get('type', 'full-time')
    tags = data.get('tags', [])
    
    if not all([title, description, location, work_location]):
        return jsonify({'error': 'Campos obrigatórios não preenchidos'}), 400
    
    conn = get_db_connection()
    cursor = conn.execute("""
        INSERT INTO jobs (company_id, title, description, requirements, location, work_location, salary, job_type, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (session['user_id'], title, description, json.dumps(requirements), location, work_location, salary, job_type, json.dumps(tags)))
    
    job_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'jobId': job_id})

# Profile routes
@main.route('/api/profile', methods=['GET'])
def get_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Não autenticado'}), 401
    
    conn = get_db_connection()
    user_id = session['user_id']
    user_type = session['user_type']
    
    if user_type == 'candidate':
        profile = conn.execute("""
            SELECT cp.*, u.nome, u.email
            FROM candidate_profiles cp
            JOIN usuarios u ON cp.user_id = u.id
            WHERE cp.user_id = ?
        """, (user_id,)).fetchone()
    else:
        profile = conn.execute("""
            SELECT cp.*, u.nome, u.email
            FROM company_profiles cp
            JOIN usuarios u ON cp.user_id = u.id
            WHERE cp.user_id = ?
        """, (user_id,)).fetchone()
    
    conn.close()
    
    if not profile:
        return jsonify({'error': 'Perfil não encontrado'}), 404
    
    profile_data = dict(profile)
    
    # Parse JSON fields for candidate
    if user_type == 'candidate':
        profile_data['skills'] = json.loads(profile_data.get('skills', '[]'))
        profile_data['experience'] = json.loads(profile_data.get('experience', '[]'))
        profile_data['education'] = json.loads(profile_data.get('education', '[]'))
        profile_data['languages'] = json.loads(profile_data.get('languages', '[]'))
    
    return jsonify(profile_data)

@main.route('/api/profile', methods=['PUT'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Não autenticado'}), 401
    
    data = request.get_json()
    user_id = session['user_id']
    user_type = session['user_type']
    
    conn = get_db_connection()
    
    try:
        if user_type == 'candidate':
            conn.execute("""
                UPDATE candidate_profiles 
                SET phone = ?, location = ?, skills = ?, experience = ?, education = ?, languages = ?
                WHERE user_id = ?
            """, (
                data.get('phone'),
                data.get('location'),
                json.dumps(data.get('skills', [])),
                json.dumps(data.get('experience', [])),
                json.dumps(data.get('education', [])),
                json.dumps(data.get('languages', [])),
                user_id
            ))
        else:
            conn.execute("""
                UPDATE company_profiles 
                SET company_name = ?, description = ?, industry = ?, size = ?, website = ?, location = ?
                WHERE user_id = ?
            """, (
                data.get('company_name'),
                data.get('description'),
                data.get('industry'),
                data.get('size'),
                data.get('website'),
                data.get('location'),
                user_id
            ))
        
        conn.commit()
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Applications routes
@main.route('/api/applications', methods=['POST'])
def apply_to_job():
    if 'user_id' not in session or session['user_type'] != 'candidate':
        return jsonify({'error': 'Acesso negado'}), 403
    
    data = request.get_json()
    job_id = data.get('jobId')
    
    if not job_id:
        return jsonify({'error': 'ID da vaga é obrigatório'}), 400
    
    conn = get_db_connection()
    
    try:
        # Check if already applied
        existing = conn.execute(
            "SELECT id FROM applications WHERE candidate_id = ? AND job_id = ?",
            (session['user_id'], job_id)
        ).fetchone()
        
        if existing:
            return jsonify({'error': 'Você já se candidatou a esta vaga'}), 400
        
        # Create application
        conn.execute("""
            INSERT INTO applications (candidate_id, job_id, status, current_stage)
            VALUES (?, ?, 'pending', 'resume_analysis')
        """, (session['user_id'], job_id))
        
        conn.commit()
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Tags routes
@main.route('/api/tags', methods=['GET'])
def get_tags():
    """Get available tags"""
    tags = [
        # Tecnologia
        'desenvolvedor', 'backend', 'frontend', 'fullstack', 'mobile', 'devops',
        'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue.js',
        'php', 'c#', 'ruby', 'go', 'rust', 'typescript', 'sql', 'nosql',
        'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
        
        # Níveis
        'estágio', 'junior', 'pleno', 'senior', 'especialista', 'lead', 'arquiteto',
        
        # Áreas
        'medicina', 'enfermagem', 'fisioterapia', 'psicologia', 'odontologia',
        'engenharia', 'civil', 'mecânica', 'elétrica', 'química', 'ambiental',
        'marketing', 'vendas', 'comercial', 'atendimento', 'suporte',
        'recursos humanos', 'rh', 'financeiro', 'contabilidade', 'auditoria',
        'design', 'ux', 'ui', 'gráfico', 'produto', 'arquitetura',
        'educação', 'professor', 'coordenador', 'diretor',
        'logística', 'operações', 'produção', 'qualidade',
        'jurídico', 'advocacia', 'compliance', 'contratos',
        
        # Modalidades
        'remoto', 'presencial', 'híbrido', 'home office',
        'tempo integral', 'meio período', 'freelancer', 'consultoria',
        'temporário', 'efetivo', 'terceirizado', 'pj', 'clt'
    ]
    
    return jsonify(sorted(tags))

# Error handlers
@main.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@main.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500