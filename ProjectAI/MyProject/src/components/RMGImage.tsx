// src/components/RMGImage.tsx
import React from 'react';
import '../index.css'; // ייבוא ה-CSS הגלובלי

interface RMGImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties; // הוספנו תמיכה בסטייל inline
}

const RMGImage: React.FC<RMGImageProps> = ({ src, alt, className, style }) => {
  // מצב פנימי לניהול אם התמונה נטענה בהצלחה או נכשלה
  const [imageError, setImageError] = React.useState(false);

  // פונקציה שתופעל אם טעינת התמונה נכשלה
  const handleError = () => {
    setImageError(true);
  };

  // כתובת URL לתמונת Placeholder חלופית
  // ניתן לשנות את הגודל (100x100), צבעי הרקע והטקסט, ואת הטקסט עצמו.
  const placeholderSrc = "https://placehold.co/100x100/CCCCCC/333333?text=Image+Error"; 

  return (
    <img
      // אם יש שגיאת טעינה, נשתמש בתמונת ה-placeholder, אחרת נשתמש ב-src המקורי
      src={imageError ? placeholderSrc : src}
      alt={alt}
      className={`rmg-image ${className || ''}`}
      style={style}
      onError={handleError} // הפונקציה שתטפל בשגיאות טעינה
    />
  );
}

export default RMGImage;
