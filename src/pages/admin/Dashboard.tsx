import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  processingOrders: number;
  recentOrders: Array<{
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  revenueData: Array<{ name: string; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
    recentOrders: [],
    revenueData: [],
    ordersByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('*'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);

        const orders = ordersRes.data || [];
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
        const processingOrders = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;

        // Generate revenue data for the chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const revenueData = last7Days.map(date => {
          const dayOrders = orders.filter(o => o.created_at?.startsWith(date));
          const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue,
          };
        });

        // Orders by status for bar chart
        const statusCounts: Record<string, number> = {};
        orders.forEach(o => {
          const status = o.status || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
        }));

        setStats({
          totalProducts: productsRes.count || 0,
          totalOrders: orders.length,
          totalUsers: usersRes.count || 0,
          totalRevenue,
          pendingOrders,
          completedOrders,
          processingOrders,
          recentOrders: orders.slice(0, 5),
          revenueData,
          ordersByStatus,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `KES ${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      change: '+12.5%',
      changeType: 'positive' as const
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      gradient: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      change: '+8.2%',
      changeType: 'positive' as const
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: Package, 
      gradient: 'from-blue-500/20 to-blue-500/5',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      change: '+3.1%',
      changeType: 'positive' as const
    },
    { 
      title: 'Total Customers', 
      value: stats.totalUsers, 
      icon: Users, 
      gradient: 'from-purple-500/20 to-purple-500/5',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      change: '+5.4%',
      changeType: 'positive' as const
    },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      processing: { variant: 'secondary', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      shipped: { variant: 'secondary', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      delivered: { variant: 'default', className: 'bg-accent/10 text-accent' },
      completed: { variant: 'default', className: 'bg-accent/10 text-accent' },
      cancelled: { variant: 'destructive', className: '' },
    };
    const statusConfig = config[status] || config.pending;
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your store performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card 
              key={stat.title} 
              className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.gradient} backdrop-blur-sm shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? (
                        <span className="inline-block w-20 h-7 bg-muted animate-pulse rounded" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3 text-accent" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-destructive" />
                      )}
                      <span className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-accent' : 'text-destructive'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 border-0 shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
                  <CardDescription>Daily revenue for the last 7 days</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="font-medium text-accent">+12.5%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-card)'
                      }}
                      formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Chart */}
          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Orders by Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ordersByStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="status" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Summary */}
          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
              <CardDescription>Quick overview of order statuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Pending</p>
                    <p className="text-xs text-muted-foreground">Awaiting processing</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">In Transit</p>
                    <p className="text-xs text-muted-foreground">Processing & shipped</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.processingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Completed</p>
                    <p className="text-xs text-muted-foreground">Successfully delivered</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.completedOrders}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2 border-0 shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground/70">Orders will appear here when customers make purchases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at || '').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-foreground">
                          KES {Number(order.total_amount).toLocaleString()}
                        </p>
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
