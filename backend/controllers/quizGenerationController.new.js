const pdf = require('pdf-parse');
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
const fs = require('fs');

// Configuration
const credentialsPath = path.join(__dirname, '..', 'service-account-key.json');
let vertexAIClient = null;
let aiModel = null;

// Fallback quiz generation when AI is not available
function generateFallbackQuiz(text, numQuestions) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const questions = [];
    
    for (let i = 0; i < Math.min(numQuestions, sentences.length); i++) {
        const sentence = sentences[i].trim();
        // Create a question by finding key terms in the sentence
        const words = sentence.split(' ').filter(w => w.length > 4);
        const keyWord = words[Math.floor(Math.random() * words.length)];
        
        questions.push({
            text: `Which statement best describes the context of "${keyWord}" in the text?`,
            choices: [
                { text: sentence },
                { text: "This term is not important to the context" },
                { text: "This term appears in a different section" },
                { text: "This term is not related to the main topic" }
            ],
            correctIndex: 0
        });
    }
    
    return questions;
}

// Initialize Vertex AI
async function initializeAI() {
    try {
        if (!fs.existsSync(credentialsPath)) {
            throw new Error('Service account credentials file not found');
        }

        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        if (!credentials.project_id) {
            throw new Error('Invalid credentials: missing project_id');
        }

        vertexAIClient = new VertexAI({
            project: credentials.project_id,
            location: 'us-central1',
        });

        aiModel = vertexAIClient.getGenerativeModel({
            model: 'gemini-1.0-pro',
        });

        console.log('[Vertex AI] Successfully initialized');
        return true;
    } catch (error) {
        console.error('[Vertex AI] Initialization failed:', error.message);
        return false;
    }
}

// Main quiz generation function
exports.generateQuizFromPDF = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No PDF file was uploaded.' });
    }

    const numQuestions = parseInt(req.body.numQuestions, 10) || 5;

    try {
        // Parse PDF
        const data = await pdf(req.file.buffer);
        const cleanedText = data.text.replace(/\s+/g, ' ').trim();
        const truncatedText = cleanedText.substring(0, 15000);

        if (!truncatedText) {
            return res.status(400).json({ msg: 'The PDF appears to be empty or unreadable.' });
        }

        // Try to initialize AI if not already initialized
        if (!aiModel) {
            const initialized = await initializeAI();
            if (!initialized) {
                // If AI initialization fails, use fallback
                console.log('[Quiz Generation] Using fallback quiz generation');
                const fallbackQuestions = generateFallbackQuiz(truncatedText, numQuestions);
                return res.json({
                    title: `Quiz from ${req.file.originalname} (Basic Version)`,
                    questions: fallbackQuestions,
                    mode: 'fallback'
                });
            }
        }

        // Prepare prompt for AI
        const prompt = `
            You are an expert quiz creator. Based on the following document content, generate exactly ${numQuestions} multiple-choice questions. 
            Your response MUST be ONLY a valid JSON array of objects, with no other text or markdown.
            The structure for each object must be:
            {
                "text": "A high-quality question?",
                "choices": [ { "text": "Choice A" }, { "text": "Choice B" }, { "text": "Choice C" }, { "text": "Choice D" } ],
                "correctIndex": <an integer from 0 to 3>
            }
            Document Content: """${truncatedText}"""
        `;

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        // Generate questions using AI
        const resp = await aiModel.generateContent(request);
        
        if (!resp.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid AI response structure');
        }
        
        const responseText = resp.response.candidates[0].content.parts[0].text;
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const generatedQuestions = JSON.parse(cleanedJson);

        res.json({
            title: `AI Quiz from ${req.file.originalname}`,
            questions: generatedQuestions,
            mode: 'ai'
        });

    } catch (error) {
        console.error('--- QUIZ GENERATION ERROR ---');
        console.error('Type:', error.constructor.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('--------------------------');

        // Handle different error types
        let errorMessage = 'Failed to generate quiz.';
        let statusCode = 500;

        if (error.message.includes('billing') || error.message.includes('BILLING_DISABLED')) {
            errorMessage = 'Google Cloud billing is not enabled. Please enable billing to use AI features.';
            // Use fallback
            const fallbackQuestions = generateFallbackQuiz(truncatedText, numQuestions);
            return res.json({
                title: `Quiz from ${req.file.originalname} (Basic Version)`,
                questions: fallbackQuestions,
                mode: 'fallback',
                notice: 'Using basic quiz generation due to AI service unavailability.'
            });
        } else if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied. Please check API access and credentials.';
            statusCode = 403;
        } else if (error.message.includes('credential')) {
            errorMessage = 'Invalid credentials. Please check your service account setup.';
            statusCode = 401;
        }

        res.status(statusCode).json({
            msg: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};