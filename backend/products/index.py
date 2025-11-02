'''
Business: API для управления товарами и новостями
Args: event с httpMethod, body, queryStringParameters, path для /news или /pricelists
Returns: HTTP response с товарами/новостями или результатом операции
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        if '/news' in path:
            if method == 'GET':
                cursor.execute('SELECT * FROM news ORDER BY published_at DESC')
                news = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'news': news}, default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                
                cursor.execute('''
                    INSERT INTO news (title, content, image_url) 
                    VALUES (%s, %s, %s) 
                    RETURNING id
                ''', (
                    body['title'],
                    body['content'],
                    body.get('image_url', 'https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/de87fc6d-36e1-4cf1-b311-cb80aa891102.jpg')
                ))
                
                new_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'News created'}),
                    'isBase64Encoded': False
                }
        
        elif '/pricelists' in path:
            if method == 'GET':
                cursor.execute('SELECT * FROM price_lists ORDER BY created_at DESC')
                price_lists = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'price_lists': price_lists}, default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                
                cursor.execute('''
                    INSERT INTO price_lists (title, file_url) 
                    VALUES (%s, %s) 
                    RETURNING id
                ''', (body['title'], body['file_url']))
                
                new_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': new_id, 'message': 'Price list created'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            cursor.execute('''
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.is_available = true 
                ORDER BY p.id
            ''')
            products = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'products': products}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO products (category_id, name, description, price, capacity, specifications, image_url) 
                VALUES (%s, %s, %s, %s, %s, %s, %s) 
                RETURNING id
            ''', (
                body.get('category_id', 1),
                body['name'],
                body['description'],
                body['price'],
                body['capacity'],
                json.dumps(body.get('specifications', {})),
                body.get('image_url', 'https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/f3823cc6-8828-47c5-a632-815bebf2c15b.jpg')
            ))
            
            new_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': new_id, 'message': 'Product created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('id')
            
            cursor.execute('''
                UPDATE products 
                SET name = %s, description = %s, price = %s, capacity = %s, 
                    specifications = %s, is_available = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body['name'],
                body['description'],
                body['price'],
                body['capacity'],
                json.dumps(body.get('specifications', {})),
                body.get('is_available', True),
                product_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Product updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            product_id = params.get('id')
            
            cursor.execute('UPDATE products SET is_available = false WHERE id = %s', (product_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Product deleted'}),
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