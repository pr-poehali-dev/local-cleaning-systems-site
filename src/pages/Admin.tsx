import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  image_url: string;
  specifications: any;
  is_available: boolean;
}

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

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
}

interface Manager {
  id: number;
  username: string;
  is_active: boolean;
  created_at: string;
}

const API_BASE = 'https://functions.poehali.dev';
const PRODUCTS_URL = `${API_BASE}/071283b3-f18e-4231-aeac-544b5bf2c57c`;
const ORDERS_URL = `${API_BASE}/b9233b21-85e2-4c8d-bd11-e8e053858836`;
const NEWS_URL = `${PRODUCTS_URL}/news`;
const AUTH_URL = `${API_BASE}/f5c7d668-35a6-4985-bc60-47bcdb95d8f8`;
const MANAGERS_URL = `${API_BASE}/fd857e4a-9b97-43a6-9413-86271e68aa34`;

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [isAddingManager, setIsAddingManager] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    capacity: '',
    image_url: '',
    specifications: {
      material: '',
      dimensions: '',
      weight: '',
      warranty: ''
    }
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    image_url: ''
  });

  const [managerForm, setManagerForm] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    const authData = localStorage.getItem('admin_auth');
    if (authData) {
      const { role } = JSON.parse(authData);
      if (role === 'admin') {
        setIsAuthenticated(true);
        fetchAllData();
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

      if (data.success && data.user.role === 'admin') {
        localStorage.setItem('admin_auth', JSON.stringify(data.user));
        setIsAuthenticated(true);
        fetchAllData();
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
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchAllData = () => {
    fetchProducts();
    fetchOrders();
    fetchNews();
    fetchManagers();
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_URL);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
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

  const fetchNews = async () => {
    try {
      const response = await fetch(NEWS_URL);
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch(MANAGERS_URL);
      const data = await response.json();
      setManagers(data.managers || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'news') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        if (type === 'product') {
          setProductForm({ ...productForm, image_url: imageUrl });
        } else {
          setNewsForm({ ...newsForm, image_url: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch(PRODUCTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          capacity: parseInt(productForm.capacity),
          image_url: productForm.image_url || 'https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/f3823cc6-8828-47c5-a632-815bebf2c15b.jpg',
          specifications: productForm.specifications
        })
      });

      if (response.ok) {
        toast({ title: 'Товар добавлен!' });
        setProductForm({
          name: '',
          description: '',
          price: '',
          capacity: '',
          image_url: '',
          specifications: { material: '', dimensions: '', weight: '', warranty: '' }
        });
        setIsAddingProduct(false);
        fetchProducts();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить товар', variant: 'destructive' });
    }
  };

  const handleAddNews = async () => {
    try {
      const response = await fetch(NEWS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newsForm.title,
          content: newsForm.content,
          image_url: newsForm.image_url || 'https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/de87fc6d-36e1-4cf1-b311-cb80aa891102.jpg'
        })
      });

      if (response.ok) {
        toast({ title: 'Новость добавлена!' });
        setNewsForm({ title: '', content: '', image_url: '' });
        setIsAddingNews(false);
        fetchNews();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить новость', variant: 'destructive' });
    }
  };

  const handleAddManager = async () => {
    try {
      const response = await fetch(MANAGERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(managerForm)
      });

      if (response.ok) {
        toast({ title: 'Менеджер добавлен!' });
        setManagerForm({ username: '', password: '' });
        setIsAddingManager(false);
        fetchManagers();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить менеджера', variant: 'destructive' });
    }
  };

  const handleDeleteManager = async (id: number) => {
    if (!confirm('Удалить менеджера?')) return;
    
    try {
      const response = await fetch(`${MANAGERS_URL}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Менеджер удален!' });
        fetchManagers();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить менеджера', variant: 'destructive' });
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
            <Icon name="Shield" size={64} className="mx-auto mb-4 text-primary" />
            <CardTitle className="text-3xl">Админ-панель</CardTitle>
            <CardDescription>Войдите для доступа к управлению</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="admin"
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
            <Icon name="Shield" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">Админ-панель</h1>
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
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="orders">Заказы ({orders.length})</TabsTrigger>
            <TabsTrigger value="products">Товары ({products.length})</TabsTrigger>
            <TabsTrigger value="news">Новости ({news.length})</TabsTrigger>
            <TabsTrigger value="managers">Менеджеры ({managers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ShoppingBag" className="text-primary" />
                  Управление заказами
                </CardTitle>
                <CardDescription>Просмотр и обработка заказов клиентов</CardDescription>
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
                          <TableCell>{order.customer_phone}</TableCell>
                          <TableCell>{order.product_name}</TableCell>
                          <TableCell className="font-semibold">
                            {order.total_price.toLocaleString('ru-RU')} ₽
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
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
                                      <p className="font-medium">{order.customer_phone}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="font-medium">{order.customer_email || '—'}</p>
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
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Package" className="text-primary" />
                    Управление товарами
                  </span>
                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="Plus" size={18} className="mr-2" />
                        Добавить товар
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Добавить новый товар</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Название *</Label>
                            <Input
                              id="name"
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="capacity">Производительность (л/сутки) *</Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={productForm.capacity}
                              onChange={(e) => setProductForm({ ...productForm, capacity: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Описание *</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Цена (₽) *</Label>
                          <Input
                            id="price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-image">Изображение товара</Label>
                          <Input
                            id="product-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'product')}
                          />
                          {productForm.image_url && (
                            <img src={productForm.image_url} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="material">Материал</Label>
                            <Input
                              id="material"
                              value={productForm.specifications.material}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specifications: { ...productForm.specifications, material: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dimensions">Размеры</Label>
                            <Input
                              id="dimensions"
                              value={productForm.specifications.dimensions}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specifications: { ...productForm.specifications, dimensions: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="weight">Вес</Label>
                            <Input
                              id="weight"
                              value={productForm.specifications.weight}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specifications: { ...productForm.specifications, weight: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="warranty">Гарантия</Label>
                            <Input
                              id="warranty"
                              value={productForm.specifications.warranty}
                              onChange={(e) => setProductForm({
                                ...productForm,
                                specifications: { ...productForm.specifications, warranty: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleAddProduct}>
                          Добавить товар
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>Добавление и редактирование каталога товаров</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Производительность</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">#{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.capacity} л/сутки</TableCell>
                        <TableCell className="font-semibold">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_available ? 'default' : 'secondary'}>
                            {product.is_available ? 'Доступен' : 'Недоступен'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Newspaper" className="text-primary" />
                    Управление новостями
                  </span>
                  <Dialog open={isAddingNews} onOpenChange={setIsAddingNews}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="Plus" size={18} className="mr-2" />
                        Добавить новость
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Добавить новость</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newsTitle">Заголовок *</Label>
                          <Input
                            id="newsTitle"
                            value={newsForm.title}
                            onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="newsContent">Содержание *</Label>
                          <Textarea
                            id="newsContent"
                            rows={6}
                            value={newsForm.content}
                            onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="news-image">Изображение новости</Label>
                          <Input
                            id="news-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'news')}
                          />
                          {newsForm.image_url && (
                            <img src={newsForm.image_url} alt="Preview" className="mt-2 h-32 w-full object-cover rounded" />
                          )}
                        </div>
                        <Button className="w-full" onClick={handleAddNews}>
                          Опубликовать
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>Публикация новостей и акций</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Заголовок</TableHead>
                      <TableHead>Дата публикации</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">#{item.id}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          {new Date(item.published_at).toLocaleDateString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Users" className="text-primary" />
                    Управление менеджерами
                  </span>
                  <Dialog open={isAddingManager} onOpenChange={setIsAddingManager}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="UserPlus" size={18} className="mr-2" />
                        Добавить менеджера
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить менеджера</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="manager-username">Логин *</Label>
                          <Input
                            id="manager-username"
                            value={managerForm.username}
                            onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="manager-password">Пароль *</Label>
                          <Input
                            id="manager-password"
                            type="password"
                            value={managerForm.password}
                            onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                          />
                        </div>
                        <Button className="w-full" onClick={handleAddManager}>
                          Создать менеджера
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>Управление доступами менеджеров</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell className="font-medium">#{manager.id}</TableCell>
                        <TableCell>{manager.username}</TableCell>
                        <TableCell>
                          <Badge variant={manager.is_active ? 'default' : 'secondary'}>
                            {manager.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(manager.created_at).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteManager(manager.id)}
                          >
                            <Icon name="Trash2" size={16} className="mr-1" />
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
