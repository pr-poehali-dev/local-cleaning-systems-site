import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  product_id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  notes: string;
  created_at: string;
}

const API_BASE = 'https://functions.poehali.dev';
const ORDERS_URL = `${API_BASE}/b9233b21-85e2-4c8d-bd11-e8e053858836`;
const AUTH_URL = `${API_BASE}/f5c7d668-35a6-4985-bc60-47bcdb95d8f8`;

export default function Manager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const authData = localStorage.getItem('manager_auth');
    if (authData) {
      const { role } = JSON.parse(authData);
      if (role === 'manager') {
        setIsAuthenticated(true);
        fetchOrders();
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success && data.user.role === 'manager') {
        localStorage.setItem('manager_auth', JSON.stringify(data.user));
        setIsAuthenticated(true);
        fetchOrders();
        toast({ title: 'Добро пожаловать!' });
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверный логин или пароль',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось войти',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('manager_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(ORDERS_URL);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(ORDERS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });

      if (response.ok) {
        toast({ title: 'Статус обновлен!' });
        fetchOrders();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'new': 'default',
      'processing': 'secondary',
      'completed': 'outline',
      'cancelled': 'destructive'
    };
    const labels: Record<string, string> = {
      'new': 'Новый',
      'processing': 'В работе',
      'completed': 'Выполнен',
      'cancelled': 'Отменен'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Icon name="UserCog" size={64} className="mx-auto mb-4 text-primary" />
            <CardTitle className="text-3xl">Панель менеджера</CardTitle>
            <CardDescription>Войдите для доступа к заказам</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="manager"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="UserCog" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">Панель менеджера</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Icon name="Home" size={20} className="mr-2" />
              На главную
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShoppingBag" className="text-primary" />
              Заказы клиентов ({orders.length})
            </CardTitle>
            <CardDescription>Просмотр и обработка заказов</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Заказов пока нет</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">
                          {order.customer_phone}
                        </a>
                      </TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell className="font-semibold">
                        {order.total_price.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Icon name="Eye" size={16} className="mr-1" />
                              Детали
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Заказ #{order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Клиент</Label>
                                  <p className="font-medium">{order.customer_name}</p>
                                </div>
                                <div>
                                  <Label>Телефон</Label>
                                  <a href={`tel:${order.customer_phone}`} className="font-medium text-primary hover:underline">
                                    {order.customer_phone}
                                  </a>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  {order.customer_email ? (
                                    <a href={`mailto:${order.customer_email}`} className="font-medium text-primary hover:underline">
                                      {order.customer_email}
                                    </a>
                                  ) : (
                                    <p className="font-medium">—</p>
                                  )}
                                </div>
                                <div>
                                  <Label>Адрес</Label>
                                  <p className="font-medium">{order.customer_address || '—'}</p>
                                </div>
                                <div>
                                  <Label>Товар</Label>
                                  <p className="font-medium">{order.product_name}</p>
                                </div>
                                <div>
                                  <Label>Сумма</Label>
                                  <p className="font-medium text-lg text-primary">
                                    {order.total_price.toLocaleString('ru-RU')} ₽
                                  </p>
                                </div>
                              </div>
                              {order.notes && (
                                <div>
                                  <Label>Комментарий</Label>
                                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                                </div>
                              )}
                              <div>
                                <Label>Изменить статус</Label>
                                <Select
                                  defaultValue={order.status}
                                  onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">Новый</SelectItem>
                                    <SelectItem value="processing">В работе</SelectItem>
                                    <SelectItem value="completed">Выполнен</SelectItem>
                                    <SelectItem value="cancelled">Отменен</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
