'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export default function ViewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`);
      const data = await res.json();
      if (data.success) {
        setPayment(data.data);
      } else {
        alert('Payment not found');
        router.push('/dashboard/payment');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching payment:', errorMessage);
      alert('Error loading payment: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPayment(data.data);
        alert('Payment status updated successfully!');
      } else {
        alert('Error updating payment: ' + data.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating payment:', errorMessage);
      alert('Error updating payment: ' + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-black">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 bg-black">
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">Payment not found</p>
          <Link
            href="/dashboard/payment"
            className="inline-block mt-4 px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
          >
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Payment Details</h1>
            <p className="text-zinc-400">Transaction ID: {payment.transactionId || payment.requestId || payment._id}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold border border-zinc-700"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Payment Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400">Amount</label>
                  <p className="text-white font-bold text-2xl">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Payment Method</label>
                  <p className="text-white font-semibold uppercase">{payment.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Status</label>
                  <div>
                    <select
                      value={payment.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      className={`px-4 py-2 rounded-xl border font-semibold transition-all ${
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
                  </div>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Transaction ID</label>
                  <p className="text-white font-mono text-sm">
                    {payment.transactionId || payment.requestId || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">User Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-400">Name</label>
                <p className="text-white font-semibold">{payment.userId?.name || 'Unknown'}</p>
              </div>
              {payment.userId?.email && (
                <div>
                  <label className="text-sm text-zinc-400">Email</label>
                  <p className="text-white font-semibold">{payment.userId.email}</p>
                </div>
              )}
              {payment.msisdn && (
                <div>
                  <label className="text-sm text-zinc-400">Phone Number (MSISDN)</label>
                  <p className="text-white font-semibold">{payment.msisdn}</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          {payment.courseId && (
            <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Course Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-400">Course Title</label>
                  <p className="text-white font-semibold">{payment.courseId.title}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Heading</label>
                  <p className="text-white font-semibold">{payment.courseId.heading}</p>
                </div>
                <Link
                  href={`/dashboard/courses/${payment.courseId._id}/view`}
                  className="inline-block mt-4 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold"
                >
                  View Course
                </Link>
              </div>
            </div>
          )}

          {/* Metadata */}
          {payment.metadata && Object.keys(payment.metadata).length > 0 && (
            <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
              <pre className="bg-zinc-800 rounded-xl p-4 text-xs text-zinc-300 overflow-x-auto">
                {JSON.stringify(payment.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timestamps */}
          <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Timestamps</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-400">Created</label>
                <p className="text-white font-semibold">
                  {new Date(payment.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Last Updated</label>
                <p className="text-white font-semibold">
                  {new Date(payment.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

