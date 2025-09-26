import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/llm', async (req, res) => {
    try {
        const { mode = 'chat', input = '', lang = 'en' } = req.body || {};
        let system = 'You are a helpful assistant.';
        let user = input;

        if (mode === 'summarize') {
            system = 'Summarize the text in 3-5 bullet points';
            user = input;
        } else if (mode === 'translate') {
            system = `Translate into ${lang}. Preserve meaning and tone`;
        } else if (mode === 'classify') {
            system = 'Classify the text into one of: Positive, Neutral, Negative. Reply with one label only.';
        }

        const resp = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: [{ role: 'system', content: system }, { role: 'user', content: user }]
        });

        const text = resp.output_text ?? 'No output';
        res.json({ ok: true, mode, text });
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, error: e.message || 'failed' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`LLM toolbox on http://localhost:${port}`));
