import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  image_url: string;
  specifications: {
    material?: string;
    dimensions?: string;
    weight?: string;
    warranty?: string;
  };
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

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('catalog');
  
  const [people, setPeople] = useState(4);
  const [calculatedProduct, setCalculatedProduct] = useState<Product | null>(null);
  
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
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

  const fetchNews = async () => {
    try {
      const response = await fetch(NEWS_URL);
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const calculateCapacity = () => {
    const dailyConsumption = people * 200;
    const recommended = products.find(p => p.capacity >= dailyConsumption);
    setCalculatedProduct(recommended || products[products.length - 1]);
  };

  const handleOrder = async (product: Product) => {
    if (!orderForm.customer_name || !orderForm.customer_phone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните имя и телефон',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          product_id: product.id,
          quantity: 1,
          total_price: product.price
        })
      });

      if (response.ok) {
        toast({
          title: 'Заказ отправлен!',
          description: 'Мы свяжемся с вами в ближайшее время'
        });
        setOrderForm({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          customer_address: '',
          notes: ''
        });
        setSelectedProduct(null);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заказ',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Droplets" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">ЭкоВода</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <button onClick={() => setActiveTab('catalog')} className="text-sm font-medium hover:text-primary transition-colors">
              Каталог
            </button>
            <button onClick={() => setActiveTab('about')} className="text-sm font-medium hover:text-primary transition-colors">
              О компании
            </button>
            <button onClick={() => setActiveTab('installation')} className="text-sm font-medium hover:text-primary transition-colors">
              Установка
            </button>
            <button onClick={() => setActiveTab('calculator')} className="text-sm font-medium hover:text-primary transition-colors">
              Калькулятор
            </button>
            <button onClick={() => setActiveTab('news')} className="text-sm font-medium hover:text-primary transition-colors">
              Новости
            </button>
            <button onClick={() => setActiveTab('contacts')} className="text-sm font-medium hover:text-primary transition-colors">
              Контакты
            </button>
          </nav>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <section className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 text-white p-12">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl font-bold mb-4 animate-fade-in">
              Инновационные системы очистки воды
            </h2>
            <p className="text-xl mb-6 text-white/90 animate-fade-in">
              Локальные очистные сооружения для вашего дома с гарантией качества
            </p>
            <Button size="lg" variant="secondary" onClick={() => setActiveTab('catalog')} className="animate-scale-in">
              Подобрать систему
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
            <img 
              src="https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/de87fc6d-36e1-4cf1-b311-cb80aa891102.jpg" 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="about">О компании</TabsTrigger>
            <TabsTrigger value="installation">Установка</TabsTrigger>
            <TabsTrigger value="calculator">Калькулятор</TabsTrigger>
            <TabsTrigger value="news">Новости</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Каталог оборудования</h2>
              <p className="text-muted-foreground">Выберите оптимальное решение для вашего дома</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale">
                  <div className="h-48 overflow-hidden bg-muted">
                    <img 
                      src="https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/f3823cc6-8828-47c5-a632-815bebf2c15b.jpg" 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {product.name}
                      <Icon name="Droplet" size={24} className="text-primary" />
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Производительность:</span>
                        <span className="font-medium">{product.capacity} л/сутки</span>
                      </div>
                      {product.specifications.material && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Материал:</span>
                          <span className="font-medium">{product.specifications.material}</span>
                        </div>
                      )}
                      {product.specifications.warranty && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Гарантия:</span>
                          <span className="font-medium">{product.specifications.warranty}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-2xl font-bold text-primary mb-3">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" onClick={() => setSelectedProduct(product)}>
                            Заказать
                            <Icon name="ShoppingCart" size={18} className="ml-2" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Оформление заказа: {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Имя *</Label>
                              <Input 
                                id="name" 
                                value={orderForm.customer_name}
                                onChange={(e) => setOrderForm({...orderForm, customer_name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Телефон *</Label>
                              <Input 
                                id="phone" 
                                value={orderForm.customer_phone}
                                onChange={(e) => setOrderForm({...orderForm, customer_phone: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                type="email"
                                value={orderForm.customer_email}
                                onChange={(e) => setOrderForm({...orderForm, customer_email: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="address">Адрес установки</Label>
                              <Input 
                                id="address"
                                value={orderForm.customer_address}
                                onChange={(e) => setOrderForm({...orderForm, customer_address: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="notes">Комментарий</Label>
                              <Textarea 
                                id="notes"
                                value={orderForm.notes}
                                onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                              />
                            </div>
                            <Button className="w-full" onClick={() => selectedProduct && handleOrder(selectedProduct)}>
                              Отправить заказ
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">О компании ЭкоВода</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <p>
                  Мы специализируемся на проектировании, производстве и установке локальных очистных сооружений 
                  для загородных домов и коттеджных поселков. Более 10 лет опыта работы на рынке.
                </p>
                <div className="grid md:grid-cols-3 gap-6 py-6">
                  <div className="text-center p-6 bg-muted rounded-xl">
                    <Icon name="Award" size={48} className="mx-auto mb-4 text-primary" />
                    <h3 className="text-4xl font-bold mb-2">1000+</h3>
                    <p className="text-muted-foreground">Установленных систем</p>
                  </div>
                  <div className="text-center p-6 bg-muted rounded-xl">
                    <Icon name="Users" size={48} className="mx-auto mb-4 text-primary" />
                    <h3 className="text-4xl font-bold mb-2">950+</h3>
                    <p className="text-muted-foreground">Довольных клиентов</p>
                  </div>
                  <div className="text-center p-6 bg-muted rounded-xl">
                    <Icon name="Clock" size={48} className="mx-auto mb-4 text-primary" />
                    <h3 className="text-4xl font-bold mb-2">10 лет</h3>
                    <p className="text-muted-foreground">На рынке</p>
                  </div>
                </div>
                <p>
                  Наша продукция сертифицирована по европейским стандартам качества и соответствует всем 
                  требованиям экологической безопасности. Мы предлагаем комплексные решения: от проектирования 
                  до пусконаладочных работ и сервисного обслуживания.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Установка и монтаж</CardTitle>
                <CardDescription className="text-lg">Профессиональная установка с гарантией качества</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-6">
                  <img 
                    src="https://cdn.poehali.dev/projects/1520ee67-781a-4c81-9461-1408dd1371d4/files/649067d3-7155-4dc8-a217-fe8d90d255ce.jpg"
                    alt="Installation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Icon name="CheckCircle" className="text-primary" />
                      Этапы работы
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
                        <span>Выезд специалиста и оценка участка</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
                        <span>Разработка проекта и согласование</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
                        <span>Земляные работы и подготовка котлована</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">4</span>
                        <span>Установка оборудования и подключение</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">5</span>
                        <span>Пусконаладочные работы и обучение</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Icon name="Shield" className="text-primary" />
                      Наши гарантии
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3 items-start">
                        <Icon name="Check" className="text-primary flex-shrink-0 mt-1" />
                        <span>Гарантия на оборудование от 3 до 10 лет</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <Icon name="Check" className="text-primary flex-shrink-0 mt-1" />
                        <span>Гарантия на монтажные работы 2 года</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <Icon name="Check" className="text-primary flex-shrink-0 mt-1" />
                        <span>Бесплатное сервисное обслуживание 1 год</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <Icon name="Check" className="text-primary flex-shrink-0 mt-1" />
                        <span>Круглосуточная техподдержка</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <Icon name="Check" className="text-primary flex-shrink-0 mt-1" />
                        <span>Срок установки от 2 до 5 дней</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Калькулятор подбора системы</CardTitle>
                <CardDescription className="text-lg">
                  Подберите оптимальную систему очистки на основе количества проживающих
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg">Количество проживающих человек: {people}</Label>
                  <Slider 
                    value={[people]} 
                    onValueChange={(value) => setPeople(value[0])}
                    min={1}
                    max={15}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">
                    Расчетное потребление: {people * 200} л/сутки
                  </div>
                </div>
                
                <Button size="lg" onClick={calculateCapacity} className="w-full md:w-auto">
                  <Icon name="Calculator" size={20} className="mr-2" />
                  Рассчитать
                </Button>

                {calculatedProduct && (
                  <Card className="border-primary animate-scale-in">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Lightbulb" className="text-primary" />
                        Рекомендуемая система
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-xl mb-2">{calculatedProduct.name}</h4>
                          <p className="text-muted-foreground mb-4">{calculatedProduct.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Производительность:</span>
                              <span className="font-medium">{calculatedProduct.capacity} л/сутки</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Гарантия:</span>
                              <span className="font-medium">{calculatedProduct.specifications.warranty}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div className="text-3xl font-bold text-primary mb-4">
                            {calculatedProduct.price.toLocaleString('ru-RU')} ₽
                          </div>
                          <Button size="lg" onClick={() => {
                            setSelectedProduct(calculatedProduct);
                            setActiveTab('catalog');
                          }}>
                            Заказать эту систему
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Новости компании</h2>
              <p className="text-muted-foreground">Актуальная информация о продукции и акциях</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="overflow-hidden hover-scale">
                  <div className="h-48 bg-muted overflow-hidden">
                    <img 
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>
                      {new Date(item.published_at).toLocaleDateString('ru-RU')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Контакты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <Icon name="Phone" size={24} className="text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Телефон</h3>
                        <p className="text-lg">+7 (495) 123-45-67</p>
                        <p className="text-muted-foreground text-sm">Ежедневно с 9:00 до 21:00</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Icon name="Mail" size={24} className="text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-lg">info@ekovoda.ru</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Icon name="MapPin" size={24} className="text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Адрес офиса</h3>
                        <p className="text-lg">г. Москва, ул. Примерная, д. 123</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Icon name="Clock" size={24} className="text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Режим работы</h3>
                        <p className="text-lg">Пн-Пт: 9:00 - 19:00</p>
                        <p className="text-lg">Сб-Вс: 10:00 - 17:00</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Напишите нам</h3>
                    <div className="space-y-4">
                      <Input placeholder="Ваше имя" />
                      <Input placeholder="Телефон" />
                      <Input placeholder="Email" type="email" />
                      <Textarea placeholder="Ваше сообщение" rows={4} />
                      <Button className="w-full">
                        Отправить
                        <Icon name="Send" size={18} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Droplets" size={28} className="text-primary" />
              <span className="text-xl font-bold">ЭкоВода</span>
            </div>
            <p className="text-muted-foreground">© 2024 ЭкоВода. Все права защищены.</p>
            <div className="flex gap-4">
              <Icon name="Phone" className="text-primary cursor-pointer hover:scale-110 transition-transform" />
              <Icon name="Mail" className="text-primary cursor-pointer hover:scale-110 transition-transform" />
              <Icon name="MessageCircle" className="text-primary cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
