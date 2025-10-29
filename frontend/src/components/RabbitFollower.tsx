import { useEffect, useState, useRef, useId } from "react";

interface Position {
  x: number;
  y: number;
}

export const RabbitFollower = () => {
  const uniqueId = useId();
  const clipPathId = `rabbit-body-clip-${uniqueId.replace(/:/g, "")}`;
  const leftEarClipId = `${clipPathId}-left-ear`;
  const rightEarClipId = `${clipPathId}-right-ear`;
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

  const outlineColor = "#4f52d4";
  const leftFill = "#6f7dff";
  const rightFill = "#f6f7ff";
  const earInner = "#dbe4ff";
  const earHighlight = "#ffffff";
  const noseColor = "#ff8faf";
  const eyeColor = "#7168ff";
  const cheekColor = "#8592ff";
  const noseHighlight = "#ffe4ef";

  const bodyPath =
    "M82 32 C70 30 60 36 54 46 C48 54 40 60 32 68 C20 80 14 98 20 114 C12 122 8 136 14 148 C18 156 28 166 38 168 A20 20 0 0 0 56 158 A16 16 0 0 0 68 166 A16 16 0 0 0 86 170 A20 20 0 0 0 108 160 A20 20 0 0 0 122 156 C136 152 134 138 134 122 C144 106 140 86 126 72 C116 62 106 54 100 44 C94 34 88 32 82 32 Z";
  const leftEarPath =
    "M64 12 C50 4 34 12 32 28 C30 46 42 68 56 78 C70 66 76 48 74 32 C72 22 70 16 64 12 Z";
  const rightEarPath =
    "M96 12 C110 4 126 12 128 28 C130 46 118 68 104 78 C90 66 84 48 86 32 C88 22 90 16 96 12 Z";

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
        width="90"
        height="90"
        viewBox="0 0 160 180"
        className={`transition-transform duration-200 ${
          getDirection() === "right" ? "" : "scale-x-[-1]"
        }`}
        style={{
          filter: "drop-shadow(0px 12px 16px rgba(0, 0, 0, 0.35))",
        }}
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={bodyPath} />
          </clipPath>
          <clipPath id={leftEarClipId}>
            <path d={leftEarPath} />
          </clipPath>
          <clipPath id={rightEarClipId}>
            <path d={rightEarPath} />
          </clipPath>
        </defs>

        {/* Ears */}
        <g>
          <g>
            <path
              d={leftEarPath}
              fill={leftFill}
              stroke={outlineColor}
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <g clipPath={`url(#${leftEarClipId})`}>
              <ellipse cx="50" cy="32" rx="10" ry="18" fill={earInner} opacity={0.85} />
              <ellipse
                cx="54"
                cy="22"
                rx="6"
                ry="10"
                fill={earHighlight}
                opacity={0.8}
              />
            </g>
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -1.5 3; 0 0"
                dur="0.45s"
                repeatCount="indefinite"
              />
            )}
          </g>

          <g>
            <path
              d={rightEarPath}
              fill={rightFill}
              stroke={outlineColor}
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <g clipPath={`url(#${rightEarClipId})`}>
              <ellipse cx="110" cy="32" rx="10" ry="18" fill={earInner} opacity={0.65} />
              <ellipse
                cx="106"
                cy="20"
                rx="6"
                ry="10"
                fill={earHighlight}
                opacity={0.75}
              />
            </g>
            {isMoving && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 1.5 3; 0 0"
                dur="0.45s"
                begin="0.1s"
                repeatCount="indefinite"
              />
            )}
          </g>
        </g>

        {/* Body */}
        <g clipPath={`url(#${clipPathId})`}>
          <path d={bodyPath} fill={rightFill} />
          <rect x="0" y="0" width="80" height="180" fill={leftFill} />
          <circle cx="42" cy="138" r="22" fill="#6372ff" opacity={0.85} />
          <ellipse cx="66" cy="150" rx="16" ry="20" fill="#6d7aff" opacity={0.9} />
          <ellipse cx="112" cy="150" rx="13" ry="18" fill={rightFill} />
          <ellipse cx="128" cy="144" rx="11" ry="16" fill={rightFill} />
        </g>
        <path
          d={bodyPath}
          fill="none"
          stroke={outlineColor}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M80 56 L80 150"
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Face details */}
        <ellipse cx="68" cy="108" rx="12" ry="14" fill={cheekColor} opacity={0.72} />
        <circle cx="80" cy="108" r="5" fill={noseColor} />
        <circle cx="82" cy="106" r="2.4" fill={noseHighlight} />
        <path
          d="M94 112 Q104 122 118 114"
          stroke={outlineColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M94 104 Q102 96 112 100"
          stroke={earHighlight}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity={0.55}
        />
        <circle cx="106" cy="100" r="6" fill={eyeColor} />
        <circle cx="108" cy="98" r="2" fill={earHighlight} />
        <circle cx="88" cy="126" r="4" fill={noseColor} opacity={0.5} />
      </svg>
    </div>
  );
};
