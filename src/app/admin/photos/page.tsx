import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const photoGroups = {
  family: [
    { id: 1, src: 'https://placehold.co/400x300', alt: 'Family at the beach', 'data-ai-hint': 'family beach' },
    { id: 2, src: 'https://placehold.co/400x300', alt: 'Grandparents smiling', 'data-ai-hint': 'old couple' },
  ],
  events: [
    { id: 3, src: 'https://placehold.co/400x300', alt: 'Birthday party', 'data-ai-hint': 'birthday party' },
  ],
  scenery: [
     { id: 4, src: 'https://placehold.co/400x300', alt: 'Mountain landscape', 'data-ai-hint': 'mountain landscape' },
     { id: 5, src: 'https://placehold.co/400x300', alt: 'City skyline at night', 'data-ai-hint': 'city night' },
     { id: 6, src: 'https://placehold.co/400x300', alt: 'Forest path', 'data-ai-hint': 'forest path' },
  ]
}

export default function PhotosPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Photo Management
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Photo
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Photo Library</CardTitle>
          <CardDescription>
            Upload, organize, and manage the photos displayed on the board.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="family" className="w-full">
            <TabsList>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="scenery">Scenery</TabsTrigger>
            </TabsList>
            <TabsContent value="family">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoGroups.family.map(p => <PhotoCard key={p.id} {...p} />)}
              </div>
            </TabsContent>
            <TabsContent value="events">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoGroups.events.map(p => <PhotoCard key={p.id} {...p} />)}
              </div>
            </TabsContent>
            <TabsContent value="scenery">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoGroups.scenery.map(p => <PhotoCard key={p.id} {...p} />)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PhotoCard({ src, alt, 'data-ai-hint': dataAiHint }: { src: string, alt: string, 'data-ai-hint': string }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image src={src} alt={alt} layout="fill" objectFit="cover" data-ai-hint={dataAiHint} />
      </div>
      <CardContent className="p-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground truncate">{alt}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
