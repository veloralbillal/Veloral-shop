import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, CheckCircle2, Clock, ThumbsUp } from 'lucide-react';
import { Review, User as AppUser, Order } from '../types';
import { fetchReviews, addReview } from '../services/db';

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  currentUser?: AppUser | null;
  orders: Order[];
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productTitle,
  currentUser,
  orders,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const data = await fetchReviews(productId);
    setReviews(data);
    setIsLoading(false);
  };

  // Check if user is verified purchaser
  const isVerifiedPurchaser = currentUser && orders.some(o => 
    o.status === 'completed' && 
    (o.customer_email === currentUser.email || o.customer_phone === currentUser.phone) &&
    o.items_summary.toLowerCase().includes(productTitle.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!comment.trim()) {
      setMessage({ type: 'error', text: 'Please enter a comment.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        product_id: productId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        rating,
        comment: comment.trim(),
      });
      setMessage({ type: 'success', text: 'Review submitted successfully!' });
      setComment('');
      setRating(5);
      setShowForm(false);
      loadReviews();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit review.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Customer Reviews ({reviews.length})
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Number(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-600">{averageRating} out of 5</span>
          </div>
        </div>

        {isVerifiedPurchaser && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95"
          >
            Write a Review
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 block">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform hover:scale-110 active:scale-90"
                >
                  <Star
                    className={`w-8 h-8 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 block">Your Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none min-h-[120px] transition-all text-sm"
              placeholder="Tell us what you think about this product..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-2xl border border-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      {review.user_name}
                      <span className="flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                "{review.comment}"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="w-3 h-3" />
                  Helpful
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
