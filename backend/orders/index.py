import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с заказами (создание, получение списка, обновление статуса)
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
                SELECT o.id, o.customer_name, o.customer_phone, o.customer_email,
                       o.customer_address, o.product_id, o.quantity, o.total_price,
                       o.status, o.notes, o.created_at, p.name as product_name
                FROM orders o
                LEFT JOIN products p ON o.product_id = p.id
                ORDER BY o.created_at DESC
            """)
            rows = cur.fetchall()
            orders = []
            for row in rows:
                orders.append({
                    'id': row[0],
                    'customer_name': row[1],
                    'customer_phone': row[2],
                    'customer_email': row[3],
                    'customer_address': row[4],
                    'product_id': row[5],
                    'quantity': row[6],
                    'total_price': float(row[7]),
                    'status': row[8],
                    'notes': row[9],
                    'created_at': row[10].isoformat() if row[10] else None,
                    'product_name': row[11]
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'orders': orders})
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO orders (customer_name, customer_phone, customer_email,
                                  customer_address, product_id, quantity, total_price, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                body_data.get('customer_name'),
                body_data.get('customer_phone'),
                body_data.get('customer_email'),
                body_data.get('customer_address'),
                body_data.get('product_id'),
                body_data.get('quantity', 1),
                body_data.get('total_price'),
                body_data.get('notes', '')
            ))
            
            order_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'id': order_id, 'message': 'Order created'})
            }
        
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('id')
            
            cur.execute("""
                UPDATE orders 
                SET status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (body_data.get('status'), order_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'message': 'Order updated'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
