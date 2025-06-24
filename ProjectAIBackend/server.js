// mockup-generator-api/server.js
require('dotenv').config(); // טוען משתני סביבה מהקובץ .env
const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000; // פורט ברירת מחדל לשרת ה-API

// Middleware
app.use(cors()); // מאפשר בקשות Cross-Origin מה-React App
app.use(express.json()); // מאפשר לנתח בקשות עם גוף JSON

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; 

// נקודת קצה (API Endpoint) ליצירת דגמים
app.post('/api/generate-mockup', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'תיאור נדרש ליצירת הדגם.' });
  }

  try {
    let chatHistory = [];
    // הנחיה משופרת למודל AI ליצור קוד JSX עם סגנונות inline
    const prompt = `
      צור קטע קוד JSX עבור React על בסיס התיאור הבא: "${description}".
      השתמש אך ורק ברכיבי ה-React הבאים: RMGHeader, RMGText, RMGInput, RMGButton, RMGImage.
      אל תכלול ייבוא (imports) לקבצים אלו.
      
      **עבור צבעים וסגנונות מותאמים אישית (כמו צבע רקע, צבע טקסט, גודל גופן), השתמש תמיד בתכונת \`style\` עם אובייקט JavaScript inline. לדוגמה: \`style={{ backgroundColor: 'red', color: 'white', fontSize: '16px' }}\`.**
      
      ספק אך ורק את קטע קוד ה-JSX, ללא הסברים נוספים או עטיפות קוד כמו \`\`\`jsx.
      ודא שהקוד תקין ומעוצב היטב.
      
      דוגמאות:
      - אם תתבקש 'כפתור אדום עם טקסט לבן', צור: \`<RMGButton title="לחץ" style={{ backgroundColor: 'red', color: 'white' }} />\`
      - אם תתבקש 'טקסט ירוק', צור: \`<RMGText content="טקסט ירוק" style={{ color: 'green' }} />\`
      - אם תתבקש 'שדה קלט שם בצבע רקע תכלת וטקסט כחול', צור: \`<RMGInput label="שם:" type="text" style={{ backgroundColor: 'lightblue', color: 'blue' }} />\`
      
      הקפד לתרגם את התיאורים לפרמטרים של הרכיבים (כמו title, label, placeholder).
    `;
    
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json(); 

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const generatedCode = result.candidates[0].content.parts[0].text;
      
      const jsxCode = generatedCode.replace(/```jsx\n|```/g, '').trim();

      res.json({ jsx: jsxCode });
    } else {
      console.error('מבנה תגובה לא צפוי מה-Gemini API:', JSON.stringify(result, null, 2));
      res.status(500).json({ error: 'נכשל ביצירת JSX. מבנה תגובה לא צפוי.' });
    }

  } catch (error) {
    console.error('שגיאה ביצירת הדגם דרך Gemini API:', error);
    res.status(500).json({ error: 'נכשל ביצירת הדגם. אנא נסה שוב מאוחר יותר.' });
  }
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`שרת מחולל הדגמים מאזין בכתובת: http://localhost:${port}`);
});
