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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Payment Tracking</h1>
        <p className="text-zinc-400">View and manage all payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400 text-sm mb-1">Total Payments</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400 text-sm mb-1">Completed</div>
          <div className="text-2xl font-bold text-white">{stats.completed}</div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">{stats.pending}</div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400 text-sm mb-1">Failed</div>
          <div className="text-2xl font-bold text-white">{stats.failed}</div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="text-zinc-400 text-sm mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-white">${stats.totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filter by Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filter by Method</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
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
              className="w-full px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold border border-zinc-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-zinc-400 mb-4 text-lg">No payments found</p>
          <p className="text-zinc-500 text-sm">Payments will appear here when users make transactions</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">
                      {payment.userId?.name || 'Unknown'}
                    </div>
                    {payment.userId?.email && (
                      <div className="text-sm text-zinc-400">{payment.userId.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.courseId ? (
                      <div>
                        <div className="text-sm font-semibold text-white">{payment.courseId.title}</div>
                        <div className="text-xs text-zinc-400">{payment.courseId.heading}</div>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-white border border-zinc-700">
                      {payment.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.status}
                      onChange={(e) => updatePaymentStatus(payment._id, e.target.value)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                        payment.status === 'completed'
                          ? 'bg-white text-black border-white'
                          : payment.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-200 border-yellow-700'
                          : payment.status === 'failed'
                          ? 'bg-red-900 text-red-200 border-red-700'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300 font-mono">
                      {payment.transactionId || payment.requestId || '-'}
                    </div>
                    {payment.msisdn && (
                      <div className="text-xs text-zinc-500">{payment.msisdn}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/dashboard/payments/${payment._id}`}
                      className="text-white hover:text-zinc-300 font-semibold hover:underline"
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

