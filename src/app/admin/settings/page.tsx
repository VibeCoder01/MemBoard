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

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Configuration Settings
        </h1>
        <Button>Save Changes</Button>
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
                <Label htmlFor="photo-duration">Photo Display Duration (seconds)</Label>
                <Input id="photo-duration" type="number" defaultValue="10" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message-duration">Message Display Duration (seconds)</Label>
                <Input id="message-duration" type="number" defaultValue="15" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="blank-duration">Blank Screen Pause (seconds)</Label>
                <Input id="blank-duration" type="number" defaultValue="3" />
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
                <Switch id="randomize" />
            </div>
            <div className="space-y-3">
                <Label htmlFor="scroll-speed">Message Scroll Speed</Label>
                <Slider id="scroll-speed" defaultValue={[50]} max={100} step={1} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
