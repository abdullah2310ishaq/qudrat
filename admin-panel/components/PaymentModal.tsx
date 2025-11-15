'use client';

import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  courseName?: string;
  onSuccess?: () => void;
}

export default function PaymentModal({ isOpen, onClose, amount, courseName, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'stripe' | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  if (!isOpen) return null;

  const handlePaymentMethod = (method: 'card' | 'paypal' | 'stripe') => {
    setPaymentMethod(method);
    setStep('details');
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setStep('method');
        setPaymentMethod(null);
        setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
      }, 2000);
    }, 2000);
  };

  const handleDummyPayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setStep('method');
        setPaymentMethod(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-white">Payment</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                <div className="text-sm text-zinc-400 mb-1">Amount</div>
                <div className="text-3xl font-bold text-white">${amount.toFixed(2)}</div>
                {courseName && (
                  <div className="text-sm text-zinc-400 mt-2">For: {courseName}</div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethod('card')}
                  className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between"
                >
                  <span>💳 Credit/Debit Card</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => handlePaymentMethod('paypal')}
                  className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between"
                >
                  <span>🔵 PayPal</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => handlePaymentMethod('stripe')}
                  className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between"
                >
                  <span>💳 Stripe</span>
                  <span>→</span>
                </button>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={handleDummyPayment}
                  className="w-full p-4 bg-white text-black rounded-xl hover:bg-zinc-200 font-semibold transition-all"
                >
                  🎯 Use Dummy Payment (Test)
                </button>
                <p className="text-xs text-zinc-400 text-center mt-2">
                  Click for instant test payment
                </p>
              </div>
            </div>
          )}

          {step === 'details' && paymentMethod === 'card' && (
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                  maxLength={19}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Expiry</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">CVV</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white focus:border-white transition-all"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('method');
                    setPaymentMethod(null);
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
                >
                  Pay ${amount.toFixed(2)}
                </button>
              </div>
            </form>
          )}

          {step === 'details' && (paymentMethod === 'paypal' || paymentMethod === 'stripe') && (
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-6 text-center border border-zinc-700">
                <div className="text-4xl mb-4">
                  {paymentMethod === 'paypal' ? '🔵' : '💳'}
                </div>
                <p className="text-white font-semibold mb-2">
                  {paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'} Payment
                </p>
                <p className="text-zinc-400 text-sm">
                  You will be redirected to {paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'} to complete payment
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep('method');
                    setPaymentMethod(null);
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleDummyPayment}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all font-semibold"
                >
                  Continue (Dummy)
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white font-semibold text-lg">Processing Payment...</p>
              <p className="text-zinc-400 text-sm mt-2">Please wait</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-white font-semibold text-xl mb-2">Payment Successful!</p>
              <p className="text-zinc-400 text-sm">Your payment has been processed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

