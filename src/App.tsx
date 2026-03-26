import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X } from 'lucide-react';

const RIDDLES = [
  {
    question: [
      "What has to be broken",
      "before you can use it?"
    ],
    answer: [
      "An egg. Crack open new",
      "possibilities today!"
    ]
  },
  {
    question: [
      "I am full of holes but",
      "still hold water. What am I?"
    ],
    answer: [
      "A sponge. Absorb all the",
      "good vibes today!"
    ]
  },
  {
    question: [
      "What is always in front of",
      "you but can't be seen?"
    ],
    answer: [
      "The future. Make it",
      "a bright one!"
    ]
  },
  {
    question: [
      "I have keys but no doors.",
      "I have space but no room.",
      "What am I?"
    ],
    answer: [
      "A keyboard. Time to write",
      "your own story today!"
    ]
  },
  {
    question: [
      "What goes up but never",
      "comes down?"
    ],
    answer: [
      "Your age. Embrace the",
      "wisdom of today!"
    ]
  },
  {
    question: [
      "I have cities, but no houses.",
      "I have water, but no fish.",
      "What am I?"
    ],
    answer: [
      "A map. Chart your own",
      "course today!"
    ]
  },
  {
    question: [
      "I speak without a mouth",
      "and hear without ears.",
      "What am I?"
    ],
    answer: [
      "An echo. Let your voice",
      "be heard!"
    ]
  },
  {
    question: [
      "The more of this there is,",
      "the less you see. What is it?"
    ],
    answer: [
      "Darkness. Be the light",
      "in someone's day!"
    ]
  },
  {
    question: [
      "I have branches, but no fruit,",
      "trunk or leaves. What am I?"
    ],
    answer: [
      "A bank. Invest in your",
      "happiness today!"
    ]
  },
  {
    question: [
      "I’m tall when I’m young,",
      "and I’m short when I’m old.",
      "What am I?"
    ],
    answer: [
      "A candle. Keep burning",
      "bright!"
    ]
  },
  {
    question: [
      "What gets wet while drying?"
    ],
    answer: [
      "A towel. Dry your tears",
      "and smile!"
    ]
  },
  {
    question: [
      "I shave every day, but my",
      "beard stays the same.",
      "Who am I?"
    ],
    answer: [
      "A barber. Keep looking",
      "sharp!"
    ]
  },
  {
    question: [
      "I have a tail and a head,",
      "but no body. What am I?"
    ],
    answer: [
      "A coin. Flip it and",
      "take a chance!"
    ]
  },
  {
    question: [
      "What can you catch,",
      "but not throw?"
    ],
    answer: [
      "A cold. Stay warm and",
      "healthy!"
    ]
  },
  {
    question: [
      "What has many teeth,",
      "but can't bite?"
    ],
    answer: [
      "A comb. Smooth out your",
      "troubles today!"
    ]
  },
  {
    question: [
      "What has words, but",
      "never speaks?"
    ],
    answer: [
      "A book. Read between",
      "the lines!"
    ]
  },
  {
    question: [
      "What runs all around a",
      "backyard, yet never moves?"
    ],
    answer: [
      "A fence. Set your",
      "boundaries!"
    ]
  }
];

export default function App() {
  const [printingState, setPrintingState] = useState<'idle' | 'printing' | 'done' | 'cutting'>('idle');
  const [currentLines, setCurrentLines] = useState<string[]>([]);
  const [currentType, setCurrentType] = useState<'riddle' | 'answer'>('riddle');
  const [fallenPapers, setFallenPapers] = useState<{id: number, lines: string[], rotate: number, type: 'riddle' | 'answer'}[]>([]);
  const [activeRiddleIndex, setActiveRiddleIndex] = useState<number | null>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const paperContainerRef = useRef<HTMLDivElement>(null);
  const [trashOffset, setTrashOffset] = useState({ x: 200, y: 300 });

  const leds = useMemo(() => {
    return Array.from({ length: 3 * 25 }).map((_, i) => {
      const col = i % 25;
      const row = Math.floor(i / 25);
      return {
        id: i,
        col,
        row,
        // Randomize for "calculating" look
        calcDelay: Math.random() * 2,
        calcDuration: 0.1 + Math.random() * 0.3,
        // All blink at once for finish
        finishDelay: 0,
        color: '#FFCC00'
      };
    });
  }, []);

  const handleDragEnd = (id: number, info: any) => {
    if (!trashRef.current) return;
    const trashRect = trashRef.current.getBoundingClientRect();
    const { x, y } = info.point;

    const padding = 30;
    if (
      x >= trashRect.left - padding &&
      x <= trashRect.right + padding &&
      y >= trashRect.top - padding &&
      y <= trashRect.bottom + padding
    ) {
      setFallenPapers(prev => prev.filter(p => p.id !== id));
    }
  };

  const playClickSound = () => {
    // A sharper, more metallic click sound using Web Audio API
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.02);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.02);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.02);
  };

  const playCutSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.2; // Slightly longer for a realistic tear
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise with texture (mix of brownian-ish and white noise)
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02; // Lowpass body
      lastOut = data[i];
      data[i] += white * 0.5; // High frequency grit
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to shape the paper sound
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(800, audioCtx.currentTime);
    highpass.frequency.linearRampToValueAtTime(2500, audioCtx.currentTime + duration);

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 5000;

    // Envelope for the "rip" texture (multiple peaks)
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.06);
    gainNode.gain.linearRampToValueAtTime(0.9, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start();
  };

  const startPrintingSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Motor hum
    const motor = audioCtx.createOscillator();
    motor.type = 'triangle';
    motor.frequency.value = 120;
    
    // Paper noise
    const bufferSize = audioCtx.sampleRate * 1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 0.5;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.015; // Very subtle background noise

    motor.connect(masterGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    motor.start();
    noise.start();

    return () => {
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      setTimeout(() => {
        try {
          motor.stop();
          noise.stop();
        } catch (e) {}
      }, 200);
    };
  };

  const handlePrint = (type: 'riddle' | 'answer') => {
    if (printingState !== 'idle') return;
    
    playClickSound();
    
    if (type === 'answer' && activeRiddleIndex === null) {
      setCurrentLines(["Please print a riddle", "first!"]);
      setCurrentType('answer');
      setPrintingState('printing');
      return;
    }

    if (type === 'riddle') {
      let newIndex = Math.floor(Math.random() * RIDDLES.length);
      if (RIDDLES.length > 1) {
        while (newIndex === activeRiddleIndex) {
          newIndex = Math.floor(Math.random() * RIDDLES.length);
        }
      }
      setActiveRiddleIndex(newIndex);
      setCurrentLines(RIDDLES[newIndex].question);
      setCurrentType('riddle');
      setPrintingState('printing');
    } else if (type === 'answer' && activeRiddleIndex !== null) {
      setCurrentLines(RIDDLES[activeRiddleIndex].answer);
      setCurrentType('answer');
      setPrintingState('printing');
    }
  };

  useEffect(() => {
    const updateTrashOffset = () => {
      if (trashRef.current && paperContainerRef.current) {
        const trashRect = trashRef.current.getBoundingClientRect();
        const containerRect = paperContainerRef.current.getBoundingClientRect();
        
        const targetX = trashRect.left + trashRect.width / 2 - (containerRect.left + containerRect.width / 2);
        const targetY = trashRect.top + trashRect.height / 2 - (containerRect.bottom - 80);
        
        setTrashOffset({ x: targetX, y: targetY });
      }
    };

    const timer = setTimeout(updateTrashOffset, 100);
    window.addEventListener('resize', updateTrashOffset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTrashOffset);
    };
  }, []);

  useEffect(() => {
    if (printingState === 'printing') {
      const stopSound = startPrintingSound();
      const duration = currentLines.length * 1000;
      const timer = setTimeout(() => {
        setPrintingState('done');
      }, duration);
      return () => {
        clearTimeout(timer);
        stopSound();
      };
    }

    if (printingState === 'done') {
      const timer = setTimeout(() => {
        playCutSound();
        setPrintingState('cutting');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (printingState === 'cutting') {
      const timer = setTimeout(() => {
        setFallenPapers(prev => [...prev, {
          id: Date.now(),
          lines: currentLines,
          rotate: Math.random() * 6 - 3,
          type: currentType
        }]);
        setPrintingState('idle');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [printingState, currentLines]);

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4 font-sans selection:bg-black selection:text-white">
      <div className="relative w-full max-w-md flex flex-col items-center mt-20">
        
        {/* Device Front */}
        <div className="relative z-10 w-full bg-[#FFCC00] rounded-2xl p-6 pb-28 shadow-[inset_4px_4px_0px_#FFE666,inset_-4px_-4px_0px_#CC9900,0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-6">
          
          {/* Top Slot Area */}
          <div className="relative w-full h-6 z-20">
            {/* Back of the slot (Hole + Top Border) */}
            <div className="absolute inset-0 bg-[#111] rounded-full border-[3px] border-[#888] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] z-0"></div>
            
            {/* Paper Slot Container */}
            <div className="absolute left-4 right-4 h-[300px] overflow-hidden z-10" style={{ bottom: '50%' }}>
              {/* Cutter Blade */}
              <motion.div 
                className="absolute bottom-0 left-0 h-1.5 bg-[#111] z-20 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                initial={{ width: "0%", opacity: 0 }}
                animate={{ 
                  width: printingState === 'cutting' ? "100%" : "0%",
                  opacity: printingState === 'cutting' ? 1 : 0
                }}
                transition={{ duration: 0.15, ease: "linear" }}
              />

              <motion.div
                initial={{ y: "100%", opacity: 1 }}
                animate={{ 
                  y: printingState === 'idle' ? "100%" : "0%",
                  opacity: 1,
                  rotate: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: printingState === 'printing' ? currentLines.length * 1 : 0, 
                  ease: "linear" 
                }}
                className="absolute bottom-0 left-0 w-full bg-[#fdfbf7] shadow-[0_-5px_15px_rgba(0,0,0,0.2)] pb-10 origin-bottom-right border-x border-b border-[#e2dfd8]"
              >
                {/* Jagged Top Edge */}
                <div className="absolute -top-[8px] left-0 w-full h-[8px] flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="flex-1 h-full bg-[#fdfbf7]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  ))}
                </div>
                
                {/* Jagged Bottom Edge */}
                <div className="absolute -bottom-[8px] left-0 w-full h-[8px] flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="flex-1 h-full bg-[#fdfbf7]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
                  ))}
                </div>
                
                {/* Content */}
                <div className="p-6 pt-8 flex flex-col items-center text-center gap-3 text-[#2c2c2c]">
                  <div className="w-8 h-8 rounded-full border border-[#d1cabc] flex items-center justify-center mb-1">
                    <span className="text-xl font-serif text-[#a39b8b] leading-none mt-2">"</span>
                  </div>
                  <div className="font-serif italic text-base sm:text-lg leading-relaxed px-2">
                    {currentLines.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-[#d1cabc] w-full text-[10px] font-mono text-[#8a8476] uppercase tracking-widest">
                    {currentType === 'riddle' ? "Today's Riddle" : 'The Answer'}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Front of the slot (Bottom Border) */}
            <div className="absolute inset-0 rounded-full border-[3px] border-[#888] shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] z-20 pointer-events-none" style={{ clipPath: 'inset(50% 0 0 0)' }}></div>
          </div>

          {/* Speaker Grill / LEDs */}
          <div className="grid justify-items-center gap-y-1.5 sm:gap-y-2 w-full px-2 mt-2" style={{ gridTemplateColumns: 'repeat(25, 1fr)' }}>
            {leds.map((led) => (
              <motion.div 
                key={led.id} 
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#111] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.3)]"
                animate={
                  printingState === 'printing'
                    ? {
                        backgroundColor: ['#111', led.color, '#111', '#111'],
                        boxShadow: [
                          'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)',
                          `0 0 12px ${led.color}, inset 0 1px 2px rgba(0,0,0,0.8)`,
                          'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)',
                          'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)'
                        ]
                      }
                    : printingState === 'done' || printingState === 'cutting'
                    ? {
                        backgroundColor: ['#111', led.color, '#111'],
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)',
                          `0 0 15px ${led.color}, inset 0 1px 2px rgba(0,0,0,0.8)`,
                          'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)'
                        ]
                      }
                    : {
                        backgroundColor: '#111',
                        scale: 1,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.3)'
                      }
                }
                transition={{
                  duration: printingState === 'printing' ? led.calcDuration : 1.0,
                  repeat: printingState === 'printing' ? Infinity : 0,
                  repeatType: 'loop',
                  repeatDelay: printingState === 'printing' ? Math.random() * 0.5 : 0,
                  delay: printingState === 'printing' ? led.calcDelay : led.finishDelay,
                  ease: printingState === 'printing' ? "linear" : "easeOut"
                }}
              />
            ))}
          </div>

          {/* Walkman Style Button Panel */}
          <div className="w-full mt-5 bg-[#111] rounded-lg p-3 shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_1px_0_rgba(255,255,255,0.3)] border border-[#000] flex gap-4">
            
            {/* Riddle Button */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <button
                onClick={() => handlePrint('riddle')}
                disabled={printingState !== 'idle'}
                className="relative w-full h-12 bg-[#1a1a1a] rounded-sm flex items-center justify-center transition-all duration-75 disabled:opacity-90 disabled:cursor-not-allowed shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15),_inset_-1px_-1px_1px_rgba(0,0,0,0.8),_0_5px_0_#000,_0_6px_8px_rgba(0,0,0,0.6)] active:shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15),_inset_-1px_-1px_1px_rgba(0,0,0,0.8),_0_0px_0_#000,_0_2px_4px_rgba(0,0,0,0.6)] active:translate-y-[5px]"
              >
                <div className="w-6 h-1 bg-[#0a0a0a] rounded-full shadow-[1px_1px_0_rgba(255,255,255,0.05)]"></div>
              </button>
              <div className="flex items-center gap-1.5">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-[#FFCC00] border-b-[4px] border-b-transparent"></div>
                <span className="text-[#FFCC00] font-sans font-bold text-[11px] tracking-[0.15em]">RIDDLE</span>
              </div>
            </div>

            {/* Answer Button */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <button
                onClick={() => handlePrint('answer')}
                disabled={printingState !== 'idle'}
                className="relative w-full h-12 bg-[#1a1a1a] rounded-sm flex items-center justify-center transition-all duration-75 disabled:opacity-90 disabled:cursor-not-allowed shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15),_inset_-1px_-1px_1px_rgba(0,0,0,0.8),_0_5px_0_#000,_0_6px_8px_rgba(0,0,0,0.6)] active:shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15),_inset_-1px_-1px_1px_rgba(0,0,0,0.8),_0_0px_0_#000,_0_2px_4px_rgba(0,0,0,0.6)] active:translate-y-[5px]"
              >
                <div className="w-6 h-1 bg-[#0a0a0a] rounded-full shadow-[1px_1px_0_rgba(255,255,255,0.05)]"></div>
              </button>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#FFCC00]"></div>
                <span className="text-[#FFCC00] font-sans font-bold text-[11px] tracking-[0.15em]">ANSWER</span>
              </div>
            </div>

          </div>

          {/* Bottom Panel */}
          <div className="absolute bottom-0 left-6 right-6 h-20 bg-[#111] rounded-t-xl flex items-center justify-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.3),inset_0_2px_0_rgba(255,255,255,0.05)] border-t border-x border-[#333]">
            {/* Logo Icon */}
            <div className="w-7 h-7 bg-[#FFCC00] rounded-full flex items-center justify-center">
              <div className="w-3 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                <span className="text-[#FFCC00] font-black text-sm leading-none tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>1</span>
              </div>
            </div>
            {/* Logo Text */}
            <span className="text-[#FFCC00] font-bold text-lg tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>Winter Garage Labs</span>
          </div>
        </div>

        {/* Fallen Papers (Absolute to machine) */}
        <div ref={paperContainerRef} className="absolute left-1/2 -translate-x-1/2 w-[92%] h-[300px] z-20 pointer-events-none" style={{ bottom: 'calc(100% - 36px)' }}>
          <AnimatePresence>
            {fallenPapers.map(paper => (
              <motion.div
                key={paper.id}
                drag
                dragMomentum={true}
                onDragEnd={(_, info) => handleDragEnd(paper.id, info)}
                initial={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                animate={{ 
                  y: 15 + Math.random() * 10, 
                  rotate: paper.rotate,
                  scale: 1
                }}
                exit={{ 
                  x: trashOffset.x,
                  y: trashOffset.y,
                  scale: 0, 
                  opacity: 0, 
                  rotate: paper.rotate + 120,
                  transition: { duration: 0.4, ease: "easeIn" }
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 50 }}
                className="absolute bottom-0 left-0 w-full bg-[#fdfbf7] shadow-[0_10px_25px_rgba(0,0,0,0.5)] pb-10 cursor-grab active:cursor-grabbing pointer-events-auto origin-bottom-right border-x border-b border-[#e2dfd8]"
              >
                {/* Jagged Top Edge */}
                <div className="absolute -top-[8px] left-0 w-full h-[8px] flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="flex-1 h-full bg-[#fdfbf7]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  ))}
                </div>

                {/* Jagged Bottom Edge */}
                <div className="absolute -bottom-[8px] left-0 w-full h-[8px] flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="flex-1 h-full bg-[#fdfbf7]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
                  ))}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFallenPapers(prev => prev.filter(p => p.id !== paper.id));
                  }}
                  className="absolute top-2 right-2 p-1.5 text-[#a39b8b] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10 cursor-pointer"
                  title="Delete paper"
                >
                  <X size={16} />
                </button>

                <div className="p-6 pt-8 flex flex-col items-center text-center gap-3 text-[#2c2c2c]">
                  <div className="w-8 h-8 rounded-full border border-[#d1cabc] flex items-center justify-center mb-1">
                    <span className="text-xl font-serif text-[#a39b8b] leading-none mt-2">"</span>
                  </div>
                  <div className="font-serif italic text-base sm:text-lg leading-relaxed px-2">
                    {paper.lines.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-[#d1cabc] w-full text-[10px] font-mono text-[#8a8476] uppercase tracking-widest">
                    {paper.type === 'riddle' ? "Today's Riddle" : 'The Answer'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Trash Can */}
      <div 
        ref={trashRef}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-[#444] z-30 text-[#666] transition-colors duration-200"
        title="Drag paper here to trash"
      >
        <Trash2 size={28} />
      </div>
    </div>
  );
}
