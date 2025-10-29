import { useEffect, useState, useRef, useId } from "react";

interface Position {
  x: number;
  y: number;
}

export const RabbitFollower = () => {
  const uniqueId = useId();
  const clipPathId = `rabbit-body-clip-${uniqueId.replace(/:/g, "")}`;
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

  const outlineColor = "#1f3c88";
  const bodyPrimary = "#ffffff";
  const bodySecondary = "#9fbaff";
  const earInner = "#dbe6ff";
  const noseColor = "#ff718b";
  const eyeColor = "#7358ff";

  const bodyPath =
    "M36 78c0-22 19-40 43-40s43 18 43 40-19 40-43 40H60c-15 0-27-12-27-27 0-5 1-10 3-13Z";
  const frontEarPath =
    "M52 14c-5 0-9 4-9 10 0 13 7 30 15 39 8-9 15-26 15-39 0-6-4-10-9-10Z";
  const backEarPath =
    "M68 10c-5 0-9 4-9 9 0 12 6 28 13 37 7-9 13-25 13-37 0-5-4-9-9-9Z";

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
        width="70"
        height="70"
        viewBox="0 0 140 140"
        className={`transition-transform duration-200 ${
          getDirection() === "right" ? "" : "scale-x-[-1]"
        }`}
        style={{
          filter: "drop-shadow(3px 4px 6px rgba(0,0,0,0.3))",
        }}
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={bodyPath} />
          </clipPath>
        </defs>

        {/* Back ear */}
        <path
          d={backEarPath}
          fill={bodySecondary}
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinejoin="round"
        >
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 3; 0 0"
              dur="0.4s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Front ear */}
        <path
          d={frontEarPath}
          fill={bodyPrimary}
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinejoin="round"
        >
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 3; 0 0"
              dur="0.4s"
              begin="0.1s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path
          d="M58 20c-3 0-5 2-5 6 0 9 5 20 9 26 4-6 9-17 9-26 0-4-2-6-5-6Z"
          fill={earInner}
        >
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 0 3; 0 0"
              dur="0.4s"
              begin="0.1s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Body */}
        <g>
          <path d={bodyPath} fill={bodyPrimary} stroke="none" />
          <rect
            x="60"
            y="32"
            width="70"
            height="90"
            fill={bodySecondary}
            clipPath={`url(#${clipPathId})`}
            style={{ transition: "fill 0.3s ease" }}
          />
          <path
            d={bodyPath}
            fill="none"
            stroke={outlineColor}
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </g>

        {/* Tail */}
        <g>
          <circle
            cx="120"
            cy="96"
            r="12"
            fill={bodySecondary}
            stroke={outlineColor}
            strokeWidth="6"
          />
        </g>

        {/* Head */}
        <g>
          <circle
            cx="58"
            cy="64"
            r="22"
            fill={bodyPrimary}
            stroke={outlineColor}
            strokeWidth="6"
          />
          <path
            d="M65 60c6-5 14-8 22-8"
            stroke={outlineColor}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Eye */}
        <g>
          <circle cx="70" cy="62" r="4" fill={eyeColor} />
          <circle cx="71.5" cy="60.5" r="1.5" fill="#fff" />
        </g>

        {/* Nose */}
        <circle cx="78" cy="72" r="3" fill={noseColor} />

        {/* Mouth */}
        <path
          d="M74 78c2 3 6 4 10 3"
          stroke={outlineColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Chest curve */}
        <path
          d="M52 84c-8 4-12 10-12 18"
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Front foot */}
        <path
          d="M44 108c10-10 22-16 36-16"
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        >
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; -2 2; 0 0"
              dur="0.4s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Back leg */}
        <path
          d="M82 112c10 0 18-4 24-12"
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        >
          {isMoving && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 2 2; 0 0"
              dur="0.4s"
              begin="0.2s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>
    </div>
  );
};
