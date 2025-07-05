'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

type Settings = {
  photoDuration: number;
  messageDuration: number;
  blankDuration: number;
  randomize: boolean;
  scrollSpeed: number;
};

const defaultSettings: Settings = {
  photoDuration: 10,
  messageDuration: 15,
  blankDuration: 3,
  randomize: false,
  scrollSpeed: 50,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('displaySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load saved settings.',
      });
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setSettings((prev) => ({ ...prev, randomize: checked }));
  };

  const handleSliderChange = (value: number[]) => {
    setSettings((prev) => ({ ...prev, scrollSpeed: value[0] }));
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('displaySettings', JSON.stringify(settings));
      toast({
        title: 'Settings Saved',
        description: 'Your configuration has been updated successfully.',
      });
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings.',
      });
    }
  };
  
  const handleResetToDefaults = () => {
    setSettings(defaultSettings);
    toast({
        title: 'Settings Reset',
        description: 'Settings have been reset to their default values. Click "Save Changes" to apply.',
    });
  };


  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Configuration Settings
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetToDefaults}>Reset to Defaults</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Display Timings</CardTitle>
          <CardDescription>
            Configure how long items are displayed on the board.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="photoDuration">Photo Display Duration (seconds)</Label>
                <Input id="photoDuration" type="number" value={settings.photoDuration} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="messageDuration">Message Display Duration (seconds)</Label>
                <Input id="messageDuration" type="number" value={settings.messageDuration} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="blankDuration">Blank Screen Pause (seconds)</Label>
                <Input id="blankDuration" type="number" value={settings.blankDuration} onChange={handleInputChange} />
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>
            Manage content rotation and animation behavior.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <Label htmlFor="randomize" className="flex flex-col space-y-1">
                    <span>Randomize Content Order</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show photos and messages in a random order.
                    </span>
                </Label>
                <Switch id="randomize" checked={settings.randomize} onCheckedChange={handleSwitchChange}/>
            </div>
            <div className="space-y-3">
                <Label htmlFor="scrollSpeed">Message Scroll Speed</Label>
                <Slider id="scrollSpeed" value={[settings.scrollSpeed]} onValueChange={handleSliderChange} max={100} step={1} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
