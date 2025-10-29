"use client"

import { useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { RatingDisplay } from "./rating-display"
import type { Review, ServiceStats } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ReviewSectionProps {
  serviceId: string
  reviews: Review[]
  stats: ServiceStats | null
}

export function ReviewSection({ serviceId, reviews, stats }: ReviewSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 5
  
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const displayedReviews = reviews.slice(startIndex, startIndex + reviewsPerPage)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
    return { rating, count, percentage }
  })

  return (
    <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-8 backdrop-blur-xl bg-white/5 border border-white/10">
      <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>

      {/* Rating Overview */}
      {stats && stats.total_reviews > 0 ? (
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-white mb-2">
              {stats.avg_rating.toFixed(1)}
            </div>
            <RatingDisplay rating={stats.avg_rating} totalReviews={stats.total_reviews} size="lg" />
            <div className="text-sm text-gray-400 mt-2">
              Based on {stats.total_reviews} {stats.total_reviews === 1 ? "review" : "reviews"}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm text-gray-300">{rating}</span>
                  <Star className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                </div>
                <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-b border-white/10 mb-8">
          <p className="text-gray-400">No reviews yet. Be the first to review this API!</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-black/20 rounded-xl p-6 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <RatingDisplay rating={review.rating} showCount={false} />
                    {review.verified_purchase && (
                      <span className="text-xs bg-[#14F195]/20 text-[#14F195] px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-white mb-1">{review.title}</h4>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </div>
              </div>

              {review.content && (
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">{review.content}</p>
              )}

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <span className="font-mono">
                    {review.user_wallet.slice(0, 6)}...{review.user_wallet.slice(-4)}
                  </span>
                </div>
                <button className="flex items-center gap-1 text-gray-400 hover:text-[#14F195] transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful ({review.helpful_count})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No reviews to display
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

