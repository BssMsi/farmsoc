import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Post } from '../../types/post';
import { addToCart } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { likePost, addComment } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import MediaCarousel from './MediaCarousel';
import { Product } from '@/types/product';

interface Comment {
  id: string;
  username: string;
  profileImage?: string;
  content: string;
}

interface MediaCarouselProps {
  images: string[];
  video?: string;
  productId?: string;
  onAddToCart: () => Promise<void>;
  onLoad?: () => void;
}

interface PostCardProps {
  post: Post;
  linkedProduct: Product;
}

const COMMENTS_PER_PAGE = 5;

const PostCard: React.FC<PostCardProps> = ({ post, linkedProduct }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => addComment(post.id, {
      userId: user?.id || '',
      username: user?.name || '',
      profileImage: user?.profileImage,
      content: comment
    }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleAddToCart = async () => {
    if (!post.linkedProducts?.[0]) return;
    
    try {
      await addToCart(post.linkedProducts[0], 1);
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  // Handle media loading
  const handleMediaLoad = () => {
    setIsMediaLoading(false);
  };

  // Load comments in chunks
  useEffect(() => {
    if (showComments) {
      const startIndex = 0;
      const endIndex = currentPage * COMMENTS_PER_PAGE;
      setVisibleComments(post.comments.slice(startIndex, endIndex));
    }
  }, [showComments, currentPage, post.comments]);

  const loadMoreComments = () => {
    if (visibleComments.length < post.comments.length) {
      setIsLoadingMoreComments(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMoreComments(false);
      }, 500); // Simulated loading delay
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-[500px] mx-auto">
      {/* Header - More compact */}
      <div className="px-3 py-2 flex items-center flex-shrink-0">
        <img 
          src={post.userProfileImage || 'https://via.placeholder.com/40'} 
          alt={post.username} 
          className="w-8 h-8 rounded-full object-cover mr-2"
        />
        <div className="flex-1">
          <div className="font-medium text-sm">{post.username}</div>
        </div>
      </div>

      {/* Media - Adjusted height */}
      <div className="relative aspect-[4/5] w-full">
        {isMediaLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-kisanly-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <MediaCarousel
          images={post.images || []}
          video={post.video}
          productId={post.linkedProducts?.[0]}
          onAddToCart={handleAddToCart}
          onLoad={handleMediaLoad}
        />
      </div>

      {/* Actions and Content Container */}
      <div className="px-3 pt-2 pb-3">
        {/* Actions */}
        <div className="flex items-center space-x-4 mb-2">
          <button
            onClick={() => likeMutation.mutate()}
            className={`flex items-center space-x-1 ${
              post.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <Heart className="w-5 h-5" fill={post.isLikedByCurrentUser ? 'currentColor' : 'none'} />
            <span className="text-sm">{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments.length}</span>
          </button>
          {post.linkedProducts?.[0] && (
            <button
              onClick={handleAddToCart}
              className="flex items-center space-x-1 text-gray-500"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className={`text-sm ${!isContentExpanded && 'line-clamp-2'}`}>
            <span className="font-medium mr-2">{post.username}</span>
            {post.content}
          </p>
          {post.content.length > 100 && (
            <button
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="text-xs text-gray-500"
            >
              {isContentExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Linked Product - More compact */}
        {linkedProduct && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img 
                src={linkedProduct.images[0]} 
                alt={linkedProduct.name} 
                className="w-10 h-10 rounded-lg object-cover mr-2"
              />
              <div>
                <div className="font-medium text-sm">{linkedProduct.name}</div>
                <div className="text-xs text-gray-500">₹{linkedProduct.price}</div>
              </div>
            </div>
          </div>
        )}

        {/* Comments - Compact with show more */}
        {showComments && (
          <div className="mt-2 space-y-2">
            {visibleComments.length > 0 ? (
              <>
                <div className="space-y-2">
                  {visibleComments.map(comment => (
                    <div key={comment.id} className="flex items-start text-sm">
                      <span className="font-medium mr-2">{comment.username}</span>
                      <span className="flex-1">{comment.content}</span>
                    </div>
                  ))}
                </div>
                {visibleComments.length < post.comments.length && (
                  <button
                    onClick={loadMoreComments}
                    disabled={isLoadingMoreComments}
                    className="text-xs text-gray-500 hover:text-kisanly-primary transition-colors"
                  >
                    {isLoadingMoreComments ? 'Loading...' : 'View more comments'}
                  </button>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">No comments yet.</div>
            )}
            
            {/* Add comment */}
            <div className="flex items-center mt-2">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="flex-1 text-sm border-none bg-transparent focus:outline-none focus:ring-0 placeholder-gray-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && comment.trim()) {
                    commentMutation.mutate();
                  }
                }}
              />
              <button 
                className="ml-2 text-sm font-medium text-kisanly-primary disabled:opacity-50 disabled:text-gray-400"
                disabled={!comment.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate()}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
