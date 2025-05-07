"use client";

import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    weightGoal: '',
    lossRate: '0.0055',
    carbFatRatio: '0.6',
    bufferValue: '0.0075'
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const session = await getSession();
        if (!session) return;

        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings({
              weightGoal: data.settings.weightGoal?.toString() || '',
              lossRate: data.settings.lossRate?.toString() || '0.0055',
              carbFatRatio: data.settings.carbFatRatio?.toString() || '0.6',
              bufferValue: data.settings.bufferValue?.toString() || '0.0075'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weightGoal: settings.weightGoal ? parseFloat(settings.weightGoal) : null,
          lossRate: settings.lossRate ? parseFloat(settings.lossRate) : null,
          carbFatRatio: settings.carbFatRatio ? parseFloat(settings.carbFatRatio) : null,
          bufferValue: settings.bufferValue ? parseFloat(settings.bufferValue) : null,
        }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setMessageType('success');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to save settings');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('An error occurred while saving settings');
      setMessageType('error');
    } finally {
      setLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>
      
      {message && (
        <Alert 
          variant={messageType === 'success' ? 'success' : 'error'} 
          className="mb-6"
        >
          {message}
        </Alert>
      )}
      
      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <FormInput
            type="number"
            id="weightGoal"
            name="weightGoal"
            label="Weight Goal"
            step="0.1"
            value={settings.weightGoal}
            onChange={handleChange}
            placeholder="Enter your target weight"
            description="Your target weight in the same units as your entries"
          />

          <FormInput
            type="number"
            id="lossRate"
            name="lossRate"
            label="Weight Loss Rate"
            step="0.01"
            value={settings.lossRate}
            onChange={handleChange}
            placeholder="Enter desired weight loss rate"
            description="Desired weight loss per week"
          />

          <FormInput
            type="number"
            id="carbFatRatio"
            name="carbFatRatio"
            label="Carb/Fat Ratio"
            step="0.01"
            value={settings.carbFatRatio}
            onChange={handleChange}
            placeholder="Enter your preferred carb/fat ratio"
            description="Your preferred ratio of carbohydrates to fats"
          />

          <FormInput
            type="number"
            id="bufferValue"
            name="bufferValue"
            label="Buffer Value"
            step="0.1"
            value={settings.bufferValue}
            onChange={handleChange}
            placeholder="Enter buffer value"
            description="Buffer value for your weight loss calculations"
            className="mb-6"
          />

          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            fullWidth
          >
            Save Settings
          </Button>
        </form>
      </Card>

      {/* Data Management Section */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Import Data</h3>
            <p className="text-sm mb-3">
              Import historic data from Excel spreadsheets with structured measurement data.
            </p>
            <a 
              href="/import" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import from Excel
            </a>
          </div>

          {/* Room for future data management options */}
        </div>
      </Card>
    </div>
  );
}