 console.log('--- Server script is starting ---'); // הוסף את השורה הזו
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000; 


app.use(cors()); 

app.use(express.json()); 


const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""; 


app.post('/api/generate-mockup', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'תיאור נדרש ליצירת הדגם.' });
  }

  if (!GEMINI_API_KEY) {
      console.error('שגיאה: GEMINI_API_KEY אינו מוגדר בקובץ .env. אנא הגדר אותו כראוי.');
      return res.status(500).json({ error: 'מפתח API של Gemini חסר או לא תקין בשרת.' });
  }

  try {
    let chatHistory = [];

    const prompt = `צור קטע קוד JSX עבור React על בסיס התיאור הבא: "${description}". 
      השתמש אך ורק ברכיבי ה-React הבאים: RMGHeader, RMGText, RMGInput, RMGButton, RMGImage. 
      אל תכלול ייבוא (imports) לקבצים אלו, ואל תכלול שום עיצוב CSS חיצוני או inline, אלא אם כן 
      זה הכרחי (אז תשתמש ב-style={{}}). ספק אך ורק את קטע קוד ה-JSX, ללא הסברים נוספים. 
      ודא שהקוד תקין ומעוצב היטב. לדוגמה: <RMGButton title="לחץ" />`;
    
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('\n--- Gemini API Request Log ---');
    console.log('1. Prompt שנשלח ל-Gemini API:', prompt); // לוג 1: מראה מה נשלח ל-AI
    console.log('2. Payload (גוף הבקשה ל-AI):', JSON.stringify(payload, null, 2)); // לוג 2: מראה את גוף הבקשה ל-AI
    console.log('3. API URL:', apiUrl); 

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('4. סטטוס תגובה גולמית מ-Gemini API:', response.status); // לוג 4: מראה את סטטוס התגובה הגולמית (לדוגמה 200, 400, 403, 500)
    if (!response.ok) {
        const errorText = await response.text(); 
        console.error('5. שגיאת תגובה לא תקינה מ-Gemini API (טקסט גולמי):', errorText); // לוג 5: מראה את טקסט השגיאה הגולמי
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json(); 

    console.log('6. תגובת JSON מנותחת מ-Gemini API:', JSON.stringify(result, null, 2)); // לוג 6: מראה את כל התגובה המנותחת מה-AI
    console.log('--- סוף לוגים של Gemini API Request ---\n');

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const generatedCode = result.candidates[0].content.parts[0].text;
      
      const jsxCode = generatedCode.replace(/```jsx\n|```/g, '').trim();

      res.json({ jsx: jsxCode });
    } else {
      console.error('מבנה תגובה לא צפוי מ-Gemini API (json.candidates או content חסרים):', JSON.stringify(result, null, 2));
      res.status(500).json({ error: 'נכשל ביצירת JSX. מבנה תגובה לא צפוי מה-AI.' });
    }

  } catch (error) {
    console.error('שגיאה כללית בלכידת הדגם דרך Gemini API:', error);
    console.error(error); 
    res.status(500).json({ error: 'נכשל ביצירת הדגם. אנא נסה שוב מאוחר יותר.' });
  }
});

app.listen(port, () => {
  console.log(`שרת מחולל הדגמים מאזין בכתובת: http://localhost:${port}`);
});
