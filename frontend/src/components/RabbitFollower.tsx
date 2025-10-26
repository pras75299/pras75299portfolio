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
  const [isMoving, setIsMoving] = useState(false);
  const rabbitRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const randomOffsetRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Generate new random offset only occasionally (every 2 seconds or so)
      const now = Date.now();
      if (!randomOffsetRef.current.x || now % 2000 < 100) {
        randomOffsetRef.current = {
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
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
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        // Check if rabbit is actually moving
        const moving = distance > 1;
        setIsMoving(moving);

        // Only update direction if there's significant movement
        if (Math.abs(diffX) > 3) {
          setLastDirection(diffX > 0 ? "right" : "left");
        }

        // Slower, more visible movement for better running effect
        const easeFactor = 0.04;

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
      {/* Rabbit Icon using SVG with running animation */}
      <svg
        width="50"
        height="50"
        viewBox="0 0 100 100"
        className={`transition-transform duration-200 ${
          getDirection() === "right" ? "" : "scale-x-[-1]"
        }`}
        style={{
          filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        {/* Rabbit head */}
        <circle cx="50" cy="35" r="18" fill="#fff" />

        {/* Ears with bobbing animation */}
        <ellipse cx="42" cy="18" rx="4" ry="11" fill="#fff">
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,3; 0,0"
              dur="0.35s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>
        <ellipse cx="42" cy="20" rx="2.5" ry="7" fill="#ffe0f0">
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,3; 0,0"
              dur="0.35s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>

        <ellipse cx="58" cy="18" rx="4" ry="11" fill="#fff">
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,3; 0,0"
              dur="0.35s"
              begin="0.18s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>
        <ellipse cx="58" cy="20" rx="2.5" ry="7" fill="#ffe0f0">
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 0,3; 0,0"
              dur="0.35s"
              begin="0.18s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>

        {/* Eyes */}
        <circle cx="46" cy="34" r="3" fill="#000" />
        <circle cx="54" cy="34" r="3" fill="#000" />
        <circle cx="47" cy="33" r="1" fill="#fff" />
        <circle cx="55" cy="33" r="1" fill="#fff" />

        {/* Nose */}
        <ellipse cx="50" cy="39" rx="1.5" ry="1" fill="#000" />

        {/* Mouth - neutral when moving, smiling when stopped with smooth transition */}
        <g>
          <path
            d={isMoving ? "M 50 40 Q 48 42 46 41" : "M 50 41 Q 48 45 44 43"}
            stroke="#000"
            strokeWidth={isMoving ? "1" : "1.5"}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: "all 0.4s ease-in-out",
            }}
          />
          <path
            d={isMoving ? "M 50 40 Q 52 42 54 41" : "M 50 41 Q 52 45 56 43"}
            stroke="#000"
            strokeWidth={isMoving ? "1" : "1.5"}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: "all 0.4s ease-in-out",
            }}
          />
        </g>

        {/* Body */}
        <ellipse cx="50" cy="65" rx="22" ry="16" fill="#fff" />

        {/* Front left leg */}
        <g>
          <ellipse cx="40" cy="70" rx="5" ry="12" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -3,5; 0,0"
                dur="0.35s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          {/* Paw */}
          <ellipse cx="40" cy="78" rx="4" ry="2.5" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; -3,5; 0,0"
                dur="0.35s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </g>

        {/* Front right leg */}
        <g>
          <ellipse cx="60" cy="70" rx="5" ry="12" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,5; -3,0; 0,5"
                dur="0.35s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          {/* Paw */}
          <ellipse cx="60" cy="78" rx="4" ry="2.5" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,5; -3,0; 0,5"
                dur="0.35s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </g>

        {/* Back left leg */}
        <g>
          <ellipse cx="45" cy="77" rx="5" ry="14" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 3,5; 0,0"
                dur="0.35s"
                begin="0.18s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          {/* Paw */}
          <ellipse cx="45" cy="86" rx="4" ry="2.5" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 3,5; 0,0"
                dur="0.35s"
                begin="0.18s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </g>

        {/* Back right leg */}
        <g>
          <ellipse cx="55" cy="77" rx="5" ry="14" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,5; 3,0; 0,5"
                dur="0.35s"
                begin="0.18s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          {/* Paw */}
          <ellipse cx="55" cy="86" rx="4" ry="2.5" fill="#fff">
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,5; 3,0; 0,5"
                dur="0.35s"
                begin="0.18s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </g>
      </svg>
    </div>
  );
};
