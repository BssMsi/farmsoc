
import React, { useState } from 'react';
import { Heart, MessageCircle, ShoppingCart } from 'lucide-react';
import { Post } from '../../types/post';
import { addToCart } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { likePost, addComment } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
  linkedProduct?: any;
}

const PostCard: React.FC<PostCardProps> = ({ post, linkedProduct }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: () => {
      if (!user) return Promise.reject('User not logged in');
      
      return addComment(post.id, {
        userId: user.id,
        username: user.name,
        profileImage: user.profileImage,
        content: comment
      });
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => addToCart(productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    }
  });

  const handleAddToCart = (productId: string) => {
    if (user?.role !== 'consumer') {
      toast({
        title: "Operation not allowed",
        description: "Only consumers can add items to cart",
        variant: "destructive"
      });
      return;
    }
    addToCartMutation.mutate(productId);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center">
        <img 
          src={post.userProfileImage || 'https://via.placeholder.com/40'} 
          alt={post.username} 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="font-semibold">{post.username}</div>
          <div className="text-xs text-gray-500">
            {post.location ? `${post.location} • ` : ''}
            {formatTimeAgo(new Date(post.createdAt))}
          </div>
        </div>
      </div>
      
      {/* Post content */}
      <div className="p-4 pt-0">
        <p className="mb-2">{post.content}</p>
      </div>
      
      {/* Post media */}
      {post.images && post.images.length > 0 && (
        <div className="w-full">
          <img 
            src={post.images[0]} 
            alt="Post content" 
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}
      
      {post.video && (
        <div className="w-full">
          <video 
            src={post.video} 
            className="w-full h-auto max-h-96 object-cover" 
            controls
          />
        </div>
      )}
      
      {/* Linked product */}
      {linkedProduct && (
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={linkedProduct.images[0]} 
              alt={linkedProduct.name} 
              className="w-12 h-12 rounded object-cover"
            />
            <div className="ml-3">
              <div className="font-medium">{linkedProduct.name}</div>
              <div className="text-farmsoc-primary font-semibold">₹{linkedProduct.price}</div>
            </div>
          </div>
          <button 
            className="p-2 bg-farmsoc-primary text-white rounded-full"
            onClick={() => handleAddToCart(linkedProduct.id)}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      )}
      
      {/* Post actions */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button 
            className={`flex items-center space-x-1 ${post.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-500'}`}
            onClick={() => likeMutation.mutate()}
          >
            <Heart size={20} fill={post.isLikedByCurrentUser ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <button 
            className="flex items-center space-x-1 text-gray-500"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} />
            <span>{post.comments.length}</span>
          </button>
        </div>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="p-4 border-t border-gray-100">
          {post.comments.length > 0 ? (
            <div className="space-y-3 mb-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex items-start">
                  <img 
                    src={comment.profileImage || 'https://via.placeholder.com/30'} 
                    alt={comment.username} 
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                    <div className="font-medium text-sm">{comment.username}</div>
                    <div className="text-sm">{comment.content}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mb-3">No comments yet.</div>
          )}
          
          {/* Add comment */}
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  commentMutation.mutate();
                }
              }}
            />
            <button 
              className="ml-2 px-3 py-2 bg-farmsoc-primary text-white rounded-full text-sm font-medium disabled:opacity-50"
              disabled={!comment.trim() || commentMutation.isPending}
              onClick={() => commentMutation.mutate()}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
