import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';

interface AudioPlayerProps {
    src: string;
    onNext: () => void;
    onPrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
    currentSlide: number;
    totalSlides: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onNext, onPrevious, isFirst, isLast, currentSlide, totalSlides }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLInputElement>(null);
    const hasPlayedOnce = useRef(false);

    useEffect(() => {
        // Reset state when src changes
        setIsPlaying(false);
        setCurrentTime(0);
        hasPlayedOnce.current = false;
    }, [src]);


    useEffect(() => {
        if (audioRef.current && audioRef.current.src) {
            if (isPlaying) {
                audioRef.current.play().catch(error => console.error("Error playing audio:", error));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, src]);

    const handleCanPlay = () => {
        if (hasPlayedOnce.current && audioRef.current && audioRef.current.src) {
            audioRef.current.play().catch(error => console.error("Error playing audio:", error));
            setIsPlaying(true);
        }
    };

    const togglePlayPause = () => {
        if (!hasPlayedOnce.current && src) {
            hasPlayedOnce.current = true;
        }
        setIsPlaying(!isPlaying);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleProgressChange = () => {
        if (audioRef.current && progressBarRef.current) {
            audioRef.current.currentTime = Number(progressBarRef.current.value);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center w-full">
             <audio
                ref={audioRef}
                src={src}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => onNext()}
                onCanPlay={handleCanPlay}
            />
            {/* Column 1: Timeline (3/4 width) */}
            <div className="w-3/4 flex items-center gap-2 pr-4">
                <span className="text-xs text-gray-500 w-10 text-center">{formatTime(currentTime)}</span>
                <input
                    ref={progressBarRef}
                    type="range"
                    value={currentTime}
                    max={duration || 0}
                    onChange={handleProgressChange}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-10 text-center">{formatTime(duration)}</span>
            </div>

            {/* Container for Controls and Counter (1/4 width) */}
            <div className="w-1/4 flex items-center">
                {/* Column 2: Controls (2/3 of the container) */}
                <div className="w-2/3 flex justify-center items-center gap-4">
                    <button onClick={onPrevious} disabled={isFirst} className="text-gray-600 disabled:opacity-50">
                        <FaStepBackward size={16} />
                    </button>
                    <button onClick={togglePlayPause} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                        {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="translate-x-px"/>}
                    </button>
                    <button onClick={onNext} disabled={isLast} className="text-gray-600 disabled:opacity-50">
                        <FaStepForward size={16} />
                    </button>
                </div>

                {/* Column 3: Slide Counter (1/3 of the container) */}
                <div className="w-1/3 text-right">
                    <span className="text-sm text-gray-500">
                        Slide {currentSlide + 1} of {totalSlides}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
