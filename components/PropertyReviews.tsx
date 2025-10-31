"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Flag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Review {
  id: string;
  rating: number;
  cleanliness_rating: number;
  accuracy_rating: number;
  communication_rating: number;
  location_rating: number;
  value_rating: number;
  title: string;
  comment: string;
  created_at: string;
  host_response: string;
  host_response_date: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  review_images: Array<{
    image_url: string;
    caption: string;
  }>;
}

interface ReviewStatistics {
  total_reviews: number;
  avg_rating: number;
  avg_cleanliness: number;
  avg_accuracy: number;
  avg_communication: number;
  avg_location: number;
  avg_value: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

interface PropertyReviewsProps {
  propertyId: string;
  isHost?: boolean;
  onRespondToReview?: (reviewId: string, response: string) => void;
}

export function PropertyReviews({
  propertyId,
  isHost = false,
  onRespondToReview,
}: PropertyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [hostResponse, setHostResponse] = useState("");

  useEffect(() => {
    loadReviews();
  }, [propertyId, sortBy]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reviews?property_id=${propertyId}&status=published&limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        let sortedReviews = data.reviews || [];

        // Apply sorting
        if (sortBy === "recent") {
          sortedReviews.sort(
            (a: Review, b: Review) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        } else if (sortBy === "highest") {
          sortedReviews.sort((a: Review, b: Review) => b.rating - a.rating);
        } else if (sortBy === "lowest") {
          sortedReviews.sort((a: Review, b: Review) => a.rating - b.rating);
        }

        setReviews(sortedReviews);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (reviewId: string) => {
    if (!hostResponse.trim()) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          host_response: hostResponse,
        }),
      });

      if (response.ok) {
        setRespondingTo(null);
        setHostResponse("");
        loadReviews();
        if (onRespondToReview) {
          onRespondToReview(reviewId, hostResponse);
        }
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StarRating = ({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-slate-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading reviews...</p>
      </div>
    );
  }

  if (!statistics || reviews.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="py-12 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No reviews yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Be the first to review this property after your stay!
          </p>
        </CardContent>
      </Card>
    );
  }

  const ratingDistribution = [
    { stars: 5, count: statistics.five_star_count },
    { stars: 4, count: statistics.four_star_count },
    { stars: 3, count: statistics.three_star_count },
    { stars: 2, count: statistics.two_star_count },
    { stars: 1, count: statistics.one_star_count },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Rating Overview */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="flex items-end gap-3 sm:gap-4">
                <div className="text-5xl sm:text-6xl font-light text-slate-900 dark:text-white">
                  {statistics.avg_rating.toFixed(1)}
                </div>
                <div className="pb-2">
                  <StarRating rating={Math.round(statistics.avg_rating)} size="lg" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {statistics.total_reviews} {statistics.total_reviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map((dist) => (
                  <div key={dist.stars} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-8">
                      {dist.stars}★
                    </span>
                    <Progress
                      value={(dist.count / statistics.total_reviews) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">
                      {dist.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Rating Categories
              </h3>
              {[
                { label: "Cleanliness", value: statistics.avg_cleanliness },
                { label: "Accuracy", value: statistics.avg_accuracy },
                { label: "Communication", value: statistics.avg_communication },
                { label: "Location", value: statistics.avg_location },
                { label: "Value", value: statistics.avg_value },
              ].map((category) => (
                <div key={category.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {category.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(category.value / 5) * 100}
                      className="w-24 sm:w-32 h-2"
                    />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white w-8">
                      {category.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white tracking-tight">
          Guest Reviews
        </h2>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 sm:space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800">
              <CardContent className="p-4 sm:p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={review.profiles.avatar_url} />
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                        {review.profiles.first_name} {review.profiles.last_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                {/* Review Title */}
                {review.title && (
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                    {review.title}
                  </h4>
                )}

                {/* Review Content */}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-sm sm:text-base">
                  {review.comment}
                </p>

                {/* Review Images */}
                {review.review_images && review.review_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {review.review_images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image.image_url}
                        alt={image.caption || "Review image"}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Category Ratings */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                  {review.cleanliness_rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 dark:text-slate-400">Cleanliness:</span>
                      <StarRating rating={review.cleanliness_rating} size="sm" />
                    </div>
                  )}
                  {review.accuracy_rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
                      <StarRating rating={review.accuracy_rating} size="sm" />
                    </div>
                  )}
                  {review.communication_rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 dark:text-slate-400">Communication:</span>
                      <StarRating rating={review.communication_rating} size="sm" />
                    </div>
                  )}
                </div>

                {/* Host Response */}
                {review.host_response && (
                  <div className="mt-4 pl-3 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 p-3 sm:p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs">
                        Response from host
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(review.host_response_date)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{review.host_response}</p>
                  </div>
                )}

                {/* Host Response Form */}
                {isHost && !review.host_response && (
                  <div className="mt-4">
                    {respondingTo === review.id ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write your response..."
                          value={hostResponse}
                          onChange={(e) => setHostResponse(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleSubmitResponse(review.id)}
                            size="sm"
                            disabled={!hostResponse.trim()}
                          >
                            Post Response
                          </Button>
                          <Button
                            onClick={() => {
                              setRespondingTo(null);
                              setHostResponse("");
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setRespondingTo(review.id)}
                        variant="outline"
                        size="sm"
                      >
                        Respond to review
                      </Button>
                    )}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white min-h-[44px] px-3"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    <span className="text-xs sm:text-sm">Helpful</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white min-h-[44px] px-3"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    <span className="text-xs sm:text-sm">Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
