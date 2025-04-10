import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { addToCart } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useSwipeable } from 'react-swipeable';

interface MediaCarouselProps {
  images: string[];
  video?: string;
  productId?: string;
  onAddToCart?: () => void;
  onLoad?: () => void;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images,
  video,
  productId,
  onAddToCart,
  onLoad
}) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapTime = useRef(0);
  const [showAddToCartAnimation, setShowAddToCartAnimation] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const mediaItems = video ? [...images, video] : images;

  const handleTap = () => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      handleDoubleTap();
    } else {
      // Single tap
      if (currentIndex === mediaItems.length - 1 && video) {
        toggleVideoPlayback();
      }
    }
    lastTapTime.current = currentTime;
  };

  const handleDoubleTap = async () => {
    if (!productId) return;

    setShowAddToCartAnimation(true);
    setTimeout(() => setShowAddToCartAnimation(false), 1000);

    try {
      await addToCart(productId, 1);
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const swipeableRef = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: true,
    onTap: handleTap
  });

  useEffect(() => {
    if (loadedImages.size === images.length && (!video || videoRef.current?.readyState === 4)) {
      onLoad?.();
    }
  }, [loadedImages, images.length, video, onLoad]);

  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => new Set([...prev, src]));
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('ended', () => setIsVideoPlaying(false));
      return () => {
        videoRef.current?.removeEventListener('ended', () => setIsVideoPlaying(false));
      };
    }
  }, []);

  if (mediaItems.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No media available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black media-carousel-container">
      {/* Media Items */}
      <div className="relative w-full h-full overflow-hidden" {...swipeableRef}>
        {mediaItems.map((media, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-transform duration-300 ${
              index === currentIndex ? 'translate-x-0' : index < currentIndex ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {media.startsWith('data:video') || media.endsWith('.mp4') ? (
              <video
                ref={index === currentIndex ? videoRef : undefined}
                src={media}
                className="w-full h-full object-contain"
                playsInline
                muted
                loop
                onLoadedData={() => onLoad?.()}
              />
            ) : (
              <img
                src={media}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-contain"
                onLoad={() => handleImageLoad(media)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Video Controls */}
      {currentIndex === mediaItems.length - 1 && video && (
        <button
          onClick={toggleVideoPlayback}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
        >
          {isVideoPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}

      {/* Media Indicators */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1 z-10">
          {mediaItems.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentIndex ? 'bg-farmsoc-primary' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {mediaItems.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={() => handleSwipe('right')}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white transition-colors z-10"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
          )}
          {currentIndex < mediaItems.length - 1 && (
            <button
              onClick={() => handleSwipe('left')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 hover:bg-white transition-colors z-10"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          )}
        </>
      )}

      {/* Add to Cart Animation */}
      {showAddToCartAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="animate-ping">
            <ShoppingCart className="w-14 h-14 text-white drop-shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel; 