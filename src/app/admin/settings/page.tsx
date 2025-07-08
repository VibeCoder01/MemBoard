
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Settings } from '@/lib/data';
import { defaultSettings } from '@/lib/data';
import { getSettings, saveSettings } from '@/lib/settings-db';

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const dbSettings = await getSettings();
            setSettings(dbSettings);
            document.documentElement.classList.toggle('dark', dbSettings.theme === 'dark');
            try {
              localStorage.setItem('memboard-theme', dbSettings.theme);
            } catch {}
        } catch (error) {
            console.error("Failed to load settings from database", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load saved settings. Using defaults.',
            });
        }
        setIsLoading(false);
    }
    fetchSettings();
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

  const handleSelectChange = (id: keyof Settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]:
        id === 'photoDisplayMode' || id === 'theme' || id === 'photoZoomCurve'
          ? value
          : Number(value),
    }));
    if (id === 'theme') {
      document.documentElement.classList.toggle('dark', value === 'dark');
      try {
        localStorage.setItem('memboard-theme', value);
      } catch {}
    }
  };

  const handleSaveChanges = async () => {
    try {
      await saveSettings(settings);
      try {
        localStorage.setItem('memboard-theme', settings.theme);
        localStorage.setItem('memboard-settings-updated', Date.now().toString());
      } catch {}
      toast({
        title: 'Settings Saved',
        description: 'Your configuration has been updated successfully.',
      });
    } catch (error) {
      console.error("Failed to save settings to database", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings.',
      });
    }
  };
  
  const handleResetToDefaults = () => {
    setSettings(defaultSettings);
    document.documentElement.classList.toggle('dark', defaultSettings.theme === 'dark');
    try {
      localStorage.setItem('memboard-theme', defaultSettings.theme);
    } catch {}
    toast({
        title: 'Settings Reset',
        description: 'Settings have been reset to their default values. Click "Save Changes" to apply.',
    });
  };

  const isDisabled = isLoading;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Configuration Settings
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetToDefaults} disabled={isDisabled}>Reset to Defaults</Button>
          <Button onClick={handleSaveChanges} disabled={isDisabled}>Save Changes</Button>
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
                <Input id="photoDuration" type="number" value={settings.photoDuration} onChange={handleInputChange} disabled={isDisabled}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="blankDuration">Blank Screen Pause (seconds)</Label>
                <Input id="blankDuration" type="number" value={settings.blankDuration} onChange={handleInputChange} disabled={isDisabled}/>
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
                <Switch id="displayPhotos" checked={settings.displayPhotos} onCheckedChange={(checked) => handleSwitchChange('displayPhotos', checked)} disabled={isDisabled}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="displayMessages" className="flex flex-col space-y-1">
                    <span>Display Messages</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Include messages in the display rotation.
                    </span>
                </Label>
                <Switch id="displayMessages" checked={settings.displayMessages} onCheckedChange={(checked) => handleSwitchChange('displayMessages', checked)} disabled={isDisabled}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="useBlankScreens" className="flex flex-col space-y-1">
                    <span>Use Blank Screens</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show a blank screen between each content item.
                    </span>
                </Label>
                <Switch id="useBlankScreens" checked={settings.useBlankScreens} onCheckedChange={(checked) => handleSwitchChange('useBlankScreens', checked)} disabled={isDisabled}/>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="randomize" className="flex flex-col space-y-1">
                    <span>Randomize Content Order</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show photos and messages in a random order.
                    </span>
                </Label>
                <Switch id="randomize" checked={settings.randomize} onCheckedChange={(checked) => handleSwitchChange('randomize', checked)} disabled={isDisabled}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="randomizeAllPhotos" className="flex flex-col space-y-1">
                    <span>Randomize Across All Photos</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        If enabled, ignores groups and shuffles all photos together.
                    </span>
                </Label>
                <Switch id="randomizeAllPhotos" checked={settings.randomizeAllPhotos} onCheckedChange={(checked) => handleSwitchChange('randomizeAllPhotos', checked)} disabled={isDisabled}/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="randomizeInPhotoGroups" className="flex flex-col space-y-1">
                    <span>Randomize Within Photo Groups</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Shuffles the order of photos inside each group.
                    </span>
                </Label>
                <Switch id="randomizeInPhotoGroups" checked={settings.randomizeInPhotoGroups} onCheckedChange={(checked) => handleSwitchChange('randomizeInPhotoGroups', checked)} disabled={isDisabled}/>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="monitorActivity" className="flex flex-col space-y-1">
                    <span>Monitor Activity</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Show detailed activity status in the view mode footer.
                    </span>
                </Label>
                <Switch id="monitorActivity" checked={settings.monitorActivity} onCheckedChange={(checked) => handleSwitchChange('monitorActivity', checked)} disabled={isDisabled}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="theme">Theme Mode</Label>
                <Select value={settings.theme} onValueChange={(val) => handleSelectChange('theme', val)}>
                    <SelectTrigger id="theme"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-3">
                <Label htmlFor="scrollSpeed">Message Scroll Speed ({settings.scrollSpeed}%)</Label>
                <Slider id="scrollSpeed" value={[settings.scrollSpeed]} onValueChange={(value) => handleSliderChange('scrollSpeed', value)} max={100} step={1} disabled={isDisabled}/>
            </div>
            <div className="space-y-3">
                <Label htmlFor="messageFontSize">Message Font Size ({settings.messageFontSize}px)</Label>
                <Slider id="messageFontSize" value={[settings.messageFontSize]} onValueChange={(value) => handleSliderChange('messageFontSize', value)} min={24} max={250} step={1} disabled={isDisabled}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="photoDisplayMode">Photo Display Mode</Label>
                <Select value={settings.photoDisplayMode} onValueChange={(val) => handleSelectChange('photoDisplayMode', val)}>
                    <SelectTrigger id="photoDisplayMode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="maxWidthCrop">Max Width (Crop Vertical)</SelectItem>
                        <SelectItem value="maxHeightCrop">Max Height (Crop Horizontal)</SelectItem>
                        <SelectItem value="noCrop">No Cropping</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="photoZoomCurve">Photo Zoom Curve</Label>
                <Select value={settings.photoZoomCurve} onValueChange={(val) => handleSelectChange('photoZoomCurve', val)}>
                    <SelectTrigger id="photoZoomCurve"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="cubic">Cubic</SelectItem>
                        <SelectItem value="sigmoid">Sigmoid</SelectItem>
                        <SelectItem value="quadratic">Quadratic</SelectItem>
                        <SelectItem value="exponential">Exponential</SelectItem>
                        <SelectItem value="logarithmic">Logarithmic</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-3">
                <Label htmlFor="photoZoomCurveMultiplier">Curve Multiplier ({settings.photoZoomCurveMultiplier}x)</Label>
                <Slider
                    id="photoZoomCurveMultiplier"
                    value={[settings.photoZoomCurveMultiplier]}
                    onValueChange={(value) => handleSliderChange('photoZoomCurveMultiplier', value)}
                    min={0.5}
                    max={5}
                    step={0.1}
                    disabled={isDisabled}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="morningStartHour">Morning Starts</Label>
                <Select value={String(settings.morningStartHour)} onValueChange={(val) => handleSelectChange('morningStartHour', val)}>
                    <SelectTrigger id="morningStartHour"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{`${i}:00`}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="afternoonStartHour">Afternoon Starts</Label>
                <Select value={String(settings.afternoonStartHour)} onValueChange={(val) => handleSelectChange('afternoonStartHour', val)}>
                    <SelectTrigger id="afternoonStartHour"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{`${i}:00`}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="eveningStartHour">Evening Starts</Label>
                <Select value={String(settings.eveningStartHour)} onValueChange={(val) => handleSelectChange('eveningStartHour', val)}>
                    <SelectTrigger id="eveningStartHour"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{`${i}:00`}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="nightStartHour">Night Starts</Label>
                <Select value={String(settings.nightStartHour)} onValueChange={(val) => handleSelectChange('nightStartHour', val)}>
                    <SelectTrigger id="nightStartHour"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{`${i}:00`}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
