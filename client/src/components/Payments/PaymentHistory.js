import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Download,
  Clock,
  DollarSign,
  User,
  Hash,
  CheckCircle,
  XCircle,
  QrCode,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import './PaymentHistory.css';

const PaymentHistory = ({ payments, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedPayment, setExpandedPayment] = useState(null);

  // Filtrar y ordenar pagos
  const filteredPayments = useMemo(() => {
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

    // Filtro por fecha
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = startOfWeek(now, { locale: es });
          endDate = endOfWeek(now, { locale: es });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        default:
          startDate = null;
          endDate = null;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.created_at);
          return paymentDate >= startDate && paymentDate < endDate;
        });
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'amount':
          aValue = parseFloat(a.amount || 0);
          bValue = parseFloat(b.amount || 0);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'customer':
          aValue = a.customer_name || '';
          bValue = b.customer_name || '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [payments, searchTerm, statusFilter, dateRange, sortBy, sortOrder]);

  // Configuraciones de estado
  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pendiente', color: '#f59e0b', icon: Clock },
      qr_uploaded: { label: 'QR Subido', color: '#3b82f6', icon: QrCode },
      verified: { label: 'Verificado', color: '#8b5cf6', icon: CheckCircle },
      paid: { label: 'Pagado', color: '#10b981', icon: CheckCircle },
      failed: { label: 'Fallido', color: '#ef4444', icon: XCircle }
    };
    return configs[status] || configs.pending;
  };

  // Exportar datos
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Pedido', 'Cliente', 'Monto', 'Estado', 'Método', 'Fecha'].join(','),
      ...filteredPayments.map(payment => [
        payment.id,
        payment.order_id,
        payment.customer_name || '',
        payment.amount,
        payment.status,
        payment.payment_method,
        format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-pagos-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Cambiar ordenamiento
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="payment-history">
      {/* Filters */}
      <div className="history-filters">
        <div className="filters-row">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar pagos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="qr_uploaded">QR Subidos</option>
            <option value="verified">Verificados</option>
            <option value="paid">Pagados</option>
            <option value="failed">Fallidos</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>

          <button
            className="export-button"
            onClick={handleExport}
            disabled={filteredPayments.length === 0}
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {filteredPayments.length} pago{filteredPayments.length !== 1 ? 's' : ''} encontrado{filteredPayments.length !== 1 ? 's' : ''}
        </span>
        <span className="results-total">
          Total: ${filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toFixed(2)}
        </span>
      </div>

      {/* Table */}
      <div className="history-table-container">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No hay pagos</h3>
            <p>No se encontraron pagos con los filtros aplicados.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th 
                  className={`sortable ${sortBy === 'date' ? 'active' : ''}`}
                  onClick={() => handleSort('date')}
                >
                  <span>Fecha</span>
                  {sortBy === 'date' && (
                    sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th>ID</th>
                <th>Pedido</th>
                <th 
                  className={`sortable ${sortBy === 'customer' ? 'active' : ''}`}
                  onClick={() => handleSort('customer')}
                >
                  <span>Cliente</span>
                  {sortBy === 'customer' && (
                    sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th 
                  className={`sortable ${sortBy === 'amount' ? 'active' : ''}`}
                  onClick={() => handleSort('amount')}
                >
                  <span>Monto</span>
                  {sortBy === 'amount' && (
                    sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th 
                  className={`sortable ${sortBy === 'status' ? 'active' : ''}`}
                  onClick={() => handleSort('status')}
                >
                  <span>Estado</span>
                  {sortBy === 'status' && (
                    sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th>Método</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => {
                const statusConfig = getStatusConfig(payment.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedPayment === payment.id;

                return (
                  <React.Fragment key={payment.id}>
                    <tr className={`payment-row ${isExpanded ? 'expanded' : ''}`}>
                      <td className="date-cell">
                        <div className="date-info">
                          <span className="date">
                            {format(new Date(payment.created_at), 'dd/MM/yyyy')}
                          </span>
                          <span className="time">
                            {format(new Date(payment.created_at), 'HH:mm')}
                          </span>
                        </div>
                      </td>
                      <td className="id-cell">#{payment.id}</td>
                      <td className="order-cell">#{payment.order_id}</td>
                      <td className="customer-cell">
                        <div className="customer-info">
                          <User size={14} />
                          <span>{payment.customer_name || 'No especificado'}</span>
                        </div>
                      </td>
                      <td className="amount-cell">
                        <div className="amount-info">
                          <DollarSign size={14} />
                          <span>${parseFloat(payment.amount || 0).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="status-cell">
                        <div 
                          className="status-badge"
                          style={{ color: statusConfig.color }}
                        >
                          <StatusIcon size={14} />
                          <span>{statusConfig.label}</span>
                        </div>
                      </td>
                      <td className="method-cell">
                        {payment.payment_method === 'qr_transfer' ? 'QR' :
                         payment.payment_method === 'bank_transfer' ? 'Transferencia' :
                         payment.payment_method}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="expand-button"
                          onClick={() => setExpandedPayment(isExpanded ? null : payment.id)}
                        >
                          <Eye size={14} />
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="8">
                          <div className="expanded-content">
                            <div className="expanded-details">
                              <div className="detail-group">
                                <h5>Información del Pago</h5>
                                <div className="detail-grid">
                                  <div className="detail-item">
                                    <span className="label">Referencia:</span>
                                    <span className="value">{payment.reference_number || 'N/A'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Creado:</span>
                                    <span className="value">
                                      {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm:ss')}
                                    </span>
                                  </div>
                                  {payment.confirmed_at && (
                                    <div className="detail-item">
                                      <span className="label">Confirmado:</span>
                                      <span className="value">
                                        {format(new Date(payment.confirmed_at), 'dd/MM/yyyy HH:mm:ss')}
                                      </span>
                                    </div>
                                  )}
                                  {payment.qr_uploaded_at && (
                                    <div className="detail-item">
                                      <span className="label">QR Subido:</span>
                                      <span className="value">
                                        {format(new Date(payment.qr_uploaded_at), 'dd/MM/yyyy HH:mm:ss')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {payment.notes && (
                                <div className="detail-group">
                                  <h5>Notas</h5>
                                  <p className="notes">{payment.notes}</p>
                                </div>
                              )}

                              {payment.qr_image_url && (
                                <div className="detail-group">
                                  <h5>Comprobante QR</h5>
                                  <div className="qr-preview">
                                    <img 
                                      src={payment.qr_image_url} 
                                      alt="QR de pago" 
                                      className="qr-image"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;