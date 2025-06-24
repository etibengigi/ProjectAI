import React, { useState, useEffect } from 'react'; // ייבוא useEffect
import './index.css'; 
import RMGButton from './components/RMGButton';
import RMGHeader from './components/RMGHeader';
import RMGText from './components/RMGText';
import RMGInput from './components/RMGInput';
import RMGImage from './components/RMGImage'; 
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'; 

// רכיב לרינדור קוד JSX כ-HTML באמצעות Regex (עם תמיכה משופרת בסגנונות ותוויות)
const HtmlPreviewRenderer: React.FC<{ jsxCode: string }> = ({ jsxCode }) => {
  const [error, setError] = useState<string>('');

  const renderAsHTML = () => {
    try {
      if (!jsxCode.trim()) return { __html: '<div class="preview-placeholder">הדגם יופיע כאן...</div>' };

      let htmlCode = jsxCode;

      const extractProps = (tagString: string): { [key: string]: string | React.CSSProperties } => {
        const props: { [key: string]: string | React.CSSProperties } = {};
        
        // Regex for attributes: key="value" OR key={value}
        const attrRegex = /(\w+)=(?:"([^"]*)"|{([^}]*)})/g;
        let match;
        while ((match = attrRegex.exec(tagString)) !== null) {
          const key = match[1];
          let value = match[2] || match[3]; // Group 2 for string, Group 3 for expression in curly braces

          if (key === 'style') {
            try {
              // Extract content within curly braces if present
              let styleContent = value.startsWith('{') && value.endsWith('}') ? value.slice(1, -1) : value;
              
              const styleProps: { [key: string]: string } = {};
              // Regex to parse CSS-like key: value pairs, even without quotes on values
              // Handles: key: 'value', key: "value", key: value, key: #hex, key: rgb(...)
              const stylePropRegex = /(\w+)\s*:\s*([^,;{}]+)/g; 
              let styleMatch;
              while ((styleMatch = stylePropRegex.exec(styleContent)) !== null) {
                const propKey = styleMatch[1].trim();
                let propValue = styleMatch[2].trim();
                // Remove surrounding quotes from the value if they exist
                propValue = propValue.replace(/^['"]|['"]$/g, ''); 
                styleProps[propKey] = propValue;
              }

              // Convert camelCase to kebab-case and join into a CSS string
              const cssStyle = Object.entries(styleProps)
                .map(([cssKey, cssValue]) => {
                  const kebabKey = cssKey.replace(/([A-Z])/g, '-$1').toLowerCase();
                  return `${kebabKey}: ${cssValue}`;
                })
                .join('; ');
              props.style = cssStyle;
              // console.log(`Parsed style for ${key}:`, cssStyle); // Debug log
            } catch (e) {
              console.warn("שגיאה בניתוח סגנון inline:", e, value);
              props.style = ''; // Fallback to empty style if parsing fails
            }
          } else {
            props[key] = value;
          }
        }
        return props;
      };

      // RMGHeader - ensure style is applied
      htmlCode = htmlCode.replace(/<RMGHeader([^>]*?)\/?>/g, (match, attrs) => {
        const props = extractProps(attrs);
        const text = props.text as string || 'כותרת';
        const level = props.level as string || '1';
        const className = props.className as string || '';
        const style = props.style ? ` style="${props.style}"` : '';
        return `<h${level} class="rmg-header h${level} ${className}"${style}>${text}</h${level}>`;
      });

      // RMGText - ensure style is applied
      htmlCode = htmlCode.replace(/<RMGText([^>]*?)>(.*?)<\/RMGText>/g, (match, attrs, content) => {
        const props = extractProps(attrs);
        const className = props.className as string || '';
        const style = props.style ? ` style="${props.style}"` : '';
        return `<p class="rmg-text ${className}"${style}>${content}</p>`;
      });

      // RMGInput - ensure style is applied, handles label and placeholder
      htmlCode = htmlCode.replace(/<RMGInput([^>]*?)\/?>/g, (match, attrs) => {
        const props = extractProps(attrs);
        const type = props.type as string || 'text';
        const placeholder = props.placeholder as string || ''; 
        const label = props.label as string | undefined; 
        const className = props.className as string || '';
        const style = props.style ? ` style="${props.style}"` : '';
        
        return `
          <div class="input-group-item">
            ${label ? `<label class="rmg-label">${label}</label>` : ''}
            <input type="${type}" placeholder="${placeholder}" class="rmg-input ${className}"${style} />
          </div>
        `;
      });

      // RMGButton - ensures style is applied
      htmlCode = htmlCode.replace(/<RMGButton([^>]*?)(?:\/>|><\/RMGButton>)/g, (match, attrs) => {
        const props = extractProps(attrs);
        const title = props.title as string || 'כפתור';
        const className = props.className as string || '';
        const style = props.style ? ` style="${props.style}"` : '';
        return `<button class="rmg-button ${className}"${style} onclick="alert('נלחץ בתצוגה!')">${title}</button>`;
      });

      // RMGImage - ensures style is applied
      htmlCode = htmlCode.replace(/<RMGImage([^>]*?)\/?>/g, (match, attrs) => {
        const props = extractProps(attrs);
        const src = props.src as string || 'https://via.placeholder.com/100x100?text=תמונה';
        const alt = props.alt as string || 'תמונה';
        const className = props.className as string || '';
        const style = props.style ? ` style="${props.style}"` : '';
        return `<img src="${src}" alt="${alt}" class="rmg-image ${className}"${style} />`;
      });

      // Clean up empty lines created by replacements
      htmlCode = htmlCode.replace(/^\s*[\r\n]/gm, ''); 
      // Wrap the generated HTML in a single div for consistent rendering
      htmlCode = `<div class="preview-wrapper">${htmlCode}</div>`;

      return { __html: htmlCode };
    } catch (err: any) {
      console.error('שגיאה ברינדור התצוגה המקדימה:', err);
      setError(`שגיאה בתצוגה מקדימה: ${err.message || String(err)}. וודא שקוד ה-JSX שקיבלת תקין.`);
      return { __html: `<div class="live-preview-error">שגיאה בתצוגה מקדימה: ${error}</div>` };
    }
  };

  return (
    <div className="live-preview-container">
      {error ? (
        <div className="live-preview-error">{error}</div>
      ) : (
        <div 
          dangerouslySetInnerHTML={renderAsHTML()} 
          className="live-preview-output" 
        />
      )}
    </div>
  );
};


function App() {
  const [description, setDescription] = useState<string>('');
  const [generatedJsx, setGeneratedJsx] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null); 
  const [showCodeView, setShowCodeView] = useState<boolean>(false); // ברירת מחדל לתצוגה ויזואלית בפופ-אפ
  const [showPopup, setShowPopup] = useState<boolean>(false); 

  // useEffect לניהול גלילת ה-body כשהפופ-אפ פתוח
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden'; // מונע גלילה של הדף הראשי
    } else {
      document.body.style.overflow = 'unset'; // מחזיר את הגלילה למצב רגיל
    }
    // פונקציית ניקוי: וודא שהגלילה חוזרת למצב תקין גם כשהרכיב נעלם
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]); // תלוי בסטייט של הפופ-אפ

  const handleGenerateClick = async () => {
    setLoading(true);
    setError(null); 
    setGeneratedJsx(''); 
    setExplanation(null); 
    setShowCodeView(false); // ברירת מחדל לתצוגה ויזואלית בפופ-אפ

    try {
      const response = await fetch('http://localhost:5000/api/generate-mockup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'נכשל ביצירת JSX מהשרת.');
      }

      const data = await response.json();
      setGeneratedJsx(data.jsx);
      setShowPopup(true); // פתח את הפופ-אפ לאחר יצירת הקוד בהצלחה
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCode = () => {
    if (!generatedJsx) {
      alert('אין קוד להורדה!'); 
      return;
    }

    const blob = new Blob([generatedJsx], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_mockup.jsx'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
    URL.revokeObjectURL(url);
  };

  const handleExplainCode = async () => {
    if (!generatedJsx) {
      alert('אין קוד להסבר!');
      return;
    }
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await fetch('http://localhost:5000/api/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jsxCode: generatedJsx }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'נכשל בקבלת הסבר מהשרת.');
      }

      const data = await response.json();
      setExplanation(data.explanation); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <RMGHeader text="מחולל דגמים" level={1} className="h1" /> 
      <RMGText content="הכנס תיאור לדגם ה-React שברצונך ליצור (לדוגמה: 'טופס הרשמה עם שדות שם וסיסמה, וכפתור אישור')." 
                 className="rmg-text" /> 

      <textarea
        className="rmg-input" 
        placeholder="לדוגמה: 'כרטיס פרופיל משתמש עם תמונה עגולה, שם וכפתור עקוב.'"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      ></textarea>
      
      <RMGButton
        title={loading ? "יוצר קוד..." : "צור קוד JSX"} 
        onClick={handleGenerateClick}
        disabled={loading || description.trim() === ''}
      />
      {error && <p style={{ color: 'red', marginTop: '10px' }}>שגיאה: {error}</p>}

      {/* Pop-up modal */}
      {showPopup && (
        <div className="modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> 
            <button className="modal-close-button" onClick={() => setShowPopup(false)}>
              &times;
            </button>

            <div className="code-output-section"> 
              {/* כפתור מעבר בין תצוגות - בתוך הפופ-אפ */}
              <div className="button-group view-toggle-group">
                <RMGButton
                  title={showCodeView ? "הצג תצוגה ויזואלית" : "הצג קוד JSX"}
                  onClick={() => setShowCodeView(!showCodeView)}
                  className="view-toggle-button" 
                />
              </div>

              {/* הצגת קוד או תצוגה מקדימה באופן מותנה */}
              {showCodeView ? (
                <>
                  <RMGHeader text="קוד JSX שנוצר" level={2} className="h2-small" /> 
                  <div className="code-block-container"> 
                    <SyntaxHighlighter language="jsx" style={docco}>
                      {generatedJsx}
                    </SyntaxHighlighter>
                  </div>
                </>
              ) : (
                <>
                  <RMGHeader text="תצוגה מקדימה חיה" level={2} className="h2-small" /> 
                  <HtmlPreviewRenderer jsxCode={generatedJsx} />
                </>
              )}

              {/* כפתורי פעולה (העתקה, הורדה, הסבר) */}
              <div className="button-group code-actions-group"> 
                <RMGButton
                  title="העתק קוד" 
                  onClick={() => navigator.clipboard.writeText(generatedJsx)}
                  className="copy" 
                />
                <RMGButton
                  title="הורד קוד (.jsx)" 
                  onClick={handleDownloadCode}
                  className="download" 
                />
                <RMGButton
                  title={loading ? "יוצר הסבר..." : "הסבר קוד ✨"} 
                  onClick={handleExplainCode}
                  className="explain" 
                  disabled={loading}
                />
              </div>

              {/* אזור להצגת ההסבר שנוצר (נשאר תמיד אם קיים) */}
              {explanation && (
                <div className="explanation-container"> 
                  <RMGHeader text="הסבר על הקוד" level={3} className="h2-small" /> 
                  <RMGText content={explanation} className="explanation-text" /> 
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
