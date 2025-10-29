"use client"

import { Star } from "lucide-react"

interface RatingDisplayProps {
  rating: number
  totalReviews?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
}

export function RatingDisplay({ 
  rating, 
  totalReviews = 0, 
  size = "md", 
  showCount = true 
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating)
          const partial = star === Math.ceil(rating) && rating % 1 !== 0
          
          return (
            <div key={star} className="relative">
              <Star 
                className={`${sizeClasses[size]} ${
                  filled ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-600"
                }`}
              />
              {partial && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(rating % 1) * 100}%` }}
                >
                  <Star className={`${sizeClasses[size]} fill-[#FFD700] text-[#FFD700]`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {showCount && (
        <span className={`${textSizeClasses[size]} text-gray-400`}>
          {rating.toFixed(1)} {totalReviews > 0 && `(${totalReviews})`}
        </span>
      )}
    </div>
  )
}

