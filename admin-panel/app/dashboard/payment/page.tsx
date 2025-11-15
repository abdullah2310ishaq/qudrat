'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
  };
  courseId?: {
    _id: string;
    title: string;
    heading: string;
  };
  amount: number;
  currency: string;
  paymentMethod: 'spay' | 'card' | 'paypal' | 'stripe' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  msisdn?: string;
  requestId?: string;
  createdAt: string;
}

export default function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);

      const res = await fetch(`/api/payments?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching payments:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentList: Payment[]) => {
    const statsData = {
      total: paymentList.length,
      completed: paymentList.filter((p) => p.status === 'completed').length,
      pending: paymentList.filter((p) => p.status === 'pending').length,
      failed: paymentList.filter((p) => p.status === 'failed').length,
      totalAmount: paymentList
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    };
    setStats(statsData);
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
      } else {
        alert('Error updating payment: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating payment:', errorMessage);
      alert('Error updating payment: ' + errorMessage);
    }
  };

  return (
    <div className="p-8 bg-black">
      <div className="mb-12">
        <h1 className="text-5xl font-thin text-white mb-3 tracking-tight">Payment Tracking</h1>
        <div className="w-16 h-px bg-white/20 mb-4"></div>
        <p className="text-sm font-light text-white/60 tracking-wide">View and manage all payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-black/40 rounded-sm border border-white/10 p-6">
          <div className="text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Total Payments</div>
          <div className="text-3xl font-thin text-white">{stats.total}</div>
        </div>
        <div className="bg-black/40 rounded-sm border border-white/10 p-6">
          <div className="text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Completed</div>
          <div className="text-3xl font-thin text-white">{stats.completed}</div>
        </div>
        <div className="bg-black/40 rounded-sm border border-white/10 p-6">
          <div className="text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Pending</div>
          <div className="text-3xl font-thin text-white">{stats.pending}</div>
        </div>
        <div className="bg-black/40 rounded-sm border border-white/10 p-6">
          <div className="text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Failed</div>
          <div className="text-3xl font-thin text-white">{stats.failed}</div>
        </div>
        <div className="bg-black/40 rounded-sm border border-white/10 p-6">
          <div className="text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Total Revenue</div>
          <div className="text-3xl font-thin text-white">${stats.totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/40 rounded-sm border border-white/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Filter by Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-light text-white/60 mb-2 tracking-wider uppercase">Filter by Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-sm bg-white/5 text-white focus:bg-white/10 focus:border-white/20 transition-all font-light text-sm"
            >
              <option value="">All Methods</option>
              <option value="spay">SPay</option>
              <option value="card">Card</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', paymentMethod: '' })}
              className="w-full px-4 py-2.5 bg-white/5 text-white rounded-sm hover:bg-white/10 text-xs font-light tracking-wider uppercase border border-white/10 hover:border-white/20 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border border-white/20 border-t-white/60"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-black/40 rounded-sm border border-white/10">
          <div className="text-5xl mb-4 opacity-70">💳</div>
          <p className="text-sm font-light text-white/60 mb-6 tracking-wide">No payments found</p>
          <p className="text-xs font-light text-white/50 tracking-wide">Payments will appear here when users make transactions</p>
        </div>
      ) : (
        <div className="bg-black/40 rounded-sm border border-white/10 overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-light text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black/40 divide-y divide-white/10">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-light text-white">
                      {payment.userId?.name || 'Unknown'}
                    </div>
                    {payment.userId?.email && (
                      <div className="text-xs text-white/50 font-light">{payment.userId.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.courseId ? (
                      <div>
                        <div className="text-sm font-light text-white">{payment.courseId.title}</div>
                        <div className="text-xs text-white/50 font-light">{payment.courseId.heading}</div>
                      </div>
                    ) : (
                      <span className="text-white/50 text-sm font-light">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-light text-white">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-light rounded-sm bg-white/5 text-white/80 border border-white/10">
                      {payment.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.status}
                      onChange={(e) => updatePaymentStatus(payment._id, e.target.value)}
                      className={`px-2.5 py-1 text-xs font-light rounded-sm border transition-all ${
                        payment.status === 'completed'
                          ? 'bg-white/10 text-white border-white/20'
                          : payment.status === 'pending'
                          ? 'bg-white/5 text-white/80 border-white/10'
                          : payment.status === 'failed'
                          ? 'bg-white/5 text-white/50 border-white/10'
                          : 'bg-white/5 text-white/50 border-white/10'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70 font-light font-mono">
                      {payment.transactionId || payment.requestId || '-'}
                    </div>
                    {payment.msisdn && (
                      <div className="text-xs text-white/50 font-light">{payment.msisdn}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/70 font-light">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-white/50 font-light">
                      {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-light">
                    <Link
                      href={`/dashboard/payments/${payment._id}`}
                      className="text-white/60 hover:text-white transition-colors text-xs tracking-wide"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

