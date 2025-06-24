        // src/components/RMGHeader.tsx
        import React from 'react';
        import '../index.css'; // ייבוא ה-CSS הגלובלי

        interface RMGHeaderProps {
          text: string;
          level?: 1 | 2 | 3 | 4 | 5 | 6; // h1, h2, וכו'
          className?: string;
          style?: React.CSSProperties; // הוספנו תמיכה בסטייל inline
        }

        const RMGHeader: React.FC<RMGHeaderProps> = ({ text, level = 1, className, style }) => {
          const Tag = `h${level}` as keyof JSX.IntrinsicElements; // יצירת תגית דינמית (h1, h2 וכו')
          return (
            <Tag
              className={`rmg-header h${level} ${className || ''}`}
              style={style}
            >
              {text}
            </Tag>
          );
        }

        export default RMGHeader;
        