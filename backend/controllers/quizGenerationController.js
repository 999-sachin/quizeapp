const pdf = require('pdf-parse');
const path = require('path');

// Quiz generation settings
const SENTENCE_MIN_LENGTH = 20;
const MAX_TEXT_LENGTH = 15000;

// Helper function to clean and prepare text
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[\r\n]+/g, ' ')
        .trim();
}

// Helper function to extract key terms from text
function extractKeyTerms(text) {
    // Split into sentences and remove short ones
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length >= SENTENCE_MIN_LENGTH);

    // Extract important words (longer than 4 characters, not common words)
    const commonWords = new Set(['about', 'above', 'after', 'again', 'also', 'always', 'another', 'because', 'before', 'being', 'between', 'both', 'could', 'doing', 'during', 'every', 'example', 'first', 'found', 'great', 'having', 'however', 'their', 'there', 'these', 'thing', 'those', 'through', 'using', 'where', 'which', 'while', 'would']);
    
    const terms = [];
    sentences.forEach(sentence => {
        const words = sentence
            .split(/\s+/)
            .map(w => w.toLowerCase())
            .filter(w => w.length > 4 && !commonWords.has(w));
        
        terms.push({
            sentence,
            keywords: [...new Set(words)]
        });
    });

    return terms;
}

// Generate a multiple choice question from a sentence
function generateQuestion(term, allTerms) {
    const { sentence, keywords } = term;
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];

    // Different types of questions we can generate
    const questionTypes = [
        {
            template: `What does the text say about "${keyword}"?`,
            correct: sentence,
            incorrects: [
                "This term is not mentioned in the context provided",
                "This concept appears in a different section",
                "This topic is not relevant to the main discussion"
            ]
        },
        {
            template: `Which statement correctly describes "${keyword}"?`,
            correct: sentence,
            incorrects: [
                "Not enough information is provided about this term",
                "This term is used in a different context",
                "This concept is not explained in the text"
            ]
        },
        {
            template: `According to the text, which statement about "${keyword}" is true?`,
            correct: sentence,
            incorrects: [
                "The text does not provide this information",
                "This information appears elsewhere in the document",
                "This detail is not mentioned in the passage"
            ]
        }
    ];

    // Select a random question type
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    // Create the question object
    return {
        text: questionType.template,
        choices: [
            { text: questionType.correct },
            ...questionType.incorrects.map(text => ({ text }))
        ],
        correctIndex: 0 // The correct answer is always the first one
    };
}

// Shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Main quiz generation function
exports.generateQuizFromPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No PDF file was uploaded.' });
        }

        const numQuestions = parseInt(req.body.numQuestions, 10) || 5;

        // Parse PDF
        const data = await pdf(req.file.buffer);
        const cleanedText = cleanText(data.text);
        const truncatedText = cleanedText.substring(0, MAX_TEXT_LENGTH);

        if (!truncatedText) {
            return res.status(400).json({ msg: 'The PDF appears to be empty or unreadable.' });
        }

        // Extract terms and generate questions
        const terms = extractKeyTerms(truncatedText);
        if (terms.length < numQuestions) {
            return res.status(400).json({ 
                msg: 'The PDF content is too short to generate the requested number of questions.' 
            });
        }

        // Generate questions
        const questions = [];
        const usedTerms = new Set();
        
        while (questions.length < numQuestions && terms.length > usedTerms.size) {
            const availableTerms = terms.filter((_, index) => !usedTerms.has(index));
            const term = availableTerms[Math.floor(Math.random() * availableTerms.length)];
            const termIndex = terms.indexOf(term);
            
            if (!usedTerms.has(termIndex)) {
                const question = generateQuestion(term, terms);
                
                // Shuffle the choices while keeping track of the correct answer
                const correctChoice = question.choices[question.correctIndex];
                shuffleArray(question.choices);
                question.correctIndex = question.choices.findIndex(c => c.text === correctChoice.text);
                
                questions.push(question);
                usedTerms.add(termIndex);
            }
        }

        res.json({
            title: `Quiz from ${req.file.originalname}`,
            questions: questions,
            mode: 'local'
        });

    } catch (error) {
        console.error('--- QUIZ GENERATION ERROR ---');
        console.error('Type:', error.constructor.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('--------------------------');

        res.status(500).json({
            msg: 'Failed to generate quiz. Please try again with a different PDF file.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
