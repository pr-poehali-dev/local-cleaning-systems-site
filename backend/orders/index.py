'''
Business: API для управления заказами локальных очистных сооружений
Args: event с httpMethod, body для создания/обновления заказов
Returns: HTTP response со списком заказов или результатом операции
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        if method == 'GET':
            cursor.execute('''
                SELECT o.*, p.name as product_name 
                FROM orders o 
                LEFT JOIN products p ON o.product_id = p.id 
                ORDER BY o.created_at DESC
            ''')
            orders = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'orders': orders}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO orders 
                (customer_name, customer_phone, customer_email, customer_address, 
                 product_id, quantity, total_price, notes) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
                RETURNING id
            ''', (
                body['customer_name'],
                body['customer_phone'],
                body.get('customer_email', ''),
                body.get('customer_address', ''),
                body['product_id'],
                body.get('quantity', 1),
                body['total_price'],
                body.get('notes', '')
            ))
            
            new_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': new_id, 'message': 'Order created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            order_id = body.get('id')
            status = body.get('status')
            
            cursor.execute('''
                UPDATE orders SET status = %s WHERE id = %s
            ''', (status, order_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Order updated'}),
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
