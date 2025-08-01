import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Calendar,
  TrendingUp,
  CreditCard,
  Eye,
  Download
} from 'lucide-react';
import PaymentCard from '../../components/Payments/PaymentCard';
import PaymentHistory from '../../components/Payments/PaymentHistory';
import PaymentReports from '../../components/Payments/PaymentReports';
import QRUploader from '../../components/Payments/QRUploader';
import { paymentAPI, orderAPI } from '../../services/api';
import './PaymentManager.css';

const PaymentManager = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showQRUploader, setShowQRUploader] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    qr_uploaded: 0,
    verified: 0,
    paid: 0,
    failed: 0,
    todayRevenue: 0,
    pendingAmount: 0
  });

  // Cargar pagos
  const loadPayments = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const response = await paymentAPI.getAll();
      const paymentsData = response.data || [];
      
      setPayments(paymentsData);
      calculateStats(paymentsData);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Error al cargar los pagos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Calcular estadísticas
  const calculateStats = (paymentsData) => {
    const today = new Date().toDateString();
    
    const newStats = {
      total: paymentsData.length,
      pending: paymentsData.filter(payment => payment.status === 'pending').length,
      qr_uploaded: paymentsData.filter(payment => payment.status === 'qr_uploaded').length,
      verified: paymentsData.filter(payment => payment.status === 'verified').length,
      paid: paymentsData.filter(payment => payment.status === 'paid').length,
      failed: paymentsData.filter(payment => payment.status === 'failed').length,
      todayRevenue: paymentsData
        .filter(payment => {
          const paymentDate = new Date(payment.created_at).toDateString();
          return paymentDate === today && payment.status === 'paid';
        })
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
      pendingAmount: paymentsData
        .filter(payment => ['pending', 'qr_uploaded', 'verified'].includes(payment.status))
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
    };
    
    setStats(newStats);
  };

  // Filtrar pagos
  useEffect(() => {
    let filtered = [...payments];

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.id.toString().includes(term) ||
        payment.order_id?.toString().includes(term) ||
        payment.customer_name?.toLowerCase().includes(term) ||
        payment.reference_number?.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filtro por método de pago
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_method === methodFilter);
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        
        switch (dateFilter) {
          case 'today':
            return paymentDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return paymentDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return paymentDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter]);

  // Actualizar estado del pago
  const handleStatusChange = async (paymentId, newStatus, reason = null) => {
    try {
      await paymentAPI.updateStatus(paymentId, newStatus);
      
      // Actualizar el pago en el estado local
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: newStatus, updated_at: new Date().toISOString() }
            : payment
        )
      );

      console.log(`Pago ${paymentId} actualizado a ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Error al actualizar el estado del pago');
    }
  };

  // Confirmar pago
  const handleConfirmPayment = async (payment, data) => {
    try {
      await paymentAPI.confirm(payment.id, data);
      
      // Actualizar el pago en el estado local
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === payment.id 
            ? { ...p, status: 'paid', confirmed_at: new Date().toISOString() }
            : p
        )
      );

      console.log(`Pago ${payment.id} confirmado`);
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      setError('Error al confirmar el pago');
    }
  };

  // Rechazar pago
  const handleRejectPayment = async (payment, reason) => {
    try {
      await paymentAPI.reject(payment.id, reason);
      
      // Actualizar el pago en el estado local
      setPayments(prevPayments => 
        prevPayments.map(p => 
          p.id === payment.id 
            ? { ...p, status: 'failed', rejection_reason: reason }
            : p
        )
      );

      console.log(`Pago ${payment.id} rechazado: ${reason}`);
      
    } catch (error) {
      console.error('Error rejecting payment:', error);
      setError('Error al rechazar el pago');
    }
  };

  // Subir QR
  const handleQRUpload = async (paymentId, qrFile) => {
    try {
      const formData = new FormData();
      formData.append('qr_image', qrFile);
      formData.append('payment_id', paymentId);

      await paymentAPI.uploadQR(formData);
      
      // Actualizar el pago en el estado local
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'qr_uploaded', qr_uploaded_at: new Date().toISOString() }
            : payment
        )
      );

      setShowQRUploader(false);
      setSelectedPayment(null);
      
    } catch (error) {
      console.error('Error uploading QR:', error);
      setError('Error al subir el código QR');
    }
  };

  // Refrescar pagos
  const handleRefresh = () => {
    loadPayments(false);
  };

  // Cargar pagos al montar el componente
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Configuración de filtros de estado
  const statusFilters = [
    { value: 'all', label: 'Todos', icon: null, count: stats.total },
    { value: 'pending', label: 'Pendientes', icon: Clock, count: stats.pending, color: '#f59e0b' },
    { value: 'qr_uploaded', label: 'QR Subido', icon: QrCode, count: stats.qr_uploaded, color: '#3b82f6' },
    { value: 'verified', label: 'Verificados', icon: CheckCircle, count: stats.verified, color: '#8b5cf6' },
    { value: 'paid', label: 'Pagados', icon: CheckCircle, count: stats.paid, color: '#10b981' },
    { value: 'failed', label: 'Fallidos', icon: XCircle, count: stats.failed, color: '#ef4444' }
  ];

  const methodFilters = [
    { value: 'all', label: 'Todos los métodos' },
    { value: 'qr_transfer', label: 'Transferencia QR' },
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' }
  ];

  const dateFilters = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'all', label: 'Todos' }
  ];

  if (loading) {
    return (
      <div className="payment-manager">
        <div className="page-header">
          <h1>Gestión de Pagos</h1>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-manager">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Pagos</h1>
          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Actualizar pagos"
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
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Monto Pendiente</span>
            <span className="stat-value">${stats.pendingAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="stat-card verified">
          <div className="stat-icon">
            <QrCode size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">QRs Subidos</span>
            <span className="stat-value">{stats.qr_uploaded}</span>
          </div>
        </div>
        
        <div className="stat-card paid">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pagos Confirmados</span>
            <span className="stat-value">{stats.paid}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={16} />
            <span>Pagos</span>
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={16} />
            <span>Historial</span>
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <TrendingUp size={16} />
            <span>Reportes</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'payments' && (
        <>
          {/* Filters and Search */}
          <div className="filters-section">
            <div className="search-container">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por ID, pedido, cliente o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters-row">
              <div className="filter-group">
                <label>Estado:</label>
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

              <div className="filter-group">
                <label>Método:</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="filter-select"
                >
                  {methodFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Fecha:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  {dateFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertTriangle size={20} />
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Payments Grid */}
          <div className="payments-section">
            {filteredPayments.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <h3>No hay pagos</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'today'
                    ? 'No se encontraron pagos con los filtros aplicados.'
                    : 'Aún no hay pagos registrados.'}
                </p>
                {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'today') && (
                  <button
                    className="clear-filters-button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setMethodFilter('all');
                      setDateFilter('today');
                    }}
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="payments-grid">
                {filteredPayments.map(payment => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onStatusChange={handleStatusChange}
                    onConfirm={handleConfirmPayment}
                    onReject={handleRejectPayment}
                    onUploadQR={(payment) => {
                      setSelectedPayment(payment);
                      setShowQRUploader(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <PaymentHistory 
          payments={payments}
          onRefresh={handleRefresh}
        />
      )}

      {activeTab === 'reports' && (
        <PaymentReports 
          payments={payments}
          stats={stats}
        />
      )}

      {/* QR Uploader Modal */}
      <QRUploader
        payment={selectedPayment}
        isOpen={showQRUploader}
        onClose={() => {
          setShowQRUploader(false);
          setSelectedPayment(null);
        }}
        onUpload={handleQRUpload}
      />
    </div>
  );
};

export default PaymentManager;