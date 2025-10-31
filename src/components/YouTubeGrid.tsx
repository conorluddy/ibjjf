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

export function YouTubeGrid() {
  const [urlInput, setUrlInput] = useState('')
  const [videoIds, setVideoIds] = useState<(string | null)[]>(Array(9).fill(null))

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  )
}
