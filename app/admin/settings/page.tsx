'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X, Settings, Save, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RestaurantSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url?: string;
  description?: string;
}

export default function RestaurantSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string>('');

  const [formData, setFormData] = useState<RestaurantSettings>({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo_url: '',
    description: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (!auth) return;

    try {
      const authData = JSON.parse(auth);
      setRestaurantId(authData.restaurant_id);
      fetchRestaurantSettings(authData.restaurant_id);
    } catch (error) {
      console.error('Failed to parse auth:', error);
    }
  }, []);

  const fetchRestaurantSettings = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/restaurants/${id}`, {
        headers: {
          'X-Restaurant-ID': id,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          logo_url: data.logo_url || '',
          description: data.description || '',
        });
        if (data.logo_url) {
          setLogoPreview(
            data.logo_url.startsWith('/')
              ? `${BASE_URL}${data.logo_url}`
              : data.logo_url
          );
        }
      }
    } catch (error) {
      toast.error('Failed to load restaurant settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoFile(file);
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({
      ...prev,
      logo_url: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // If there's a new logo file, upload it separately
      if (logoFile) {
        const formDataWithLogo = new FormData();
        formDataWithLogo.append('file', logoFile);

        const uploadRes = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}/logo`, {
          method: 'PATCH',
          headers: {
            'X-Restaurant-ID': restaurantId,
          },
          body: formDataWithLogo,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload logo');
        }
      }

      // Update restaurant info
      const updateRes = await fetch(`${BASE_URL}/api/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: {
          'X-Restaurant-ID': restaurantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update restaurant info');
      }

      toast.success('Settings saved successfully');
      setLogoFile(null);
      await fetchRestaurantSettings(restaurantId);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Restaurant Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant information and branding</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Logo</CardTitle>
            <CardDescription>Upload a logo to be displayed in your customer portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoPreview ? (
              <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={logoPreview.startsWith('/') ? `${BASE_URL}${logoPreview}` : logoPreview}
                  alt="Logo Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-contain p-4"
                />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your restaurant's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your restaurant name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@restaurant.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Restaurant</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell your customers about your restaurant..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900 dark:text-blue-200">Portal URL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono text-blue-700 dark:text-blue-300 break-all">
              {typeof window !== 'undefined' ? window.location.origin : ''}/[your-portal-url]
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-900 dark:text-green-200">Restaurant ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono text-green-700 dark:text-green-300 truncate">
              {restaurantId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
