'use client';

import { useState } from 'react';
import PaymentModal from '@/components/PaymentModal';

export default function PaymentDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState(29.99);
  const [courseName, setCourseName] = useState('ChatGPT Mastery Course');

  return (
    <div className="p-8 bg-black">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Payment Modal Demo</h1>
        <p className="text-zinc-400">Test the payment modal with dummy payments</p>
      </div>

      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
              placeholder="Enter course name"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full px-8 py-4 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
            >
              💳 Open Payment Modal
            </button>
          </div>

          <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-3">Features:</h3>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li>✅ Multiple payment methods (Card, PayPal, Stripe)</li>
              <li>✅ Dummy payment for testing</li>
              <li>✅ Card form with validation</li>
              <li>✅ Processing animation</li>
              <li>✅ Success confirmation</li>
              <li>✅ Responsive design</li>
            </ul>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        courseName={courseName}
        onSuccess={() => {
          alert('Payment successful! This is a demo.');
        }}
      />
    </div>
  );
}

