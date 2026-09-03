import { useEffect, useRef, useState } from "react";

/** Walks through `stepCount` controls one at a time whenever `active` turns on. */
export function useHelpTour(active, stepCount, stepDuration = 1100) {
  const [activeStep, setActiveStep] = useState(-1);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (!active || stepCount === 0) {
      // Reset the tour immediately when help mode turns off.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveStep(-1);
      return undefined;
    }

    for (let step = 0; step < stepCount; step += 1) {
      timeoutsRef.current.push(setTimeout(() => setActiveStep(step), step * stepDuration));
    }
    timeoutsRef.current.push(setTimeout(() => setActiveStep(-1), stepCount * stepDuration));

    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [active, stepCount, stepDuration]);

  return activeStep;
}
