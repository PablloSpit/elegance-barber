import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

const SiteIntro = () => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const percentageRef = useRef(null);
  const topPartRef = useRef(null);
  const bottomPartRef = useRef(null);
  const scissorsRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('site-intro-seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasSeenIntro && !prefersReducedMotion) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      setShow(false);
    }
  }, []);

  useGSAP(() => {
    if (!show) return;

    CustomEase.create("scissorsPath", "0.76, 0, 0.24, 1");

    const tl = gsap.timeline({
      onComplete: () => {
        setShow(false);
        document.body.style.overflow = '';
        sessionStorage.setItem('site-intro-seen', 'true');
      }
    });

    // Step 1: Loading Progress (0 to 100)
    tl.to({}, {
      duration: 1.2,
      onUpdate: function() {
        const val = Math.round(this.progress() * 100);
        setProgress(val);
      },
      ease: "power2.inOut"
    });

    // Wait 200ms at 100%
    tl.to({}, { duration: 0.2 });

    // Step 2: Fade out percentage
    tl.to(percentageRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    });

    // Step 3: Scissors entrance and cut
    // We'll use a path that goes: left -> center top -> center bottom -> right (irregular)
    // For simplicity and performance, we'll animate the clip-path of two overlays
    
    const scissors = scissorsRef.current;
    const topPart = topPartRef.current;
    const bottomPart = bottomPartRef.current;

    tl.set(scissors, { opacity: 1, x: '-10%', y: '40%', rotation: -15 });

    // Cutting animation
    tl.to(scissors, {
      duration: 0.7,
      motionPath: {
        path: [
          { x: '10vw', y: '40vh' },
          { x: '40vw', y: '20vh' },
          { x: '60vw', y: '80vh' },
          { x: '110vw', y: '50vh' }
        ],
        curviness: 1.5,
        autoRotate: true
      },
      ease: "power2.inOut"
    }, "+=0.1");

    // Scissor blade animation (opening/closing)
    tl.to(".blade-top", { rotation: -20, duration: 0.1, repeat: 5, yoyo: true }, "<");
    tl.to(".blade-bottom", { rotation: 20, duration: 0.1, repeat: 5, yoyo: true }, "<");

    // Step 4: Split and Reveal
    // The cut line is irregular, but for CSS clip-path we'll use a polygon
    // Or simpler: just slide top and bottom overlays
    
    tl.to(topPart, {
      y: '-100%',
      duration: 0.8,
      ease: "power3.inOut"
    }, "-=0.2");

    tl.to(bottomPart, {
      y: '100%',
      duration: 0.8,
      ease: "power3.inOut"
    }, "<");

    // Reveal Hero elements (micro-animations)
    // We look for elements in the DOM since this is a global overlay
    tl.to("#main-hero [data-hero-heading], #main-hero [data-hero-tagline], #main-hero [data-hero-cta]", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    }, "-=0.6");

  }, { dependencies: [show], scope: containerRef });

  if (!show) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Background Parts */}
      <div 
        ref={topPartRef} 
        className="absolute inset-0 bg-black pointer-events-auto"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
      ></div>
      <div 
        ref={bottomPartRef} 
        className="absolute inset-0 bg-black pointer-events-auto"
        style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
      ></div>

      {/* Percentage */}
      <div 
        ref={percentageRef}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <span className="text-white text-6xl md:text-8xl font-semibold font-sans tabular-nums">
          {progress}%
        </span>
      </div>

      {/* Scissors SVG */}
      <div 
        ref={scissorsRef}
        className="absolute w-12 h-12 md:w-16 md:h-16 opacity-0 z-20 pointer-events-none"
        style={{ top: 0, left: 0 }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
          <g className="blade-top" style={{ transformOrigin: '40% 50%' }}>
            <path d="M40 50 L90 35 L90 45 Z" fill="currentColor" />
            <circle cx="35" cy="40" r="8" stroke="currentColor" strokeWidth="4" />
          </g>
          <g className="blade-bottom" style={{ transformOrigin: '40% 50%' }}>
            <path d="M40 50 L90 65 L90 55 Z" fill="currentColor" />
            <circle cx="35" cy="60" r="8" stroke="currentColor" strokeWidth="4" />
          </g>
        </svg>
      </div>

      {/* Cut Line Glow */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
         <div className="cut-glow absolute w-full h-[2px] bg-white/30 blur-[1px] opacity-0" 
              style={{ top: '50%', left: 0, transform: 'translateY(-50%)' }}></div>
      </div>
    </div>
  );
};

export default SiteIntro;
