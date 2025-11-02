'''
Business: API для аутентификации пользователей (админы и менеджеры)
Args: event с httpMethod, body с username и password
Returns: HTTP response с результатом аутентификации и ролью пользователя
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            password = body.get('password')
            
            cursor.execute('''
                SELECT id, username, role, is_active 
                FROM users 
                WHERE username = %s AND password_hash = %s AND is_active = true
            ''', (username, password))
            
            user = cursor.fetchone()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'role': user['role']
                        }
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'message': 'Неверный логин или пароль'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            cursor.execute('SELECT id, username, role, is_active, created_at FROM users ORDER BY id')
            users = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': users}, default=str),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
