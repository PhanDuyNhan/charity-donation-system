"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProjectGalleryProps {
  images: string[]
  projectTitle: string
}

export function ProjectGallery({ images, projectTitle }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative h-32 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`${projectTitle} - Ảnh ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl w-full p-0 border-0 bg-black/95">
          <div className="relative w-full aspect-video flex items-center justify-center">
            {selectedIndex !== null && (
              <>
                <img
                  src={images[selectedIndex] || "/placeholder.svg"}
                  alt={`${projectTitle} - Ảnh ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {/* Navigation buttons */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
