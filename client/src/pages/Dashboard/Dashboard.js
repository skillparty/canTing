import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useQuery } from 'react-query';
import { orderAPI, restaurantAPI, menuItemAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import MetricsCard from '../../components/Dashboard/MetricsCard';
import OrdersChart from '../../components/Dashboard/OrdersChart';
import RecentOrders from '../../components/Dashboard/RecentOrders';
import TopItems from '../../components/Dashboard/TopItems';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { restaurant } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Queries para obtener datos del dashboard
  const { data: dailySummary, isLoading: loadingDailySummary } = useQuery(
    'dailySummary',
    orderAPI.getDailySummary,
    {
      refetchInterval: 30000, // Refrescar cada 30 segundos
      onError: (error) => {
        console.error('Error fetching daily summary:', error);
      }
    }
  );

  const { data: recentOrders, isLoading: loadingRecentOrders } = useQuery(
    'recentOrders',
    () => orderAPI.getAll({ limit: 10, offset: 0 }),
    {
      refetchInterval: 15000, // Refrescar cada 15 segundos
      onError: (error) => {
        console.error('Error fetching recent orders:', error);
      }
    }
  );

  const { data: restaurantStats, isLoading: loadingRestaurantStats } = useQuery(
    ['restaurantStats', restaurant?.id],
    () => restaurant?.id ? restaurantAPI.getStats(restaurant.id) : null,
    {
      enabled: !!restaurant?.id,
      refetchInterval: 60000, // Refrescar cada minuto
      onError: (error) => {
        console.error('Error fetching restaurant stats:', error);
      }
    }
  );

  const { data: menuStats, isLoading: loadingMenuStats } = useQuery(
    'menuStats',
    menuItemAPI.getStats,
    {
      refetchInterval: 300000, // Refrescar cada 5 minutos
      onError: (error) => {
        console.error('Error fetching menu stats:', error);
      }
    }
  );

  // Datos mock para el gráfico (en una implementación real vendría de la API)
  const chartData = [
    { name: 'Lun', value: 12 },
    { name: 'Mar', value: 19 },
    { name: 'Mié', value: 15 },
    { name: 'Jue', value: 25 },
    { name: 'Vie', value: 32 },
    { name: 'Sáb', value: 28 },
    { name: 'Dom', value: 22 }
  ];

  // Datos mock para elementos más vendidos
  const topItemsData = [
    {
      id: 1,
      name: 'Pizza Margherita',
      category_name: 'Pizzas',
      price: 14.99,
      orders_count: 45,
      total_revenue: 674.55,
      growth_percentage: 12,
      image_url: null
    },
    {
      id: 2,
      name: 'Hamburguesa Clásica',
      category_name: 'Hamburguesas',
      price: 12.50,
      orders_count: 38,
      total_revenue: 475.00,
      growth_percentage: -5,
      image_url: null
    },
    {
      id: 3,
      name: 'Ensalada César',
      category_name: 'Ensaladas',
      price: 9.99,
      orders_count: 32,
      total_revenue: 319.68,
      growth_percentage: 8,
      image_url: null
    }
  ];

  const handleOrderClick = (order) => {
    // Navegar a la página de detalles del pedido
    console.log('Ver pedido:', order);
    toast.success(`Abriendo pedido #${order.id}`);
  };

  const getMetricsData = () => {
    const summary = dailySummary?.data?.data;
    const stats = restaurantStats?.data?.data;
    
    return {
      todayOrders: {
        value: summary?.today?.total_orders || 0,
        change: 15, // Esto vendría calculado del backend
        changeType: 'positive'
      },
      todayRevenue: {
        value: `$${(summary?.today?.total_revenue || 0).toFixed(2)}`,
        change: 8,
        changeType: 'positive'
      },
      pendingOrders: {
        value: summary?.pending?.total_pending || 0,
        subtitle: 'Requieren atención'
      },
      menuItems: {
        value: stats?.menu_stats?.total_items || 0,
        subtitle: `${stats?.menu_stats?.available_items || 0} disponibles`
      }
    };
  };

  const metrics = getMetricsData();

  return (
    <div className="dashboard">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Resumen de tu restaurante en tiempo real</p>
        </div>
        
        <div className="header-actions">
          <select 
            className="period-selector"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <MetricsCard
          title="Pedidos de Hoy"
          value={metrics.todayOrders.value}
          change={metrics.todayOrders.change}
          changeType={metrics.todayOrders.changeType}
          icon={ShoppingBag}
          color="blue"
          loading={loadingDailySummary}
        />
        
        <MetricsCard
          title="Ingresos de Hoy"
          value={metrics.todayRevenue.value}
          change={metrics.todayRevenue.change}
          changeType={metrics.todayRevenue.changeType}
          icon={DollarSign}
          color="green"
          loading={loadingDailySummary}
        />
        
        <MetricsCard
          title="Pedidos Pendientes"
          value={metrics.pendingOrders.value}
          subtitle={metrics.pendingOrders.subtitle}
          icon={Clock}
          color="yellow"
          loading={loadingDailySummary}
          onClick={() => toast.info('Navegando a pedidos pendientes...')}
        />
        
        <MetricsCard
          title="Elementos del Menú"
          value={metrics.menuItems.value}
          subtitle={metrics.menuItems.subtitle}
          icon={TrendingUp}
          color="purple"
          loading={loadingMenuStats}
          onClick={() => toast.info('Navegando a gestión de menú...')}
        />
      </div>

      {/* Estados de pedidos */}
      <div className="status-overview">
        <div className="status-card">
          <div className="status-header">
            <h3>Estado de Pedidos</h3>
          </div>
          <div className="status-grid">
            <div className="status-item">
              <div className="status-icon pending">
                <Clock size={20} />
              </div>
              <div className="status-info">
                <span className="status-count">
                  {dailySummary?.data?.data?.pending?.by_status?.pending || 0}
                </span>
                <span className="status-label">Pendientes</span>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon confirmed">
                <CheckCircle size={20} />
              </div>
              <div className="status-info">
                <span className="status-count">
                  {dailySummary?.data?.data?.pending?.by_status?.confirmed || 0}
                </span>
                <span className="status-label">Confirmados</span>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon preparing">
                <AlertCircle size={20} />
              </div>
              <div className="status-info">
                <span className="status-count">
                  {dailySummary?.data?.data?.pending?.by_status?.preparing || 0}
                </span>
                <span className="status-label">Preparando</span>
              </div>
            </div>
            
            <div className="status-item">
              <div className="status-icon ready">
                <CheckCircle size={20} />
              </div>
              <div className="status-info">
                <span className="status-count">
                  {dailySummary?.data?.data?.pending?.by_status?.ready || 0}
                </span>
                <span className="status-label">Listos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y listas */}
      <div className="dashboard-content">
        <div className="content-left">
          <OrdersChart
            data={chartData}
            title="Pedidos de la Semana"
            type="line"
            loading={false}
          />
          
          <RecentOrders
            orders={recentOrders?.data?.data || []}
            loading={loadingRecentOrders}
            onOrderClick={handleOrderClick}
          />
        </div>
        
        <div className="content-right">
          <TopItems
            items={topItemsData}
            loading={false}
            title="Elementos Más Vendidos"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;