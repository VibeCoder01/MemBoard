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
import type { Settings } from '@/lib/data';
import { defaultSettings } from '@/lib/data';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('displaySettings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
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

  const handleSwitchChange = (id: keyof Settings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSliderChange = (id: keyof Settings, value: number[]) => {
    setSettings((prev) => ({ ...prev, [id]: value[0] }));
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
                <Label htmlFor="displayPhotos" className="flex flex-col space-y-1">
                    <span>Display Photos</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Include photos in the display rotation.
                    </span>
                </Label>
                <Switch id="displayPhotos" checked={settings.displayPhotos} onCheckedChange={(checked) => handleSwitchChange('displayPhotos', checked)}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="displayMessages" className="flex flex-col space-y-1">
                    <span>Display Messages</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Include messages in the display rotation.
                    </span>
                </Label>
                <Switch id="displayMessages" checked={settings.displayMessages} onCheckedChange={(checked) => handleSwitchChange('displayMessages', checked)}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="useBlankScreens" className="flex flex-col space-y-1">
                    <span>Use Blank Screens</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show a blank screen between each content item.
                    </span>
                </Label>
                <Switch id="useBlankScreens" checked={settings.useBlankScreens} onCheckedChange={(checked) => handleSwitchChange('useBlankScreens', checked)}/>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="randomize" className="flex flex-col space-y-1">
                    <span>Randomize Content Order</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show photos and messages in a random order.
                    </span>
                </Label>
                <Switch id="randomize" checked={settings.randomize} onCheckedChange={(checked) => handleSwitchChange('randomize', checked)}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="randomizeAllPhotos" className="flex flex-col space-y-1">
                    <span>Randomize Across All Photos</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        If enabled, ignores groups and shuffles all photos together.
                    </span>
                </Label>
                <Switch id="randomizeAllPhotos" checked={settings.randomizeAllPhotos} onCheckedChange={(checked) => handleSwitchChange('randomizeAllPhotos', checked)} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="randomizeInPhotoGroups" className="flex flex-col space-y-1">
                    <span>Randomize Within Photo Groups</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Shuffles the order of photos inside each group.
                    </span>
                </Label>
                <Switch id="randomizeInPhotoGroups" checked={settings.randomizeInPhotoGroups} onCheckedChange={(checked) => handleSwitchChange('randomizeInPhotoGroups', checked)} />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="monitorActivity" className="flex flex-col space-y-1">
                    <span>Monitor Activity</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show detailed activity status in the view mode footer.
                    </span>
                </Label>
                <Switch id="monitorActivity" checked={settings.monitorActivity} onCheckedChange={(checked) => handleSwitchChange('monitorActivity', checked)}/>
            </div>
            <div className="space-y-3">
                <Label htmlFor="scrollSpeed">Message Scroll Speed ({settings.scrollSpeed}%)</Label>
                <Slider id="scrollSpeed" value={[settings.scrollSpeed]} onValueChange={(value) => handleSliderChange('scrollSpeed', value)} max={100} step={1} />
            </div>
            <div className="space-y-3">
                <Label htmlFor="messageFontSize">Message Font Size ({settings.messageFontSize}px)</Label>
                <Slider id="messageFontSize" value={[settings.messageFontSize]} onValueChange={(value) => handleSliderChange('messageFontSize', value)} min={24} max={250} step={1} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
