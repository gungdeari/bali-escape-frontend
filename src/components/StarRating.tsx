import { useState } from "react";

type Props = {
  value: number;                   
  onChange?: (rating: number) => void; 
  readonly?: boolean;               
  size?: "sm" | "md" | "lg";     
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: Props) {

  const [hoverValue, setHoverValue] = useState(0);

  const sizeClass = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  }[size];

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"           
          disabled={readonly}   
          onClick={() => {
            if (!readonly && onChange) onChange(star);
          }}
          onMouseEnter={() => {
            if (!readonly) setHoverValue(star);
          }}
          onMouseLeave={() => {
            if (!readonly) setHoverValue(0);
          }}
          className={`
            ${readonly ? "cursor-default" : "cursor-pointer"}
            transition-colors duration-100
            disabled:pointer-events-none
          `}
        >
          <svg
            className={sizeClass}
            viewBox="0 0 20 20"
            fill={star <= displayValue ? "#F59E0B" : "none"}
            stroke={star <= displayValue ? "#F59E0B" : "#D1D5DB"}
            strokeWidth="1.5"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}