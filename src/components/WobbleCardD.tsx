"use client";
import Image from "next/image";
import React from "react";
import canvas1 from "../../public/canvas1.png"
import { WobbleCard } from "../components/ui/wobble-card";
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function WobbleCardDemo() {
  const router = useRouter();

  const navigateToCanvas = () => {
    const roomId = Math.random().toString(36).substring(2, 10);
    router.push(`/canvas/${roomId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
      <WobbleCard
        containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px] cursor-pointer group"
        className=""
        onClick={navigateToCanvas}
      >
        <div className="max-w-xs">
          <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Instant Access, No Sign-Up Required!
          </h2>
          <p className="mt-4 text-left  text-base/6 text-neutral-200">
          Unlock the full potential of SketchFlow Studio—just open and start creating!
          </p>
          <div className="mt-4 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
            <span className="text-sm">Click to start drawing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <Image
  src={canvas1}
  width={500} 
  height={500} 
  alt="linear demo image"
  className="absolute -right-4 lg:-right-[40%] grayscale filter -bottom-10 object-contain rounded-2xl"
/>

      </WobbleCard>
      <WobbleCard 
        containerClassName="col-span-1 min-h-[300px] cursor-pointer group"
        onClick={navigateToCanvas}
      >
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
        Sketch your ideas effortlessly—simply press the Magic Button to unlock intelligent insights!
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
       Get details information of Image by pressing the Magic Button 
        </p>
        <div className="mt-4 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
          <span className="text-sm">Click to start drawing</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </WobbleCard>
      <WobbleCard 
        containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px] cursor-pointer group"
        onClick={navigateToCanvas}
      >
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Stay connected with friends effortlessly!
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          This exciting feature is coming soon—get ready to collaborate and share like never before!
          </p>
          <div className="mt-4 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
            <span className="text-sm">Click to start drawing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <Image
          src={canvas1}
          width={500}
          height={500}
          alt="linear demo image"
          className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
        />
      </WobbleCard>
    </div>
  );
}
