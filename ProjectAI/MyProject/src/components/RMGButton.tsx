        // src/components/RMGButton.tsx
        import React from 'react';
        import '../index.css'; // ייבוא ה-CSS הגלובלי

        interface RMGButtonProps {
          title: string;
          onClick?: () => void;
          className?: string; // עבור קלאסים נוספים
          style?: React.CSSProperties; // הוספנו תמיכה בסטייל inline
        }

        const RMGButton: React.FC<RMGButtonProps> = ({ title, onClick, className, style }) => {
          return (
            <button
              onClick={onClick}
              className={`rmg-button ${className || ''}`} // שימוש בקלאס CSS שלנו
              style={style}
            >
              {title}
            </button>
          );
        }

        export default RMGButton;
        