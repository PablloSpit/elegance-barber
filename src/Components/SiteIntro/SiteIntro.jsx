import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(CustomEase, MotionPathPlugin);

const SiteIntro = () => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const percentageRef = useRef(null);
  const topPartRef = useRef(null);
  const bottomPartRef = useRef(null);
  const scissorsRef = useRef(null);
  const cutGlowRef = useRef(null);

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

    const tl = gsap.timeline({
      onComplete: () => {
        setShow(false);
        document.body.style.overflow = '';
        sessionStorage.setItem('site-intro-seen', 'true');
        // Ensure ScrollTrigger is aware of the new layout height
        gsap.delayedCall(0.1, () => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    });

    // Step 1: Loading Progress (0 to 100)
    tl.to({}, {
      duration: 1.2,
      onUpdate: function() {
        const val = Math.round(this.progress() * 100);
        setProgress(val);
      },
      ease: "none"
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
    const scissors = scissorsRef.current;
    const topPart = topPartRef.current;
    const bottomPart = bottomPartRef.current;
    const cutGlow = cutGlowRef.current;

    // Define the irregular path
    // We'll use viewport units for responsiveness
    const path = [
      { x: '0vw', y: '40vh' },
      { x: '25vw', y: '20vh' },
      { x: '50vw', y: '60vh' },
      { x: '75vw', y: '30vh' },
      { x: '110vw', y: '50vh' }
    ];

    tl.set(scissors, { opacity: 1, x: '-10vw', y: '40vh', rotation: 0 });

    // Scissor blade animation (opening/closing)
    const bladeTl = gsap.timeline({ repeat: 8, yoyo: true });
    bladeTl.to(".blade-top", { rotation: -15, duration: 0.1, ease: "power1.inOut" }, 0);
    bladeTl.to(".blade-bottom", { rotation: 15, duration: 0.1, ease: "power1.inOut" }, 0);

    tl.add(bladeTl, "cutStart");

    // Motion along path
    tl.to(scissors, {
      duration: 0.7,
      motionPath: {
        path: path,
        curviness: 1.5,
        autoRotate: true
      },
      ease: "power2.inOut"
    }, "cutStart");

    // Glow line reveal
    tl.set(cutGlow, { opacity: 1 }, "cutStart");
    tl.fromTo(cutGlow, 
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
      "cutStart"
    );

    // Step 4: Split and Reveal
    // We use clip-path for a more "torn" look if possible, or just slide
    tl.to(topPart, {
      y: '-100%',
      duration: 0.8,
      ease: "power3.inOut"
    }, "reveal");

    tl.to(bottomPart, {
      y: '100%',
      duration: 0.8,
      ease: "power3.inOut"
    }, "reveal");

    tl.to(cutGlow, {
      opacity: 0,
      duration: 0.2
    }, "reveal");

    // Step 5: Reveal Hero elements (micro-animations)
    // We target the elements by data-hero-* attributes
    tl.to("[data-hero-tagline], [data-hero-heading], [data-hero-cta]", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    }, "reveal+=0.1");

  }, { dependencies: [show], scope: containerRef });

  if (!show) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Background Parts */}
      <div 
        ref={topPartRef} 
        className="absolute inset-0 bg-black pointer-events-auto"
        style={{ height: '50.5vh' }}
      ></div>
      <div 
        ref={bottomPartRef} 
        className="absolute inset-0 bg-black pointer-events-auto"
        style={{ height: '50.5vh', top: '50vh' }}
      ></div>

      {/* Percentage */}
      <div 
        ref={percentageRef}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <span className="text-white text-7xl md:text-9xl font-semibold font-sans tabular-nums tracking-tighter">
          {progress}%
        </span>
      </div>

      {/* Scissors SVG */}
      <div 
        ref={scissorsRef}
        className="absolute w-16 h-16 md:w-24 md:h-24 opacity-0 z-20 pointer-events-none"
        style={{ top: 0, left: 0, marginTop: '-32px', marginLeft: '-32px' }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          <g className="blade-top" style={{ transformOrigin: '30% 50%' }}>
            <path d="M30 50 L95 30 L95 45 Z" fill="currentColor" />
            <circle cx="20" cy="40" r="10" stroke="currentColor" strokeWidth="4" />
          </g>
          <g className="blade-bottom" style={{ transformOrigin: '30% 50%' }}>
            <path d="M30 50 L95 70 L95 55 Z" fill="currentColor" />
            <circle cx="20" cy="60" r="10" stroke="currentColor" strokeWidth="4" />
          </g>
        </svg>
      </div>

      {/* Cut Glow */}
      <div 
        ref={cutGlowRef}
        className="absolute w-full h-[1px] bg-white opacity-0 z-15 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
        style={{ top: '50vh', left: 0 }}
      ></div>
    </div>
  );
};

export default SiteIntro;
