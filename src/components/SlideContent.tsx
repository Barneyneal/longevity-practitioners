import { useState } from 'react';
import type { ComponentProps } from 'react';
import { motion } from 'framer-motion';
import ImageModal from './ImageModal';

interface Image {
    src: string;
    alt: string;
}

interface Point {
    text: string;
    subPoints?: string[];
}

interface SlideContentData {
    title: string;
    points: Point[];
    images?: Image[];
}

// Omit the conflicting 'content' prop from the motion component's props
type MotionDivProps = Omit<ComponentProps<typeof motion.div>, 'content'>;

interface SlideContentProps extends MotionDivProps {
    content: SlideContentData;
}

const SlideContent: React.FC<SlideContentProps> = ({ content, ...props }) => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    return (
        <motion.div className="flex w-full h-full" {...props}>
            <div className="flex w-full h-full">
                {/* Main text content (2/3 width) */}
                <div className="w-2/3 pr-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold mb-8 text-left" dangerouslySetInnerHTML={{ __html: content.title }} />
                    <div className="space-y-4 text-lg">
                        {content.points.map((point, index) => (
                            <div key={index}>
                                <p dangerouslySetInnerHTML={{ __html: point.text }} />
                                {point.subPoints && (
                                    <ul className="list-disc pl-8 mt-2 space-y-2">
                                        {point.subPoints.map((subPoint, subIndex) => (
                                            <li key={subIndex} dangerouslySetInnerHTML={{ __html: subPoint }} />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Image content (1/3 width) */}
                {content.images && content.images.length > 0 && (
                    <div className="w-1/3 flex flex-col justify-center items-center gap-4">
                        {content.images.map((image, index) => (
                            <div key={index} className="cursor-pointer" onClick={() => setSelectedImage(image)}>
                                <img src={image.src} alt={image.alt} className="max-w-full rounded-lg shadow-md" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                src={selectedImage?.src || null}
                alt={selectedImage?.alt}
            />
        </motion.div>
    );
};

export default SlideContent;
