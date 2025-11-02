import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с товарами (получение списка, добавление, редактирование)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT id, name, description, price, capacity, image_url, 
                       specifications, is_available, created_at 
                FROM products 
                WHERE is_available = true 
                ORDER BY capacity ASC
            """)
            rows = cur.fetchall()
            products = []
            for row in rows:
                products.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'price': float(row[3]),
                    'capacity': row[4],
                    'image_url': row[5],
                    'specifications': row[6],
                    'is_available': row[7],
                    'created_at': row[8].isoformat() if row[8] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'products': products})
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO products (name, description, price, capacity, image_url, specifications)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                body_data.get('name'),
                body_data.get('description'),
                body_data.get('price'),
                body_data.get('capacity'),
                body_data.get('image_url', '/placeholder.svg'),
                json.dumps(body_data.get('specifications', {}))
            ))
            
            product_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'id': product_id, 'message': 'Product created'})
            }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            cur.execute("""
                UPDATE products 
                SET name = %s, description = %s, price = %s, capacity = %s,
                    image_url = %s, specifications = %s, is_available = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                body_data.get('name'),
                body_data.get('description'),
                body_data.get('price'),
                body_data.get('capacity'),
                body_data.get('image_url'),
                json.dumps(body_data.get('specifications', {})),
                body_data.get('is_available', True),
                product_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Product updated'})
            }
        
        if method == 'DELETE':
            params = event.get('queryStringParameters', {})
            product_id = params.get('id')
            
            cur.execute("UPDATE products SET is_available = false WHERE id = %s", (product_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Product deleted'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
