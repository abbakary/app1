'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Smartphone, AlertCircle, Check } from 'lucide-react';
import { isValidPhoneNumber, detectNetworkFromPhone, formatPhoneNumber } from '@/lib/payment-utils';

interface ClickPesaFormProps {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
  isLoading?: boolean;
  customerPhone?: string;
  restaurantId: string;
  orderId: string;
}

const NETWORKS = [
  { value: 'airtel', label: 'Airtel (68, 69)', color: 'from-red-500 to-red-600' },
  { value: 'tigo', label: 'Tigo (65-76)', color: 'from-blue-500 to-blue-600' },
  { value: 'halotel', label: 'Halotel (62-64)', color: 'from-purple-500 to-purple-600' },
];

export function ClickPesaForm({
  amount,
  onSuccess,
  onBack,
  isLoading = false,
  customerPhone = '',
  restaurantId,
  orderId,
}: ClickPesaFormProps) {
  const [phone, setPhone] = useState(customerPhone);
  const [network, setNetwork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedNetwork, setDetectedNetwork] = useState<string | null>(null);

  useEffect(() => {
    if (phone) {
      const detected = detectNetworkFromPhone(phone);
      setDetectedNetwork(detected);
      if (detected && !network) {
        setNetwork(detected);
      }
    } else {
      setDetectedNetwork(null);
    }
  }, [phone, network]);

  const isPhoneValid = isValidPhoneNumber(phone);
  const isFormValid = isPhoneValid && network;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove non-digit characters except leading +
    value = value.replace(/[^\d+]/g, '');
    if (value.startsWith('+')) {
      value = '+' + value.substring(1).replace(/[^\d]/g, '');
    }
    setPhone(value);
  };

  const handlePayment = async () => {
    if (!isFormValid) {
      toast.error('Please enter a valid phone number and select a network');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${baseUrl}/api/payments/clickpesa/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Restaurant-ID': restaurantId,
        },
        body: JSON.stringify({
          amount,
          network: network.toLowerCase(),
          customer_phone: formatPhoneNumber(phone),
          tenant_id: restaurantId,
          order_reference: orderId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData.detail || 'Payment initiation failed';
        toast.error(errorMsg);
        return;
      }

      // Store the transaction reference
      sessionStorage.setItem('pendingTransactionId', responseData.transaction_id || '');
      
      toast.success('Payment request sent to your mobile money account', {
        description: 'Please complete the payment on your phone'
      });
      
      onSuccess();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center mx-auto">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Mobile Money Payment</h3>
        <p className="text-gray-500 font-medium">Pay via ClickPesa - Fast & Secure</p>
      </div>

      {/* Amount Display */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
          <span className="text-3xl font-black text-gray-900 dark:text-white">TSH {amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Network Selection */}
      <div className="space-y-3">
        <Label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] px-1">
          Mobile Network
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {NETWORKS.map((n) => (
            <button
              key={n.value}
              onClick={() => setNetwork(n.value)}
              className={`p-4 rounded-[16px] border-2 transition-all duration-300 flex flex-col items-center gap-2 active:scale-95 ${
                network === n.value
                  ? `border-primary bg-primary/10 shadow-lg shadow-primary/20`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/20'
              }`}
            >
              <span className={`text-sm font-bold ${network === n.value ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>
                {n.label.split('(')[0].trim()}
              </span>
              <span className="text-xs text-gray-400 font-medium">{n.label.match(/\(([^)]+)\)/)?.[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Input */}
      <div className="space-y-3">
        <Label htmlFor="phone" className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] px-1">
          Phone Number
        </Label>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            placeholder="+255 7XX XXX XXX"
            value={phone}
            onChange={handlePhoneChange}
            className="h-14 rounded-2xl bg-white dark:bg-gray-900 border-none shadow-sm font-semibold focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
          />
          {phone && !isPhoneValid && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
          {phone && isPhoneValid && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        {!isPhoneValid && phone && (
          <p className="text-xs text-red-500 font-medium">Invalid phone number. Expected +255 format or 0xxxxxxxxx</p>
        )}
        {detectedNetwork && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            Network detected: <span className="font-bold capitalize">{detectedNetwork}</span>
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-[16px]">
        <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
          A payment prompt will be sent to your phone. Enter your mobile money PIN to complete the payment.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={handlePayment}
          disabled={!isFormValid || isSubmitting || isLoading}
          className="h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            `Pay TSH ${amount.toLocaleString()}`
          )}
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-400 font-bold text-xs uppercase tracking-widest h-10 hover:text-gray-600"
          disabled={isSubmitting || isLoading}
        >
          Back to Cart
        </Button>
      </div>
    </div>
  );
}
