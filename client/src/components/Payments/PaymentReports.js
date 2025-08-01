import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  eachDayOfInterval,
  eachMonthOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import './PaymentReports.css';

const PaymentReports = ({ payments, stats }) => {
  const [reportPeriod, setReportPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Calcular datos del período seleccionado
  const periodData = useMemo(() => {
    const now = new Date();
    let startDate, endDate, intervals;

    switch (reportPeriod) {
      case 'week':
        startDate = startOfWeek(now, { locale: es });
        endDate = endOfWeek(now, { locale: es });
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'quarter':
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
      case 'year':
        startDate = startOfMonth(subMonths(now, 11));
        endDate = endOfMonth(now);
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
    }

    // Filtrar pagos del período
    const periodPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.created_at);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Agrupar datos por intervalo
    const groupedData = intervals.map(interval => {
      const intervalStart = reportPeriod === 'week' || reportPeriod === 'month' 
        ? startOfDay(interval) 
        : startOfMonth(interval);
      const intervalEnd = reportPeriod === 'week' || reportPeriod === 'month' 
        ? endOfDay(interval) 
        : endOfMonth(interval);

      const intervalPayments = periodPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= intervalStart && paymentDate <= intervalEnd;
      });

      const revenue = intervalPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const pending = intervalPayments.filter(p => p.status === 'pending').length;
      const paid = intervalPayments.filter(p => p.status === 'paid').length;
      const failed = intervalPayments.filter(p => p.status === 'failed').length;

      return {
        date: interval,
        label: reportPeriod === 'week' || reportPeriod === 'month' 
          ? format(interval, 'dd/MM', { locale: es })
          : format(interval, 'MMM', { locale: es }),
        revenue,
        pending,
        paid,
        failed,
        total: intervalPayments.length
      };
    });

    return {
      startDate,
      endDate,
      payments: periodPayments,
      groupedData,
      totalRevenue: periodPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      totalPayments: periodPayments.length,
      successRate: periodPayments.length > 0 
        ? (periodPayments.filter(p => p.status === 'paid').length / periodPayments.length * 100)
        : 0
    };
  }, [payments, reportPeriod]);

  // Estadísticas por método de pago
  const paymentMethodStats = useMemo(() => {
    const methods = {};
    
    periodData.payments.forEach(payment => {
      const method = payment.payment_method || 'unknown';
      if (!methods[method]) {
        methods[method] = {
          count: 0,
          revenue: 0,
          label: method === 'qr_transfer' ? 'Transferencia QR' :
                 method === 'bank_transfer' ? 'Transferencia Bancaria' :
                 method === 'cash' ? 'Efectivo' :
                 method === 'card' ? 'Tarjeta' : method
        };
      }
      
      methods[method].count++;
      if (payment.status === 'paid') {
        methods[method].revenue += parseFloat(payment.amount || 0);
      }
    });

    return Object.entries(methods).map(([key, data]) => ({
      method: key,
      ...data
    }));
  }, [periodData.payments]);

  // Estadísticas por estado
  const statusStats = useMemo(() => {
    const statuses = {
      pending: { count: 0, label: 'Pendientes', color: '#f59e0b' },
      qr_uploaded: { count: 0, label: 'QR Subidos', color: '#3b82f6' },
      verified: { count: 0, label: 'Verificados', color: '#8b5cf6' },
      paid: { count: 0, label: 'Pagados', color: '#10b981' },
      failed: { count: 0, label: 'Fallidos', color: '#ef4444' }
    };

    periodData.payments.forEach(payment => {
      if (statuses[payment.status]) {
        statuses[payment.status].count++;
      }
    });

    return Object.entries(statuses)
      .map(([status, data]) => ({ status, ...data }))
      .filter(item => item.count > 0);
  }, [periodData.payments]);

  // Exportar reporte
  const handleExportReport = () => {
    const reportData = {
      period: reportPeriod,
      startDate: format(periodData.startDate, 'dd/MM/yyyy'),
      endDate: format(periodData.endDate, 'dd/MM/yyyy'),
      summary: {
        totalPayments: periodData.totalPayments,
        totalRevenue: periodData.totalRevenue,
        successRate: periodData.successRate.toFixed(2)
      },
      dailyData: periodData.groupedData,
      methodStats: paymentMethodStats,
      statusStats: statusStats
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-pagos-${reportPeriod}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Obtener valor máximo para el gráfico
  const getMaxValue = () => {
    const values = periodData.groupedData.map(item => {
      switch (selectedMetric) {
        case 'revenue': return item.revenue;
        case 'count': return item.total;
        case 'paid': return item.paid;
        default: return item.revenue;
      }
    });
    return Math.max(...values, 1);
  };

  const maxValue = getMaxValue();

  return (
    <div className="payment-reports">
      {/* Controls */}
      <div className="reports-controls">
        <div className="controls-row">
          <div className="period-selector">
            <Calendar size={16} />
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="period-select"
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
          </div>

          <div className="metric-selector">
            <BarChart3 size={16} />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-select"
            >
              <option value="revenue">Ingresos</option>
              <option value="count">Cantidad de pagos</option>
              <option value="paid">Pagos exitosos</option>
            </select>
          </div>

          <button
            className="export-report-button"
            onClick={handleExportReport}
          >
            <Download size={16} />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue">
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Ingresos del Período</span>
            <span className="card-value">${periodData.totalRevenue.toFixed(2)}</span>
            <span className="card-period">
              {format(periodData.startDate, 'dd MMM', { locale: es })} - {format(periodData.endDate, 'dd MMM', { locale: es })}
            </span>
          </div>
        </div>

        <div className="summary-card payments">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Total de Pagos</span>
            <span className="card-value">{periodData.totalPayments}</span>
            <span className="card-period">
              {periodData.payments.filter(p => p.status === 'paid').length} exitosos
            </span>
          </div>
        </div>

        <div className="summary-card success-rate">
          <div className="card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Tasa de Éxito</span>
            <span className="card-value">{periodData.successRate.toFixed(1)}%</span>
            <span className="card-period">
              {periodData.payments.filter(p => p.status === 'failed').length} fallidos
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Time Series Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>
              {selectedMetric === 'revenue' ? 'Ingresos' :
               selectedMetric === 'count' ? 'Cantidad de Pagos' :
               'Pagos Exitosos'} por {reportPeriod === 'week' || reportPeriod === 'month' ? 'Día' : 'Mes'}
            </h3>
          </div>
          
          <div className="bar-chart">
            {periodData.groupedData.map((item, index) => {
              const value = selectedMetric === 'revenue' ? item.revenue :
                           selectedMetric === 'count' ? item.total :
                           item.paid;
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="bar-item">
                  <div className="bar-container">
                    <div 
                      className="bar"
                      style={{ height: `${height}%` }}
                      title={`${item.label}: ${selectedMetric === 'revenue' ? '$' + value.toFixed(2) : value}`}
                    />
                  </div>
                  <span className="bar-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Métodos de Pago</h3>
          </div>
          
          <div className="methods-chart">
            {paymentMethodStats.map((method, index) => (
              <div key={index} className="method-item">
                <div className="method-info">
                  <span className="method-label">{method.label}</span>
                  <span className="method-stats">
                    {method.count} pagos - ${method.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="method-bar">
                  <div 
                    className="method-fill"
                    style={{ 
                      width: `${periodData.totalPayments > 0 ? (method.count / periodData.totalPayments) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>Distribución por Estado</h3>
          </div>
          
          <div className="status-chart">
            {statusStats.map((status, index) => (
              <div key={index} className="status-item">
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: status.color }}
                />
                <div className="status-info">
                  <span className="status-label">{status.label}</span>
                  <span className="status-count">{status.count}</span>
                </div>
                <div className="status-percentage">
                  {periodData.totalPayments > 0 
                    ? ((status.count / periodData.totalPayments) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="detailed-table">
        <div className="table-header">
          <h3>Detalle por {reportPeriod === 'week' || reportPeriod === 'month' ? 'Día' : 'Mes'}</h3>
        </div>
        
        <div className="table-container">
          <table className="details-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total Pagos</th>
                <th>Exitosos</th>
                <th>Pendientes</th>
                <th>Fallidos</th>
                <th>Ingresos</th>
                <th>Tasa Éxito</th>
              </tr>
            </thead>
            <tbody>
              {periodData.groupedData.map((item, index) => (
                <tr key={index}>
                  <td className="date-cell">
                    {reportPeriod === 'week' || reportPeriod === 'month' 
                      ? format(item.date, 'dd/MM/yyyy', { locale: es })
                      : format(item.date, 'MMMM yyyy', { locale: es })}
                  </td>
                  <td className="number-cell">{item.total}</td>
                  <td className="number-cell success">{item.paid}</td>
                  <td className="number-cell pending">{item.pending}</td>
                  <td className="number-cell failed">{item.failed}</td>
                  <td className="currency-cell">${item.revenue.toFixed(2)}</td>
                  <td className="percentage-cell">
                    {item.total > 0 ? ((item.paid / item.total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentReports;