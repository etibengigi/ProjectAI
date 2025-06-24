        // src/components/RMGText.tsx
        import React from 'react';
        import '../index.css'; // ייבוא ה-CSS הגלובלי

        interface RMGTextProps {
          content: string;
          className?: string;
          style?: React.CSSProperties; // הוספנו תמיכה בסטייל inline
        }

        const RMGText: React.FC<RMGTextProps> = ({ content, className, style }) => {
          return (
            <p
              className={`rmg-text ${className || ''}`}
              style={style}
            >
              {content}
            </p>
          );
        }

        export default RMGText;
        