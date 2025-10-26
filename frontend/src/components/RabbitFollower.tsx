import { useEffect, useState, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

export const RabbitFollower = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [lastDirection, setLastDirection] = useState<"left" | "right">("right");
  const rabbitRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const randomOffsetRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Generate new random offset only occasionally (every 2 seconds or so)
      const now = Date.now();
      if (!randomOffsetRef.current.x || now % 2000 < 100) {
        randomOffsetRef.current = {
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 30,
        };
      }

      setTargetPosition({
        x: e.clientX + randomOffsetRef.current.x,
        y: e.clientY + randomOffsetRef.current.y,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      setPosition((prevPos) => {
        if (!rabbitRef.current) return prevPos;

        const diffX = targetPosition.x - prevPos.x;
        const diffY = targetPosition.y - prevPos.y;

        // Only update direction if there's significant movement
        if (Math.abs(diffX) > 5) {
          setLastDirection(diffX > 0 ? "right" : "left");
        }

        // Slower, more gentle movement - reduced from 0.15 to 0.08
        const easeFactor = 0.06;

        const newX = prevPos.x + diffX * easeFactor;
        const newY = prevPos.y + diffY * easeFactor;

        return { x: newX, y: newY };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetPosition]);

  // Use stable direction state instead of calculating from target
  const getDirection = () => {
    return lastDirection;
  };

  return (
    <div
      ref={rabbitRef}
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Rabbit Icon using SVG */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        className={`transition-transform duration-200 ${
          getDirection() === "right" ? "" : "scale-x-[-1]"
        }`}
        style={{
          filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        {/* Animations */}
        <defs>
          <animateTransform
            id="bounce"
            attributeName="transform"
            type="translate"
            values="0,0; 0,-3; 0,0"
            dur="0.4s"
            repeatCount="indefinite"
          />
          <animateTransform
            id="ear1"
            attributeName="transform"
            type="rotate"
            values="0 42 20; 5 42 20; 0 42 20"
            dur="0.3s"
            repeatCount="indefinite"
          />
          <animateTransform
            id="ear2"
            attributeName="transform"
            type="rotate"
            values="0 58 20; -5 58 20; 0 58 20"
            dur="0.3s"
            repeatCount="indefinite"
          />
          <animateTransform
            id="paw1"
            attributeName="transform"
            type="translate"
            values="0,0; 0,-2; 0,0"
            dur="0.35s"
            repeatCount="indefinite"
          />
          <animateTransform
            id="paw2"
            attributeName="transform"
            type="translate"
            values="0,-2; 0,0; 0,-2"
            dur="0.35s"
            repeatCount="indefinite"
          />
        </defs>

        {/* Rabbit body with bounce animation */}
        <g transform="translate(0,0)">
          <ellipse cx="50" cy="70" rx="25" ry="20" fill="white" />
        </g>

        {/* Rabbit head */}
        <circle cx="50" cy="40" r="20" fill="white" />

        {/* Ear 1 with animation */}
        <g transform-origin="42 20">
          <ellipse cx="42" cy="20" rx="5" ry="12" fill="white">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 42 20; 8 42 20; 0 42 20"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="42" cy="22" rx="3" ry="8" fill="#ffe0f0">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 42 22; 8 42 22; 0 42 22"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* Ear 2 with animation */}
        <g transform-origin="58 20">
          <ellipse cx="58" cy="20" rx="5" ry="12" fill="white">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 58 20; -8 58 20; 0 58 20"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="58" cy="22" rx="3" ry="8" fill="#ffe0f0">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 58 22; -8 58 22; 0 58 22"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* Eye 1 */}
        <circle cx="45" cy="38" r="4" fill="black" />
        <circle cx="46.5" cy="36.5" r="1.5" fill="white" />

        {/* Eye 2 */}
        <circle cx="55" cy="38" r="4" fill="black" />
        <circle cx="56.5" cy="36.5" r="1.5" fill="white" />

        {/* Nose */}
        <ellipse cx="50" cy="45" rx="2" ry="1.5" fill="black" />

        {/* Mouth */}
        <path
          d="M50 47 Q48 50 46 49"
          stroke="black"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M50 47 Q52 50 54 49"
          stroke="black"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Front paws with alternating animation */}
        <ellipse cx="40" cy="75" rx="4" ry="3" fill="white">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-3; 0,0"
            dur="0.3s"
            repeatCount="indefinite"
          />
        </ellipse>

        <ellipse cx="60" cy="75" rx="4" ry="3" fill="white">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,-3; 0,0; 0,-3"
            dur="0.3s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Back paws with alternating animation */}
        <ellipse cx="45" cy="85" rx="4" ry="3" fill="white">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-3; 0,0"
            dur="0.3s"
            begin="0.15s"
            repeatCount="indefinite"
          />
        </ellipse>

        <ellipse cx="55" cy="85" rx="4" ry="3" fill="white">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,-3; 0,0; 0,-3"
            dur="0.3s"
            begin="0.15s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    </div>
  );
};
