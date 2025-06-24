        // src/components/RMGInput.tsx
        import React from 'react';
        import '../index.css'; // ייבוא ה-CSS הגלובלי

        interface RMGInputProps {
          type: string;
          placeholder?: string;
          value?: string;
          onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
          className?: string;
          style?: React.CSSProperties; // הוספנו תמיכה בסטייל inline
        }

        const RMGInput: React.FC<RMGInputProps> = ({ type, placeholder, value, onChange, className, style }) => {
          return (
            <input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              className={`rmg-input ${className || ''}`}
              style={style}
            />
          );
        }

        export default RMGInput;
        