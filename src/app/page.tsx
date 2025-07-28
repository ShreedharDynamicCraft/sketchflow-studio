'use client';

import { GoogleGeminiEffect } from '@/components/ui/google-gemini-effect';
import Navbar from '@/components/NavBar';
import { WobbleCardDemo } from '../components/WobbleCardD';
import { MacbookScroll } from '@/components/ui/macbook-scroll';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Code, Palette, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const navigateToCanvas = () => {
    const roomId = Math.random().toString(36).substring(2, 10);
    router.push(`/canvas/${roomId}`);
  };

  const handlePageClick = (e: React.MouseEvent) => {
    // Don't trigger navigation if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('a') ||
        (e.target as HTMLElement).closest('[data-no-navigate]')) {
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastClickTime < 500) {
      // Double click detected
      setClickCount(prev => prev + 1);
      if (clickCount >= 1) {
        navigateToCanvas();
        setClickCount(0);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(currentTime);
  };

  return (
    <>
      <Navbar />
      <div 
        className="flex flex-col items-center justify-center min-h-screen w-full cursor-pointer"
        onClick={handlePageClick}
      >
        
        {/* GoogleGeminiEffect Section */}
        <div className="h-[100vh] w-full bg-black dark:border dark:border-white/[0.1] rounded-md relative pt-30 group">
          <GoogleGeminiEffect />
          {/* Click indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white text-lg font-medium flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Click anywhere to start drawing
            </div>
          </div>
        </div>

        <MacbookScroll/>

        {/* WobbleCardDemo Section */}
        <div className="h-[100vh] w-full bg-black dark:border dark:border-white/[0.1] rounded-md relative pt-20 group">
          <WobbleCardDemo />
          {/* Click indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white text-lg font-medium flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Click anywhere to start drawing
            </div>
          </div>
        </div>

        {/* Designed by Shreedhar Anand Section */}
        <div className="min-h-screen w-full bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden group">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Designer Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium text-sm">Crafted with Passion</span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
              >
                Designed by
              </motion.h1>

              {/* Designer Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative mb-8"
              >
                <h2 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Shreedhar Anand
                </h2>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-25 animate-pulse"></div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Transforming ideas into digital experiences with creativity, innovation, and cutting-edge technology
              </motion.p>

              {/* Skills Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-3xl mx-auto"
              >
                {[
                  { icon: <Code className="w-8 h-8" />, label: "Full-Stack Development", color: "from-blue-500 to-cyan-500" },
                  { icon: <Palette className="w-8 h-8" />, label: "UI/UX Design", color: "from-purple-500 to-pink-500" },
                  { icon: <Zap className="w-8 h-8" />, label: "AI Integration", color: "from-yellow-500 to-orange-500" },
                  { icon: <Heart className="w-8 h-8" />, label: "User Experience", color: "from-red-500 to-pink-500" }
                ].map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative"
                  >
                    <div className={`bg-gradient-to-br ${skill.color} p-6 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300`}>
                      <div className="text-white mb-3 flex justify-center">
                        {skill.icon}
                      </div>
                      <p className="text-white text-sm font-medium text-center">{skill.label}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button
                  onClick={navigateToCanvas}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Start Drawing Now
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => window.open('https://github.com/ShreedharDynamicCraft', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-purple-500/50 text-purple-300 font-semibold rounded-full hover:bg-purple-500/10 transition-all duration-300"
                >
                  View Portfolio
                </motion.button>
              </motion.div>

              {/* Click anywhere indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-400 text-sm mb-2">💡 Pro tip:</p>
                <p className="text-purple-300 text-lg font-medium">
                  Click anywhere or double-click to start drawing instantly!
                </p>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-20 right-20 text-purple-400/30 text-6xl"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-20 left-20 text-pink-400/30 text-4xl"
              >
                🎨
              </motion.div>
            </motion.div>
          </div>

          {/* Click indicator overlay for this section */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white text-lg font-medium flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Click anywhere to start drawing
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
