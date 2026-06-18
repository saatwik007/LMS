const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    baseURL: process.env.AI_ENDPOINT_URL,
    apiKey: process.env.AI_API_KEY,
});

exports.generateNextLevel = async(req, res) => {
    try{
        const {userId, currentLevel} = req.body;

        const systemPrompt = `
      You are an expert curriculum designer for a gamified coding LMS. 
      The user is passing level ${currentLevel}. 
      Generate next 5 levels containing 4 parts (3 learning, 1 test). 
      Assign XP to each part (e.g., 20 XP for learning, 40 XP for the test).
      Focus on improving at everylevel.
      
      OUTPUT ONLY VALID JSON matching this exact schema:
      {
        "level_title": "String",
        "parts": [
          {"type": "learning", "content": "String", "xp": Number},
          {"type": "learning", "content": "String", "xp": Number},
          {"type": "learning", "content": "String", "xp": Number},
          {"type": "test", "question": "String", "answer": "String", "xp": Number}
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL_NAME,
        messages: [
            {role: "system", content: systemPrompt},
            { role: "user", content: "Generate next 5 levels." }
        ],

        response_format: {type: "json_object"},
    });
    const generatedLevels = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({ success: true, data: generatedLevels });

} catch(error) {
    console.error("AI generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate level" });
}
};