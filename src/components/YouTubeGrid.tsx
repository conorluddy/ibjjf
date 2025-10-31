import { useState, useEffect, useRef } from 'react'
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
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)
  const [gridColumns, setGridColumns] = useState(3)
  const playersRef = useRef<(YT.Player | null)[]>(Array(9).fill(null))
  const apiReadyRef = useRef(false)

  // Initialize YouTube API
  useEffect(() => {
    if (typeof window !== 'undefined' && !apiReadyRef.current) {
      // @ts-ignore - YT is loaded via script tag
      if (window.YT && window.YT.Player) {
        apiReadyRef.current = true
      } else {
        // @ts-ignore
        window.onYouTubeIframeAPIReady = () => {
          apiReadyRef.current = true
        }
      }
    }
  }, [])

  // Create YouTube players when video IDs change
  useEffect(() => {
    if (!apiReadyRef.current) return

    const createPlayer = (index: number, videoId: string) => {
      const elementId = `player-${index}`
      const element = document.getElementById(elementId)
      if (!element) return

      // Destroy existing player
      if (playersRef.current[index]) {
        playersRef.current[index]?.destroy()
      }

      // @ts-ignore - YT is loaded via script tag
      playersRef.current[index] = new window.YT.Player(elementId, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            // Players start muted by default
          },
        },
      })
    }

    // Wait a tick for DOM to update
    const timer = setTimeout(() => {
      videoIds.forEach((videoId, index) => {
        if (videoId && apiReadyRef.current) {
          createPlayer(index, videoId)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      playersRef.current.forEach(player => player?.destroy())
      playersRef.current = Array(9).fill(null)
    }
  }, [videoIds])

  const handleLoadVideos = () => {
    const urls = urlInput.split('\n').filter(line => line.trim())
    const ids = urls.slice(0, 9).map(url => extractVideoId(url))
    const paddedIds = [...ids, ...Array(9 - ids.length).fill(null)].slice(0, 9)
    setVideoIds(paddedIds)
    setPinnedIndex(null)
  }

  const handleClear = () => {
    setUrlInput('')
    setVideoIds(Array(9).fill(null))
    setPinnedIndex(null)
  }

  const handlePin = (index: number) => {
    if (pinnedIndex === index) {
      // Unpin - mute all
      setPinnedIndex(null)
      playersRef.current.forEach(player => player?.mute())
    } else {
      // Pin new video - unmute it, mute others
      setPinnedIndex(index)
      playersRef.current.forEach((player, i) => {
        if (i === index) {
          player?.unMute()
        } else {
          player?.mute()
        }
      })
    }
  }

  // Reorder videos: pinned first, then others
  const orderedVideos = pinnedIndex !== null
    ? [
        { videoId: videoIds[pinnedIndex], originalIndex: pinnedIndex, isPinned: true },
        ...videoIds
          .map((vid, idx) => ({ videoId: vid, originalIndex: idx, isPinned: false }))
          .filter((_, idx) => idx !== pinnedIndex)
      ]
    : videoIds.map((vid, idx) => ({ videoId: vid, originalIndex: idx, isPinned: false }))

  // Generate dynamic grid class based on column count
  const getGridClass = () => {
    const colClasses: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
      7: 'grid-cols-1 md:grid-cols-4 lg:grid-cols-7',
      8: 'grid-cols-1 md:grid-cols-4 lg:grid-cols-8',
      9: 'grid-cols-1 md:grid-cols-5 lg:grid-cols-9',
    }
    return colClasses[gridColumns] || colClasses[3]
  }

  return (
    <div className="min-h-screen bg-[#222] p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col gap-6 w-full">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
          Yup Adam and ECJJA!
        </h1>

        {/* Grid Size Selector */}
        <div className="flex justify-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cols) => (
            <Button
              key={cols}
              variant={gridColumns === cols ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGridColumns(cols)}
              className="w-10 h-10 p-0"
            >
              {cols}
            </Button>
          ))}
        </div>

        {/* Video Grid */}
        <div className={`grid ${getGridClass()} gap-4`}>
          {orderedVideos.map((item) => {
            const { videoId, originalIndex, isPinned } = item

            // Pinned video takes full width
            if (isPinned && pinnedIndex !== null) {
              const colSpanClass = `col-span-full`
              return (
                <Card key={originalIndex} className={`overflow-hidden border-2 border-blue-500 ${colSpanClass}`}>
                  <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    <div id={`player-${originalIndex}`} className="w-full h-full"></div>
                  </div>
                  <div className="p-2 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePin(originalIndex)}
                    >
                      Unpin
                    </Button>
                  </div>
                </Card>
              )
            }

            return (
              <Card key={originalIndex} className="overflow-hidden">
                <div className="aspect-video bg-slate-800 flex items-center justify-center">
                  {videoId ? (
                    <div id={`player-${originalIndex}`} className="w-full h-full"></div>
                  ) : (
                    <span className="text-slate-500 text-sm">
                      Slot {originalIndex + 1}
                    </span>
                  )}
                </div>
                {videoId && (
                  <div className="p-2 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePin(originalIndex)}
                    >
                      Pin
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg">IBJJF Video Grid</CardTitle>
            <CardDescription className="text-xs">
              Load up to 9 YouTube videos. Paste URLs below (one per line).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 py-3">
            <Textarea
              placeholder="Paste YouTube URLs here (one per line)&#10;Example:&#10;https://www.youtube.com/watch?v=dQw4w9WgXcQ&#10;https://youtu.be/dQw4w9WgXcQ&#10;dQw4w9WgXcQ"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="min-h-[60px] font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button onClick={handleLoadVideos} size="sm">Load Videos</Button>
              <Button variant="outline" onClick={handleClear} size="sm">Clear</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
