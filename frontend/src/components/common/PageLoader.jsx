// src/components/common/PageLoader.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader = ({ isLoading }) => {
  const [show, setShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      return;
    }

    // Small delay so the exit animation plays smoothly
    const t = setTimeout(() => setShow(false), 600);
    return () => clearTimeout(t);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #060612 0%, #0f0f2d 50%, #060612 100%)',
          }}
        >
          {/* Logo / Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 40,
            }}
          >
            Nikhil Portfolio
          </motion.div>

          {/* Spinner ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ position: 'relative', width: 56, height: 56, marginBottom: 28 }}
          >
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#6366f1',
                borderRightColor: '#8b5cf6',
              }}
            />
            {/* Inner ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#06b6d4',
              }}
            />
            {/* Center dot */}
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                position: 'absolute',
                inset: 20,
                borderRadius: '50%',
                background: '#6366f1',
              }}
            />
          </motion.div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              color: '#94a3b8',
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            Loading...
          </motion.p>

          {/* Bottom progress bar */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              background: 'linear-gradient(to right, #6366f1, #8b5cf6, #06b6d4)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: isLoading ? '80%' : '100%' }}
            transition={{ duration: isLoading ? 2 : 0.3, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
