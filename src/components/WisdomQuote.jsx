import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { artOfWarQuotes } from '../data/artOfWarQuotes';

const { FiRefreshCw } = FiIcons;

function WisdomQuote() {
  const [quote, setQuote] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * artOfWarQuotes.length);
    return artOfWarQuotes[randomIndex];
  };

  const refreshQuote = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  if (!quote) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quote.quote}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mt-4 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-lg font-medium text-white mb-1">
              {quote.quote}
            </p>
            <p className="text-sm text-primary-100">
              {quote.meaning}
            </p>
          </div>
          <button
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="p-2 text-white hover:text-primary-200 transition-colors"
            title="다른 명언 보기"
          >
            <SafeIcon
              icon={FiRefreshCw}
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WisdomQuote;