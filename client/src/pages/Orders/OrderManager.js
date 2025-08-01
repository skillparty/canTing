import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import OrderCard from '../../components/Orders/OrderCard';
import OrderDetails from '../../components/Orders/OrderDetails';
import CancelOrderModal from '../../components/Orders/CancelOrderModal';
import { orderAPI } from '../../services/api';
import './OrderManager.css';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
    todayRevenue: 0
  });

  // Cargar pedidos
  const loadOrders = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await orderAPI.getAll();
      const ordersData = response.data || [];
      
      setOrders(ordersData);
      calculateStats(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar los pedidos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Calcular estadísticas
  const calculateStats = (ordersData) => {
    const today = new Date().toDateString();
    
    const newStats = {
      total: ordersData.length,
      pending: ordersData.filter(order => order.status === 'pending').length,
      confirmed: ordersData.filter(order => order.status === 'confirmed').length,
      preparing: ordersData.filter(order => order.status === 'preparing').length,
      ready: ordersData.filter(order => order.status === 'ready').length,
      delivered: ordersData.filter(order => order.status === 'delivered').length,
      cancelled: ordersData.filter(order => order.status === 'cancelled').length,
      todayRevenue: ordersData
        .filter(order => {
          const orderDate = new Date(order.created_at).toDateString();
          return orderDate === today && order.status !== 'cancelled';
        })
        .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
    };
    
    setStats(newStats);
  };

  // Filtrar pedidos
  useEffect(() => {
    let filtered = [...orders];

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_phone?.includes(term) ||
        order.customer_email?.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  // Cambiar estado del pedido
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      
      // Actualizar el pedido en el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Si hay un pedido seleccionado, actualizarlo también
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      // Mostrar notificación de éxito (puedes implementar un sistema de notificaciones)
      console.log(`Pedido ${orderId} actualizado a ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Error al actualizar el estado del pedido');
    }
  };

  // Mostrar modal de cancelación
  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  // Confirmar cancelación
  const handleConfirmCancel = async (order, reason) => {
    try {
      await orderAPI.cancel(order.id, reason);
      
      // Actualizar el pedido en el estado local
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === order.id 
            ? { ...o, status: 'cancelled' }
            : o
        )
      );

      // Si hay un pedido seleccionado, actualizarlo también
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
      }

      setShowCancelModal(false);
      setOrderToCancel(null);
      setShowOrderDetails(false);
      
      console.log(`Pedido ${order.id} cancelado: ${reason}`);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('Error al cancelar el pedido');
    }
  };

  // Cerrar modal de cancelación
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  // Ver detalles del pedido
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Cerrar detalles
  const handleCloseDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // Refrescar pedidos
  const handleRefresh = () => {
    loadOrders(false);
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Configuración de filtros de estado
  const statusFilters = [
    { value: 'all', label: 'Todos', icon: null, count: stats.total },
    { value: 'pending', label: 'Nuevos', icon: AlertCircle, count: stats.pending, color: '#f59e0b' },
    { value: 'confirmed', label: 'Confirmados', icon: CheckCircle, count: stats.confirmed, color: '#3b82f6' },
    { value: 'preparing', label: 'En Preparación', icon: Package, count: stats.preparing, color: '#8b5cf6' },
    { value: 'ready', label: 'Listos', icon: CheckCircle, count: stats.ready, color: '#10b981' },
    { value: 'delivered', label: 'Entregados', icon: Truck, count: stats.delivered, color: '#6b7280' },
    { value: 'cancelled', label: 'Cancelados', icon: XCircle, count: stats.cancelled, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="order-manager">
        <div className="page-header">
          <h1>Gestión de Pedidos</h1>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-manager">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Pedidos</h1>
          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Actualizar pedidos"
            >
              <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Ingresos Hoy</span>
            <span className="stat-value">${stats.todayRevenue.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="stat-card orders">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Pedidos</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats.pending + stats.confirmed}</span>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">En Proceso</span>
            <span className="stat-value">{stats.preparing + stats.ready}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="status-filters">
          {statusFilters.map(filter => {
            const FilterIcon = filter.icon;
            return (
              <button
                key={filter.value}
                className={`filter-button ${statusFilter === filter.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter.value)}
                style={{
                  '--filter-color': filter.color || '#6b7280'
                }}
              >
                {FilterIcon && <FilterIcon size={16} />}
                <span>{filter.label}</span>
                <span className="filter-count">{filter.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Orders Grid */}
      <div className="orders-section">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No hay pedidos</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron pedidos con los filtros aplicados.'
                : 'Aún no hay pedidos registrados.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                className="clear-filters-button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetails
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={handleCloseDetails}
        onStatusChange={handleStatusChange}
        onCancel={handleCancelOrder}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        order={orderToCancel}
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default OrderManager;