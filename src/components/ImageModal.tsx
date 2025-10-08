import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  alt?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
  exit: { scale: 0.9, opacity: 0 },
};

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src, alt }) => {
  if (!isOpen || !src) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="relative p-4 bg-white rounded-lg shadow-2xl"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on the image
          >
            <img src={src} alt={alt || ''} className="max-w-[80vw] max-h-[80vh] object-contain" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
