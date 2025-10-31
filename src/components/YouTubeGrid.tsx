import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.trim().match(pattern)
    if (match) {
      return match[1]
    }
  }
  return null
}

const DEFAULT_URLS = `https://www.youtube.com/watch?v=S0qzrYXn7Sw
https://www.youtube.com/watch?v=U235YxnIVJY
https://www.youtube.com/watch?v=LKLZnWfVbhY
https://www.youtube.com/watch?v=qOXZQfMum8M
https://www.youtube.com/watch?v=oCFhj7znXqQ
https://www.youtube.com/watch?v=fFu9rMKVUWk
https://www.youtube.com/watch?v=y4sVsAGadqM
https://www.youtube.com/watch?v=UH-ruQEyg8o
https://www.youtube.com/watch?v=Yuyxq7YFcAY`

export function YouTubeGrid() {
  const [urlInput, setUrlInput] = useState(DEFAULT_URLS)
  const [videoIds, setVideoIds] = useState<(string | null)[]>(() => {
    const urls = DEFAULT_URLS.split('\n').filter(line => line.trim())
    const ids = urls.slice(0, 9).map(url => extractVideoId(url))
    return [...ids, ...Array(9 - ids.length).fill(null)].slice(0, 9)
  })

  const handleLoadVideos = () => {
    const urls = urlInput.split('\n').filter(line => line.trim())
    const ids = urls.slice(0, 9).map(url => extractVideoId(url))

    // Fill remaining slots with null
    const paddedIds = [...ids, ...Array(9 - ids.length).fill(null)].slice(0, 9)
    setVideoIds(paddedIds)
  }

  const handleClear = () => {
    setUrlInput('')
    setVideoIds(Array(9).fill(null))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {videoIds.map((videoId, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={`YouTube video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 text-sm">
                    Slot {index + 1}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>YouTube Parallel Player</CardTitle>
            <CardDescription>
              Load up to 9 YouTube videos in a 3x3 grid. Paste URLs below (one per line).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste YouTube URLs here (one per line)&#10;Example:&#10;https://www.youtube.com/watch?v=dQw4w9WgXcQ&#10;https://youtu.be/dQw4w9WgXcQ&#10;dQw4w9WgXcQ"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleLoadVideos}>Load Videos</Button>
              <Button variant="outline" onClick={handleClear}>Clear</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
