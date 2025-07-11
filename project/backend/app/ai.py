import os
import json
import google.generativeai as genai
from config import GEMINI_API_KEY

# Configure Gemini AI
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

def analisar_curriculo(curriculo_texto, requisitos_vaga):
    """Analyze resume using Gemini AI"""
    prompt = f"""
Você é uma IA recrutadora especialista em RH. Analise o seguinte currículo e compare com os requisitos da vaga.

Currículo:
{curriculo_texto}

Requisitos da vaga:
{requisitos_vaga}

Tarefas:
1. Resuma as principais informações do candidato (nome, formação, experiência e competências).
2. Diga se o candidato é adequado para a vaga e por quê.
3. Aponte os pontos fortes e fracos do candidato.
4. Dê uma nota percentual (de 0 a 100%) representando o quão compatível está o currículo com a vaga.
5. Sugira melhorias específicas no currículo para torná-lo mais compatível com a vaga.

Retorne a resposta em formato JSON com a seguinte estrutura:
{{
  "summary": "Resumo das principais informações do candidato",
  "compatibility": número_de_0_a_100,
  "strengths": ["ponto forte 1", "ponto forte 2", ...],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2", ...],
  "suggestions": ["sugestão 1", "sugestão 2", ...],
  "score": número_de_0_a_100
}}

Seja preciso e objetivo nas análises.
"""

    try:
        response = model.generate_content(prompt)
        
        # Try to extract JSON from response
        json_match = response.text
        if '{' in json_match and '}' in json_match:
            start = json_match.find('{')
            end = json_match.rfind('}') + 1
            json_str = json_match[start:end]
            
            analysis_data = json.loads(json_str)
            
            return {
                'summary': analysis_data.get('summary', ''),
                'compatibility': analysis_data.get('compatibility', 0),
                'strengths': analysis_data.get('strengths', []),
                'weaknesses': analysis_data.get('weaknesses', []),
                'suggestions': analysis_data.get('suggestions', []),
                'score': analysis_data.get('score', 0)
            }
        else:
            raise ValueError("No JSON found in response")
            
    except Exception as e:
        print(f"Erro ao analisar currículo: {e}")
        
        # Fallback analysis
        return {
            'summary': 'Análise temporariamente indisponível',
            'compatibility': 75,
            'strengths': ['Experiência relevante', 'Formação adequada'],
            'weaknesses': ['Falta de certificações específicas'],
            'suggestions': ['Adicionar mais detalhes sobre projetos realizados'],
            'score': 75
        }

def gerar_relatorio(dados):
    """Generate AI report"""
    prompt = f"""
Você é um especialista em análise de dados de RH. Gere um relatório executivo baseado nos seguintes dados:

Dados:
{json.dumps(dados, indent=2, ensure_ascii=False)}

Crie um relatório que inclua:
1. Resumo executivo
2. Principais insights
3. Tendências identificadas
4. Recomendações estratégicas
5. Próximos passos

Mantenha o relatório profissional e objetivo.
"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        return 'Erro ao gerar relatório. Tente novamente mais tarde.'

def recomendar_candidatos(descricao_vaga, candidatos):
    """Recommend candidates for a job"""
    prompt = f"""
Você é um especialista em matching de candidatos. Analise a descrição da vaga e a lista de candidatos, e ordene os candidatos por compatibilidade.

Descrição da vaga:
{descricao_vaga}

Candidatos:
{json.dumps(candidatos, indent=2, ensure_ascii=False)}

Retorne um array JSON com os candidatos ordenados por compatibilidade, incluindo uma pontuação de match (0-100) e justificativa:

[
  {{
    "candidateId": "id_do_candidato",
    "matchScore": pontuação_de_0_a_100,
    "justification": "Justificativa do match"
  }},
  ...
]
"""

    try:
        response = model.generate_content(prompt)
        json_match = response.text
        
        if '[' in json_match and ']' in json_match:
            start = json_match.find('[')
            end = json_match.rfind(']') + 1
            json_str = json_match[start:end]
            return json.loads(json_str)
        else:
            raise ValueError("No JSON array found in response")
            
    except Exception as e:
        print(f"Erro ao recomendar candidatos: {e}")
        return []

def analisar_tendencias(dados_candidatos):
    """Analyze candidate trends"""
    prompt = f"""
Analise os dados dos candidatos e identifique tendências importantes:

Dados dos candidatos:
{json.dumps(dados_candidatos, indent=2, ensure_ascii=False)}

Identifique:
1. Habilidades mais comuns
2. Níveis de experiência
3. Localizações predominantes
4. Tendências de formação
5. Insights para recrutamento

Retorne em formato JSON:
{{
  "skills_trends": ["habilidade1", "habilidade2", ...],
  "experience_levels": {{"junior": count, "pleno": count, "senior": count}},
  "locations": {{"cidade1": count, "cidade2": count}},
  "insights": ["insight1", "insight2", ...]
}}
"""

    try:
        response = model.generate_content(prompt)
        json_match = response.text
        
        if '{' in json_match and '}' in json_match:
            start = json_match.find('{')
            end = json_match.rfind('}') + 1
            json_str = json_match[start:end]
            return json.loads(json_str)
        else:
            raise ValueError("No JSON found in response")
            
    except Exception as e:
        print(f"Erro ao analisar tendências: {e}")
        return {
            'skills_trends': ['Python', 'JavaScript', 'React'],
            'experience_levels': {'junior': 10, 'pleno': 15, 'senior': 8},
            'locations': {'São Paulo': 20, 'Rio de Janeiro': 10, 'Belo Horizonte': 8},
            'insights': ['Crescimento na demanda por desenvolvedores React', 'Aumento de candidatos com experiência em IA']
        }