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

const API_BASE = 'https://functions.poehali.dev';
const PRODUCTS_URL = `${API_BASE}/071283b3-f18e-4231-aeac-544b5bf2c57c`;
const ORDERS_URL = `${API_BASE}/b9233b21-85e2-4c8d-bd11-e8e053858836`;
const NEWS_URL = `${API_BASE}/513d5046-e85b-4c64-8dcf-926a37b1a3bf`;

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingNews, setIsAddingNews] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    capacity: '',
    specifications: {
      material: '',
      dimensions: '',
      weight: '',
      warranty: ''
    }
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchNews();
  }, []);

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
        body: JSON.stringify(newsForm)
      });

      if (response.ok) {
        toast({ title: 'Новость добавлена!' });
        setNewsForm({ title: '', content: '' });
        setIsAddingNews(false);
        fetchNews();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить новость', variant: 'destructive' });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">Админ-панель</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Icon name="Home" size={20} className="mr-2" />
            На главную
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="orders">Заказы ({orders.length})</TabsTrigger>
            <TabsTrigger value="products">Товары ({products.length})</TabsTrigger>
            <TabsTrigger value="news">Новости ({news.length})</TabsTrigger>
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
                    <DialogContent className="max-w-2xl">
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
        </Tabs>
      </main>
    </div>
  );
}
