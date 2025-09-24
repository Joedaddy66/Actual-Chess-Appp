import React, { useState, useLayoutEffect, useRef } from 'react';

const tutorialSteps = [
  {
    element: '[data-tutorial="step-1"]',
    title: 'The Thin Client (Front-End)',
    description: 'This is what you see and interact with. It contains very little game logic. Its main job is to display the game board and send your moves to the Core Engine. Notice you can switch game modes here—the client just tells the engine which game to play.',
  },
  {
    element: '[data-tutorial="step-2"]',
    title: 'The Core Engine (Back-End)',
    description: "This is the brain. It receives commands (like 'move A2 to A3'), validates them against the game rules (for either Leviathan or Chess), calculates the AI's counter-move, and sends the new game state back to the client. The Request/Response cycle is visualized here.",
  },
  {
    element: '[data-tutorial="step-3"]',
    title: 'The CI/CD Pipeline',
    description: 'This is the automated assembly line. In a real-world scenario, any code change to the Core Engine or the Client would trigger this pipeline to automatically test, build, and deploy updates, ensuring rapid and reliable development.',
  },
];

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorialSteps[stepIndex];

  useLayoutEffect(() => {
    const targetElement = document.querySelector(currentStep.element);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setHighlightStyle({
        width: `${rect.width + 20}px`,
        height: `${rect.height + 20}px`,
        top: `${rect.top - 10}px`,
        left: `${rect.left - 10}px`,
      });
      
      const tooltipHeight = 150; // Approximate height of the tooltip
      const spaceBelow = window.innerHeight - rect.bottom;
      
      if (spaceBelow > tooltipHeight + 20) {
        setTooltipStyle({
            top: `${rect.bottom + 15}px`,
            left: `${rect.left}px`,
            maxWidth: `${rect.width}px`
        });
      } else {
         setTooltipStyle({
            bottom: `${window.innerHeight - rect.top + 15}px`,
            left: `${rect.left}px`,
            maxWidth: `${rect.width}px`
        });
      }
    }
  }, [stepIndex, currentStep.element]);

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={handleNext}>
      <div 
        className="absolute border-2 border-red-500 border-dashed rounded-lg transition-all duration-300 ease-in-out pointer-events-none"
        style={highlightStyle}
      ></div>
      <div 
        className="absolute bg-gray-900 p-4 rounded-lg shadow-2xl border border-red-500/50"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-cinzel text-lg text-red-400 mb-2">{currentStep.title}</h3>
        <p className="text-gray-300 text-sm mb-4">{currentStep.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{stepIndex + 1} / {tutorialSteps.length}</span>
          <div>
            {stepIndex > 0 && (
              <button onClick={handlePrev} className="text-gray-400 hover:text-white mr-4">
                Prev
              </button>
            )}
            <button onClick={handleNext} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded">
              {stepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;