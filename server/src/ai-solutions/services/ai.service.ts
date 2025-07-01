import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';
// import { Agent } from 'http';
import { Problem } from '../entities/problem.entity';
import { Issue } from '../entities/issue.entity';
import { Equipment } from '../../entities/equipment.entity';

// Model configuration
const MODEL_CONFIG = {
  DIAGNOSIS: 'gpt-4-0125-preview', // For complex diagnosis and analysis
  CHAT: 'gpt-3.5-turbo', // For general chat and simple queries
  FOLLOW_UP: 'gpt-4-0125-preview', // For follow-up questions
  ENHANCEMENT: 'gpt-3.5-turbo', // For description enhancement
} as const;

// Interface for problem analysis results
interface AnalysisResult {
  possibleCauses: string[];
  suggestedSolutions: string[];
  requiresTechnician: boolean;
  severity: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  estimatedTime?: string;
}

// Diagnosis interface that matches the client-side interface
interface Diagnosis {
  possibleCauses: string[];
  suggestedSolutions: string[];
  estimatedCost: string;
  partsNeeded: string[];
  diagnosisConfidence: number;
}

// Follow-up question interface
export interface FollowUpQuestion {
  question: string;
  type: string;
  options?: string[];
  context?: string;
}

// Enhanced diagnosis interface
interface EnhancedDiagnosisDto {
  originalDescription: string;
  enhancedDescription: string;
  followUpQuestions: FollowUpQuestion[];
  structuredData: any;
  equipmentContext: string;
  confidence: string;
}

@Injectable()
export class AIService {
  private openai: OpenAI | null;
  private readonly logger = new Logger(AIService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'sk-placeholder-replace-with-real-key') {
      this.logger.warn('OPENAI_API_KEY is not set or is a placeholder. AI features will be disabled.');
      this.apiKey = '';
      // Create a mock OpenAI instance that won't be used
      this.openai = null as any;
      return;
    }

    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  // Helper method to select model based on task type
  private selectModel(taskType: keyof typeof MODEL_CONFIG): string {
    return MODEL_CONFIG[taskType];
  }

  // Helper method to check if AI is available
  private isAIAvailable(): boolean {
    return this.openai !== null && this.apiKey !== '';
  }

  // Helper method for fallback responses when AI is not available
  private getAIUnavailableResponse(type: 'equipment' | 'categories' | 'analysis' | 'solutions'): any {
    switch (type) {
      case 'equipment':
        return '';
      case 'categories':
        return ['General Equipment Issue'];
      case 'analysis':
        return {
          possibleCauses: ['AI analysis unavailable - contact technician'],
          suggestedSolutions: ['Manual inspection required'],
          requiresTechnician: true,
          severity: 'medium' as const,
        };
      case 'solutions':
        return ['AI solutions unavailable - contact support'];
      default:
        return null;
    }
  }

  /**
   * Parses JSON response from AI
   */
  private parseResponse(response: string): any {
    try {
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('Failed to parse GPT response:', response);
      throw new Error('Invalid response format from AI engine');
    }
  }

  /**
   * Categorizes equipment problems
   */
  async categorizeProblem(
    problemDescription: string,
    equipmentType?: string
  ): Promise<string[]> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('categories');
    }

    try {
      const prompt = equipmentType
        ? `Categorize this problem for a ${equipmentType}:\n"${problemDescription}"`
        : `Categorize this industrial equipment problem:\n"${problemDescription}"`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.selectModel('CHAT'),
          messages: [
            {
              role: 'system',
              content: `You are an industrial equipment support specialist. Analyze problems and return 1-3 categories from this list:
          - Mechanical Failure
          - Electrical Issue
          - Software Bug
          - Calibration Problem
          - Maintenance Required
          - Operational Error
          - Safety Concern
          - Performance Degradation
          - Connectivity Issue
          - Sensor Malfunction
          - Material Jam
          - Wear and Tear
          - Installation Problem
          - Environmental Factors

          Return ONLY category names as a comma-separated list, no explanations.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Parse the categories from the response
      const content = response.data.choices[0].message.content.trim();
      return this.parseCategories(content);
    } catch (error) {
      this.logger.error('GPT API Error:', error.response?.data);
      throw new Error('Failed to categorize problem');
    }
  }

  /**
   * Identifies equipment type from user description
   */
  async identifyEquipmentType(userDescription: string): Promise<string> {
    if (!userDescription || userDescription.trim().length === 0) {
      return '';
    }

    const prompt = `
      Extract the most likely equipment or appliance type from this problem description.
      Focus on identifying standard restaurant/commercial equipment types like:
      - Refrigerator/Freezer
      - Oven
      - Grill
      - Fryer
      - Ice machine
      - Dishwasher
      - Mixer
      - Blender
      - Coffee machine
      - Food processor
      - Microwave
      - HVAC system
      - Water heater

      PROBLEM DESCRIPTION: "${userDescription}"

      Respond ONLY with the most likely equipment type name (a single noun or compound noun).
      If multiple equipment types are mentioned, select the main one.
      If no specific equipment is mentioned, extract the most general category that would fit.
    `;

    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('equipment');
    }

    try {
      const response = await this.openai?.chat.completions.create({
        model: this.selectModel('CHAT'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Lower temperature for more deterministic results
        max_tokens: 50, // We only need a short response
      });

      const equipmentType = response?.choices[0]?.message?.content?.trim() || '';

      // Clean up the response by removing any punctuation or extra text
      return equipmentType
        .replace(/[.,;:"'!?()]/g, '')
        .split(/\s+/)
        .slice(0, 2)
        .join(' ');
    } catch (error) {
      this.logger.error('Error identifying equipment type:', error);
      // Return empty string instead of throwing, so the search can still work with original text
      return '';
    }
  }

  /**
   * Enhances user problem description for better analysis and matching
   */
  async enhanceProblemDescription(
    userDescription: string,
    language = 'en',
    equipment?: Equipment,
    followUpQuestions: Record<string, string>[] = []
  ): Promise<string> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('analysis');
    }

    try {
      const equipmentContext = equipment
        ? await this.getEquipmentContext(equipment, language)
        : '';
      const followUpQuestionsContext =
        followUpQuestions.length > 0
          ? await this.getFollowUpQuestionsContext(followUpQuestions)
          : '';

      /* ---------- strict system prompt ---------- */
      const systemPrompt =
        language === 'he'
          ? `אתה מומחה טכני שמשפר תיאורי תקלות.\n` +
            `כלל ברזל: מותר להשתמש רק במידע שמופיע ב"תיאור המקורי" ` +
            `או ב-equipmentContext או ב-followUpQuestionsContext. אסור להמציא עובדות חדשות.\n` +
            `שלב במידת האפשר פרטים מ-equipmentContext ו-followUpQuestionsContext, ושמור על אורך ≤150 תווים.`
          : `You are a technical expert refining problem descriptions.\n` +
            `Rule: you may use ONLY facts found in the ORIGINAL DESCRIPTION, ` +
            `equipmentContext, or followUpQuestionsContext—nothing else.\n` +
            `Include details from both contexts when available, keep length ≤150 chars.`;

      /* ---------- user prompt ---------- */
      const userPrompt =
        language === 'he'
          ? `שפר את התיאור הבא (עד 150 תווים).\n` +
            `1. אל תוסיף מותג/דגם/מיקום/תסמין שלא קיים במקור, ב-equipmentContext, או ב-followUpQuestionsContext.\n` +
            `2. אם יש equipmentContext או followUpQuestionsContext – שלב אותם בתיאור.\n` +
            `3. השתמש במונחים טכניים מדויקים ותבנה ניסוח ברור ותמציתי.\n\n` +
            `תיאור מקורי:\n"${userDescription}"\n\n` +
            (equipmentContext
              ? `equipmentContext:\n${equipmentContext}\n\n`
              : '') +
            (followUpQuestionsContext
              ? `followUpQuestionsContext:\n${followUpQuestionsContext}\n\n`
              : '') +
            `תיאור משופר:`
          : `Enhance the text below (≤150 chars).\n` +
            `1. Do NOT add brand/model/location/symptom not found in original, equipmentContext, or followUpQuestionsContext.\n` +
            `2. If contexts are provided—incorporate their info.\n` +
            `3. Use precise technical wording; keep it concise & clear.\n\n` +
            `ORIGINAL DESCRIPTION:\n"${userDescription}"\n\n` +
            (equipmentContext
              ? `equipmentContext:\n${equipmentContext}\n\n`
              : '') +
            (followUpQuestionsContext
              ? `followUpQuestionsContext:\n${followUpQuestionsContext}\n\n`
              : '') +
            `ENHANCED DESCRIPTION:`;

      /* ---------- model call ---------- */
      const response = await this.openai?.chat.completions.create({
        model: this.selectModel('ENHANCEMENT'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content?.trim() || userDescription;
    } catch (err) {
      this.logger.error('Error enhancing problem description:', err);
      return userDescription;
    }
  }

  /**
   * Finds similar problems using AI
   */
  async findSimilarProblems(
    description: string,
    problems: Problem[]
  ): Promise<Problem[]> {
    if (!problems || problems.length === 0) {
      return [];
    }

    // Format problems for the prompt
    const problemsText = problems
      .map((p, index) => `${index + 1}. ${p.description}`)
      .join('\n');

    const prompt = `
      I have a list of equipment problems, and I need to find which ones are most similar to a new problem.

      NEW PROBLEM: ${description}

      EXISTING PROBLEMS:
      ${problemsText}

      Return the indices of the most similar problems, ranked by similarity.
      Only return problems that are genuinely similar to the new problem.
      Format your response as a JSON array of numbers, e.g. [3, 1, 5]
    `;

    if (!this.isAIAvailable()) {
      return [];
    }

    try {
      const response = await this.openai?.chat.completions.create({
        model: this.selectModel('CHAT'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      // Parse the response to get the indices
      const similarIndices = JSON.parse(content).similar_problems || [];

      // Convert 1-based indices to 0-based and filter out any out-of-range indices
      return similarIndices.map((index) => problems[index - 1]).filter(Boolean);
    } catch (error) {
      this.logger.error('Error finding similar problems with GPT:', error);
      return [];
    }
  }

  /**
   * Analyzes equipment problems to generate detailed analysis
   */
  async analyzeProblem(
    description: string,
    equipment: Equipment,
    previousIssues: Issue[],
    language = 'en'
  ): Promise<AnalysisResult> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('analysis');
    }

    const systemPrompt =
      language === 'he'
        ? 'אתה מומחה טכני שמנתח בעיות בציוד. תן ניתוח מפורט של הבעיה, כולל סיבות אפשריות, חומרה, והאם נדרש טכנאי.'
        : 'You are a technical expert analyzing equipment problems. Provide a detailed analysis of the problem, including possible causes, severity, and whether a technician is needed.';

    const previousIssuesContext = previousIssues
      .map(
        (issue) =>
          `Previous Issue: ${issue.problem.description}\nSolution: ${
            issue.solution?.treatment || 'No solution recorded'
          }`
      )
      .join('\n\n');

    const prompt =
      language === 'he'
        ? `ציוד: ${equipment.manufacturer} ${equipment.model}
תיאור הבעיה: ${description}

${previousIssuesContext ? `בעיות קודמות:\n${previousIssuesContext}\n\n` : ''}
אנא נתח את הבעיה ותן המלצות.`
        : `Equipment: ${equipment.manufacturer} ${equipment.model}
Problem Description: ${description}

${previousIssuesContext ? `Previous Issues:\n${previousIssuesContext}\n\n` : ''}
Please analyze the problem and provide recommendations.`;

    const completion = await this.openai?.chat.completions.create({
      model: this.selectModel('DIAGNOSIS'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    return this.parseAnalysisResponse(response, language);
  }

  /**
   * Generates diagnosis for equipment problems
   */
  async generateDiagnosis(
    description: string,
    equipment: { type: string; manufacturer: string; model: string },
    language = 'en'
  ): Promise<Diagnosis> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('analysis');
    }

    const systemPrompt =
      language === 'he'
        ? 'אתה מומחה טכני שמאבחן בעיות בציוד. תן ניתוח מפורט של הבעיה, כולל סיבות אפשריות, פתרונות מוצעים, עלות משוערת, חלקים נדרשים, ורמת ביטחון באבחון.'
        : 'You are a technical expert diagnosing equipment problems. Provide a detailed analysis of the problem, including possible causes, suggested solutions, estimated cost, parts needed, and diagnosis confidence level.';

    const prompt =
      language === 'he'
        ? `אני צריך לאבחן בעיה עם הציוד הבא.

פרטי הציוד:
סוג: ${equipment.type}
יצרן: ${equipment.manufacturer}
דגם: ${equipment.model}

תיאור הבעיה:
${description}

אנא נתח את הבעיה ותן:
1. סיבות אפשריות (לפי סדר הסבירות)
2. פתרונות מוצעים לכל סיבה
3. טווח עלות משוער לתיקונים
4. חלקים שעלולים להזדקק להחלפה
5. רמת ביטחון באבחון זה (0-100%)

פורמט התשובה כ-JSON:
{
  "possibleCauses": string[],
  "suggestedSolutions": string[],
  "estimatedCost": string,
  "partsNeeded": string[],
  "diagnosisConfidence": number (0-100)
}`
        : `I need to diagnose a problem with the following equipment.

      EQUIPMENT DETAILS:
      Type: ${equipment.type}
      Manufacturer: ${equipment.manufacturer}
      Model: ${equipment.model}

      PROBLEM DESCRIPTION:
      ${description}

      Please analyze this problem and provide:
      1. Possible causes (in order of likelihood)
      2. Suggested solutions for each cause
      3. Estimated cost range for repairs
      4. Parts that might need replacement
      5. Confidence level in this diagnosis (0-100%)

      Format your response as a JSON object with these keys:
{
  "possibleCauses": string[],
  "suggestedSolutions": string[],
  "estimatedCost": string,
  "partsNeeded": string[],
  "diagnosisConfidence": number (0-100)
}`;

    try {
      const response = await this.openai?.chat.completions.create({
        model: this.selectModel('DIAGNOSIS'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse and return the diagnosis
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Error generating diagnosis with GPT:', error);
      return {
        possibleCauses: [
          language === 'he'
            ? 'לא ניתן לקבוע סיבות עקב שגיאת עיבוד'
            : 'Could not determine causes due to processing error',
        ],
        suggestedSolutions: [
          language === 'he'
            ? 'צור קשר עם טכנאי לאבחון אישי'
            : 'Contact a technician for in-person diagnosis',
        ],
        estimatedCost: language === 'he' ? 'לא ידוע' : 'Unknown',
        partsNeeded: [],
        diagnosisConfidence: 0,
      };
    }
  }

  /**
   * Generates troubleshooting guide for equipment
   */
  async generateTroubleshootingGuide(
    equipment: Equipment,
    problemDescription: string
  ) {
    const prompt = this.buildTroubleshootingPrompt(
      equipment,
      problemDescription
    );

    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('analysis');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.selectModel('CHAT'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.parseResponse(response.data.choices[0].message.content);
    } catch (error) {
      this.logger.error('GPT API Error:', error.response?.data);
      throw new Error('Failed to generate troubleshooting guide');
    }
  }

  /**
   * Generates a solution for a problem
   */
  async generateSolution(
    description: string,
    analysis: any,
    equipment: Equipment,
    language = 'en'
  ): Promise<string[] | string> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('solutions');
    }

    const systemPrompt =
      language === 'he'
        ? 'אתה מומחה טכני שמספק פתרונות מפורטים לבעיות בציוד. תן פתרונות צעד אחר צעד.'
        : 'You are a technical expert providing detailed solutions for equipment problems. Provide step-by-step solutions.';

    const prompt =
      language === 'he'
        ? `ציוד: ${equipment.manufacturer} ${equipment.model}
תיאור הבעיה: ${description}
ניתוח: ${analysis.summary}

אנא ספק פתרונות מפורטים צעד אחר צעד.`
        : `Equipment: ${equipment.manufacturer} ${equipment.model}
Problem Description: ${description}
Analysis: ${analysis.summary}

Please provide detailed step-by-step solutions.`;

    const completion = await this.openai?.chat.completions.create({
      model: this.selectModel('DIAGNOSIS'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    return this.parseSolutionResponse(response);
  }

  /**
   * Finds issues similar to a description using AI
   */
  async findSimilarIssues(
    description: string,
    issueDescriptions: { id: number; description: string }[],
    limit = 5
  ): Promise<number[]> {
    if (!issueDescriptions || issueDescriptions.length === 0) {
      return [];
    }
    // Format issues for the prompt
    const issuesText = issueDescriptions
      .map(
        (issue, index) => `${index + 1}. ID ${issue.id}: ${issue.description} `
      )
      .join('\n');

    const prompt = `
      I have a list of equipment issues, and I need to find which ones are most similar to a new issue.

      NEW ISSUE DESCRIPTION: ${description}

      EXISTING ISSUES:
      ${issuesText}

      Return the IDs of the most similar issues, ranked and order by similarity.
      Only return issues that are genuinely similar to the new issue.
      Format your response as a JSON array of numbers, e.g. [123, 456, 789]
      Just return the IDs, not the index numbers.
    `;

    if (!this.isAIAvailable()) {
      return [];
    }

    try {
      const response = await this.openai?.chat.completions.create({
        model: this.selectModel('CHAT'),
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      // Parse the response to get the IDs
      const result = JSON.parse(content);
      const similarIssueIds = Array.isArray(result.similar_issues)
        ? result.similar_issues
        : Array.isArray(result.similar_issues)
          ? result.similar_issues
          : [];

      // Return the IDs, limited to the requested number
      return similarIssueIds.slice(0, limit);
    } catch (error) {
      this.logger.error('Error finding similar issues with AI:', error);
      return [];
    }
  }

  /**
   * Generates follow-up questions based on the initial problem description
   */
  private cleanAIResponse(response: string): string {
    // Remove markdown code blocks if present
    return response
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
  }

  async generateFollowUpQuestions(
    description: string,
    equipment: Equipment,
    language = 'en'
  ): Promise<FollowUpQuestion[]> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('analysis');
    }

    const systemPrompt = language === 'he'
      ? `אתה מומחה טכני שמטרתו לאסוף מידע מדויק על תסמינים בלבד - ללא אבחון או הסקת מסקנות.

חוקי יסוד חובה:
1. אל תאבחן, אל תסיק מסקנות, אל תציע פתרונות - רק תאסוף עובדות
2. בנה רצף לוגי של שאלות שמובילות זו מזו
3. כל שאלה צריכה להיות ספציפית לסוג המכשיר ${equipment.type}
4. אם תשובה מובילה לכיוון מסוים - המשך לחקור באותו כיוון לעומק
5. שאל שאלות ברורות עם אפשרויות בחירה מוגדרות
6. אל תניח דברים - כל פרט צריך להישאל במפורש

חשוב מאוד: כל שאלה חייבת לכלול אפשרויות בחירה ספציפיות לסוג המכשיר ${equipment.type}.
דוגמאות לאפשרויות ספציפיות:
- מקרר: "מקפיא עליון", "מקפיא תחתון", "מקפיא צדדי", "מקרר ראשי", "דלתות", "מגירות"
- תנור: "אלמנט עליון", "אלמנט תחתון", "גריל", "מאוורר הסעה", "דלת תנור", "חיישן טמפרטורה"
- מכונת כביסה: "תוף", "מגירת אבקה", "מסנן", "צינור ניקוז", "דלת", "משאבת מים"
- מדיח כלים: "סל עליון", "סל תחתון", "זרועות ריסוס", "פילטר", "משאבת ניקוז"

דוגמאות לרצפי שאלות נכונים:
- מקרר: "איזה חלק לא מקרר?" → אם "מקפיא" → "איזה סוג מקפיא יש לך?" → אם "מקפיא תחתון" → "האם החלק התחתון (מקפיא) עדיין קר?"
- תנור: "איזה סוג חימום לא עובד?" → אם "חימום תחתון" → "האם אתה רואה את האלמנט התחתון?" → אם "כן" → "האם הוא נהיה אדום כשהתנור דלוק?"

עקרון חשוב: כל שאלה צריכה להוביל לשאלת המשך אפשרית שמעמיקה את הבנת התסמין.`
      : `You are a technical expert whose sole purpose is to collect accurate symptom information - NO diagnosis or conclusions.

Mandatory core rules:
1. Never diagnose, never conclude, never suggest solutions - only collect facts
2. Build logical question sequences that lead from one to the next
3. Each question must be specific to ${equipment.type} appliances
4. If an answer leads in a direction - continue exploring that direction in depth
5. Ask clear questions with defined multiple-choice options
6. Don't assume anything - every detail must be explicitly asked

CRITICAL: Every question MUST include options specific to ${equipment.type} appliances.
Examples of equipment-specific options:
- Refrigerator: "Top freezer", "Bottom freezer", "Side-by-side freezer", "Main refrigerator", "Doors", "Drawers"
- Oven: "Top heating element", "Bottom heating element", "Broiler", "Convection fan", "Oven door", "Temperature sensor"
- Washing machine: "Drum", "Detergent drawer", "Filter", "Drain hose", "Door", "Water pump"
- Dishwasher: "Top rack", "Bottom rack", "Spray arms", "Filter", "Drain pump"

Examples of correct question sequences:
- Refrigerator: "Which part of the refrigerator isn't cooling properly?" → if "freezer" → "What type of freezer does your refrigerator have?" (top/bottom/side-by-side)
- Oven: "Which type of heating in the oven isn't working?" (top/bottom/broiler/convection)
- Washing machine: "Where exactly do you see the water problem?" (not filling/not draining/leaking)

Important principles:
- Each question leads logically to the next question
- Don't jump to a new topic before finishing exploring the current topic
- Use precise technical terminology for ${equipment.type}
- Provide clear, defined multiple-choice options specific to the equipment type
- Every option list must include real parts/functions of ${equipment.type}
- Always add "Other" or "Not sure" as the last option

Return JSON in this exact structure (no Markdown):
{
  "questions": [
    {
      "question": "Clear and specific question",
      "type": "timing|symptom|context|severity|location|function",
      "options": ["Equipment-specific option 1", "Equipment-specific option 2", "Equipment-specific option 3", "Other"],
      "context": "Explanation of why this question matters",
      "followUpLogic": "Explanation of how this question leads to the next"
    }
  ]
}`;

    const prompt = language === 'he'
      ? `סוג מכשיר: ${equipment.type}
יצרן ודגם: ${equipment.manufacturer} ${equipment.model}
תיאור ראשוני: "${description}"

משימה: בנה רצף של 3-5 שאלות המתחילות מהתיאור הראשוני ומתפתחות לוגית.

כללים לבניית רצף שאלות:
1. שאלה ראשונה: הכי רלוונטית לתיאור הראשוני
2. שאלות המשך: בהתבסס על תשובות אפשריות לשאלה הקודמת
3. כל שאלה צריכה להיות ספציפית למבנה ופונקציות של ${equipment.type}
4. אל תקפוץ בין נושאים - חקור נושא אחד לעומק

דוגמאות מפורטות לרצפי שאלות:

מקרר עם בעיית קירור:
1. "איזה חלק של המקרר לא עובד כמו שצריך?"
2. אם התשובה "מקפיא" → "איזה סוג מקפיא יש במקרר שלך?" (עליון/תחתון/צדדי)
3. אם התשובה "מקפיא תחתון" → "האם החלק התחתון עדיין קר או שהוא התחמם לגמרי?"
4. אם התשובה "התחמם לגמרי" → "האם אתה שומע את המקרר עובד (זמזום/רעש)?"

תנור עם בעיית חימום:
1. "איזה סוג חימום בתנור לא עובד?" (עליון/תחתון/גריל/הסעה)
2. אם התשובה "חימום תחתון" → "האם אתה יכול לראות את האלמנט התחתון בתחתית התנור?"
3. אם התשובה "כן, אני רואה אותו" → "כשאתה מדליק את התנור, האם האלמנט התחתון נהיה אדום?"
4. אם התשובה "לא נהיה אדום" → "האם האלמנט נראה שלם או שיש בו סדקים/שבירות?"

מכונת כביסה עם בעיית מים:
1. "איפה בדיוק אתה רואה את בעיית המים?" (לא נכנסים/לא יוצאים/דולפים)
2. אם התשובה "לא יוצאים" → "האם המים נשארים בתוף בסוף התוכנית?"
3. אם התשובה "כן, נשארים" → "איזה גובה מים נשאר בתוף?" (מעט/חצי/כמעט מלא)
4. אם התשובה "כמעט מלא" → "האם המכונה מנסה לנקז (שומעים רעש שאיבה)?"

עקרונות חשובים:
- כל שאלה מובילה לשאלה הבאה בצורה לוגית
- אל תקפוץ לנושא חדש לפני שסיימת לחקור את הנושא הנוכחי
- השתמש במינוח טכני מדויק ל${equipment.type}
- תן אפשרויות בחירה ברורות ומוגדרות שספציפיות ל${equipment.type}
- כל רשימת אפשרויות חייבת לכלול חלקים/פונקציות אמיתיים של ${equipment.type}
- הוסף תמיד "אחר" או "לא בטוח" כאפשרות אחרונה

החזר JSON במבנה הבא (ללא Markdown):
{
  "questions": [
    {
      "question": "שאלה ברורה וספציפית",
      "type": "timing|symptom|context|severity|location|function",
      "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3", "אחר"],
      "context": "הסבר למה השאלה חשובה",
      "followUpLogic": "הסבר איך השאלה הזו מובילה לשאלה הבאה"
    }
  ]
}`
      : `Appliance Type: ${equipment.type}
Manufacturer and Model: ${equipment.manufacturer} ${equipment.model}
Initial Description: "${description}"

Task: Build a sequence of 3-5 questions that start from the initial description and develop logically.

Rules for building question sequences:
1. First question: Most relevant to the initial description
2. Follow-up questions: Based on possible answers to the previous question
3. Each question must be specific to the structure and functions of ${equipment.type}
4. Don't jump between topics - explore one topic in depth

Detailed examples of question sequences:

Refrigerator with cooling issue:
1. "Which part of the refrigerator isn't cooling properly?"
2. If answer is "freezer" → "What type of freezer does your refrigerator have?" (top/bottom/side-by-side)
3. If answer is "bottom freezer" → "Is the bottom part still cold or has it warmed up completely?"
4. If answer is "warmed up completely" → "Can you hear the refrigerator running (humming/noise)?"

Oven with heating issue:
1. "Which type of heating in the oven isn't working?" (top/bottom/broiler/convection)
2. If answer is "bottom heating" → "Can you see the bottom heating element at the bottom of the oven?"
3. If answer is "yes, I can see it" → "When you turn on the oven, does the bottom element turn red?"
4. If answer is "doesn't turn red" → "Does the element look intact or are there any cracks/breaks?"

Washing machine with water issue:
1. "Where exactly do you see the water problem?" (not filling/not draining/leaking)
2. If answer is "not draining" → "Does water remain in the drum at the end of the cycle?"
3. If answer is "yes, it remains" → "How much water remains in the drum?" (little/half/almost full)
4. If answer is "almost full" → "Does the machine try to drain (do you hear pumping noise)?"

Important principles:
- Each question leads logically to the next question
- Don't jump to a new topic before finishing exploring the current topic
- Use precise technical terminology for ${equipment.type}
- Provide clear, defined multiple-choice options

Return JSON in this exact structure (no Markdown):
{
  "questions": [
    {
      "question": "Clear and specific question",
      "type": "timing|symptom|context|severity|location|function",
      "options": ["Option 1", "Option 2", "Option 3", "Other"],
      "context": "Explanation of why this question matters",
      "followUpLogic": "Explanation of how this question leads to the next"
    }
  ]
}`;

    const completion = await this.openai?.chat.completions.create({
      model: this.selectModel('FOLLOW_UP'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2, // Even lower temperature for more logical, consistent sequences
      max_completion_tokens: 2000, // Increased for more detailed question sequences
    });

    const response = completion.choices[0].message.content;

    try {
      const cleanedResponse = this.cleanAIResponse(response);
      const parsedResponse = JSON.parse(cleanedResponse);

      // Validate and enhance the questions
      return parsedResponse.questions.map((question, index) => {
        // Ensure all questions have meaningful options
        if (!question.options || question.options.length === 0) {
          question.options = this.generateDefaultOptions(question.type, equipment.type, language);
        }

        // Ensure question has a type
        if (!question.type) {
          question.type = this.inferQuestionType(question.question, language);
        }

        // Add sequence information if missing
        if (!question.context) {
          question.context = language === 'he'
            ? `שאלה ${index + 1} מתוך רצף השאלות`
            : `Question ${index + 1} in the sequence`;
        }

        return question;
      });
    } catch (error) {
      console.error('Error parsing follow-up questions:', error);

      // Return a fallback sequence specific to the equipment type
      return this.generateFallbackQuestionSequence(equipment, description, language);
    }
  }

  /**
   * Generates a fallback question sequence when AI parsing fails
   */
  private generateFallbackQuestionSequence(
    equipment: Equipment,
    description: string,
    language = 'en'
  ): FollowUpQuestion[] {
    const type = equipment.type.toLowerCase();

    if (type.includes('refrigerator') || type.includes('fridge')) {
      return language === 'he' ? [
        {
          question: "איזה חלק של המקרר לא עובד כמו שצריך?",
          type: "location",
          options: ["מקפיא", "מקרר", "שני החלקים", "דלתות", "לא בטוח"],
          context: "זיהוי החלק הבעייתי יעזור לנו להבין את הבעיה"
        },
        {
          question: "מתי הבעיה התחילה?",
          type: "timing",
          options: ["היום", "אתמול", "השבוע", "החודש", "לא זוכר"],
          context: "תזמון הבעיה יכול לעזור לזהות את הגורם"
        }
      ] : [
        {
          question: "Which part of the refrigerator isn't working properly?",
          type: "location",
          options: ["Freezer", "Refrigerator", "Both sections", "Doors", "Not sure"],
          context: "Identifying the problematic part helps us understand the issue"
        },
        {
          question: "When did the problem start?",
          type: "timing",
          options: ["Today", "Yesterday", "This week", "This month", "Not sure"],
          context: "Timing of the problem can help identify the cause"
        }
      ];
    }

    // Default fallback for any equipment
    return [{
      question: language === 'he'
        ? `מתי הבעיה ב${equipment.type} התחילה?`
        : `When did the problem with the ${equipment.type} start?`,
      type: 'timing',
      options: language === 'he'
        ? ['היום', 'אתמול', 'השבוע', 'החודש', 'לא זוכר']
        : ['Today', 'Yesterday', 'This week', 'This month', 'Not sure'],
      context: language === 'he'
        ? 'הבנת התזמון עוזרת לזהות גורמים אפשריים'
        : 'Understanding timing helps identify possible causes'
    }];
  }

  /**
   * Generates basic fallback options for question types (AI should generate equipment-specific options)
   */
  private generateDefaultOptions(questionType: string, equipmentType: string, language = 'en'): string[] {
    const options = {
      timing: language === 'he'
        ? ['היום', 'אתמול', 'השבוع', 'החודש', 'לא זוכר']
        : ['Today', 'Yesterday', 'This week', 'This month', 'Not sure'],
      severity: language === 'he'
        ? ['קלה - המכשיר עובד חלקית', 'בינונית - בעיה ניכרת', 'חמורה - המכשיר לא עובד', 'לא בטוח']
        : ['Minor - device partially working', 'Moderate - noticeable issue', 'Severe - device not working', 'Not sure'],
      location: language === 'he'
        ? ['חלק עליון', 'חלק תחתון', 'צד שמאל', 'צד ימין', 'לא בטוח']
        : ['Top part', 'Bottom part', 'Left side', 'Right side', 'Not sure'],
      function: language === 'he'
        ? ['פונקציה בסיסית', 'פונקציות מתקדמות', 'כל הפונקציות', 'לא בטוח']
        : ['Basic function', 'Advanced functions', 'All functions', 'Not sure'],
      context: language === 'he'
        ? ['בשימוש רגיל', 'אחרי ניקוי', 'אחרי הזזה', 'אחרי תיקון', 'אחר']
        : ['During normal use', 'After cleaning', 'After moving', 'After repair', 'Other'],
      symptom: language === 'he'
        ? ['רעש חריג', 'ריח חריג', 'חימום/קירור לא תקין', 'דליפה', 'אחר']
        : ['Unusual noise', 'Strange smell', 'Heating/cooling issue', 'Leaking', 'Other']
    };

    return options[questionType] || (language === 'he' ? ['כן', 'לא', 'לא בטוח'] : ['Yes', 'No', 'Not sure']);
  }





  /**
   * Infers question type from the question text
   */
  private inferQuestionType(question: string, language = 'en'): string {
    const q = question.toLowerCase();

    if (language === 'he') {
      if (q.includes('מתי') || q.includes('זמן')) return 'timing';
      if (q.includes('איפה') || q.includes('איזה חלק')) return 'location';
      if (q.includes('איך') || q.includes('מה קורה')) return 'symptom';
      if (q.includes('כמה') || q.includes('חמור')) return 'severity';
      if (q.includes('פונקציה') || q.includes('עובד')) return 'function';
    } else {
      if (q.includes('when') || q.includes('time')) return 'timing';
      if (q.includes('where') || q.includes('which part')) return 'location';
      if (q.includes('how') || q.includes('what happens')) return 'symptom';
      if (q.includes('how much') || q.includes('severe')) return 'severity';
      if (q.includes('function') || q.includes('working')) return 'function';
    }

    return 'context';
  }

  /**
   * Performs an enhanced diagnosis with structured data and follow-up questions
   */
  async enhancedDiagnosis(
    description: string,
    equipment: Equipment,
    language = 'en'
  ): Promise<EnhancedDiagnosisDto> {
    // Generate follow-up questions
    const followUpQuestions = await this.generateFollowUpQuestions(
      description,
      equipment,
      language
    );

    // Enhance the description
    const enhancedDescription = await this.enhanceProblemDescription(
      description,
      language,
      equipment
    );

    // Extract structured data from the description
    const structuredData = await this.extractStructuredData(
      description,
      enhancedDescription,
      equipment,
      language
    );

    // Get equipment context
    const equipmentContext = await this.getEquipmentContext(
      equipment,
      language
    );

    // Calculate confidence score
    const confidence = await this.calculateDiagnosisConfidence(
      description,
      enhancedDescription,
      structuredData,
      equipment
    );

    return {
      originalDescription: description,
      enhancedDescription,
      followUpQuestions,
      structuredData,
      equipmentContext,
      confidence,
    };
  }

  /**
   * Extracts structured data from the problem description
   */
  private async extractStructuredData(
    originalDescription: string,
    enhancedDescription: string,
    equipment: Equipment,
    language = 'en'
  ): Promise<{
    timing?: string;
    symptoms?: string[];
    severity?: string;
    context?: string;
  }> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('analysis');
    }

    const systemPrompt =
      language === 'he'
        ? 'אתה מומחה טכני שמנתח תיאורי בעיות בציוד. חלץ מידע מובנה מהתיאור.'
        : 'You are a technical expert analyzing equipment problem descriptions. Extract structured data from the description.';

    const prompt =
      language === 'he'
        ? `ציוד: ${equipment.manufacturer} ${equipment.model}
תיאור מקורי: ${originalDescription}
תיאור משופר: ${enhancedDescription}

אנא חלץ את המידע המובנה הבא:
- timing: מתי הבעיה התחילה
- symptoms: רשימת תסמינים
- severity: חומרת הבעיה
- context: הקשר או נסיבות

החזר את התוצאה בפורמט JSON בלבד (ללא markdown).`
        : `Equipment: ${equipment.manufacturer} ${equipment.model}
Original Description: ${originalDescription}
Enhanced Description: ${enhancedDescription}

Please extract the following structured data:
- timing: when the problem started
- symptoms: list of symptoms
- severity: severity of the issue
- context: circumstances or context

Return the result in JSON format only (no markdown).`;

    const completion = await this.openai?.chat.completions.create({
      model: this.selectModel('DIAGNOSIS'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    try {
      const cleanedResponse = this.cleanAIResponse(response);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing structured data:', error);
      return {};
    }
  }

  private async getFollowUpQuestionsContext(
    followUpQuestions: Record<string, string>[]
  ): Promise<string> {
    if (!followUpQuestions || followUpQuestions.length === 0) {
      return '';
    }

    return followUpQuestions
      .map((q) => `- ${q.question}  : ${q.answer}`)
      .join('\n');
  }

  /**
   * Gets relevant context about the equipment
   */
  private async getEquipmentContext(
    equipment: Equipment,
    language = 'en'
  ): Promise<string> {
    if (!this.isAIAvailable()) {
      return this.getAIUnavailableResponse('equipment');
    }

    const systemPrompt =
      language === 'he'
        ? 'אתה מומחה טכני שמספק מידע על ציוד. ספק מידע רלוונטי על הציוד.'
        : 'You are a technical expert providing information about equipment. Provide relevant information about the equipment.';

    const prompt =
      language === 'he'
        ? `ציוד: ${equipment.manufacturer} ${equipment.model}
סוג: ${equipment.type}
קטגוריה: ${equipment.category}

אנא ספק מידע רלוונטי על הציוד, כולל:
- תכונות עיקריות
- בעיות נפוצות
- טיפים לתחזוקה`
        : `Equipment: ${equipment.manufacturer} ${equipment.model}
Type: ${equipment.type}
Category: ${equipment.category}

Please provide relevant information about the equipment, including:
- Key features
- Common issues
- Maintenance tips`;

    const completion = await this.openai?.chat.completions.create({
      model: this.selectModel('CHAT'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  }

  /**
   * Calculates confidence score for the diagnosis
   */
  private async calculateDiagnosisConfidence(
    originalDescription: string,
    enhancedDescription: string,
    structuredData: any,
    equipment: Equipment
  ): Promise<string> {
    // Calculate confidence based on:
    // 1. Description completeness
    // 2. Structured data availability
    // 3. Equipment match
    // 4. Historical data (if available)

    const descriptionScore = this.calculateDescriptionScore(
      originalDescription,
      enhancedDescription
    );
    const structuredDataScore =
      this.calculateStructuredDataScore(structuredData);
    const equipmentScore = this.calculateEquipmentScore(equipment);

    const totalScore =
      (descriptionScore + structuredDataScore + equipmentScore) / 3;
    return `${Math.round(totalScore * 100)}%`;
  }

  private calculateDescriptionScore(
    original: string,
    enhanced: string
  ): number {
    // Compare original and enhanced descriptions
    // Higher score if enhanced description adds significant value
    const originalLength = original.length;
    const enhancedLength = enhanced.length;
    const lengthRatio = enhancedLength / originalLength;

    // Score between 0 and 1
    return Math.min(lengthRatio / 2, 1);
  }

  private calculateStructuredDataScore(data: any): number {
    // Score based on available structured data
    let score = 0;
    if (data.timing) score += 0.25;
    if (data.symptoms?.length > 0) score += 0.25;
    if (data.severity) score += 0.25;
    if (data.context) score += 0.25;
    return score;
  }

  private calculateEquipmentScore(equipment: Equipment): number {
    // Score based on equipment information completeness
    let score = 0;
    if (equipment.manufacturer) score += 0.33;
    if (equipment.model) score += 0.33;
    if (equipment.type) score += 0.34;
    return score;
  }

  // ========= Private Helper Methods =========

  private parseCategories(categoriesText?: string): string[] {
    if (!categoriesText) return ['Uncategorized'];

    // Clean and split the response
    return categoriesText
      .split(',')
      .map((cat) => cat.trim().replace(/\.$/, '')) // Remove trailing periods
      .filter((cat) => cat.length > 0 && cat !== 'Uncategorized');
  }

  // private getEquipmentContext(equipment: Equipment): string {
  //   const contextLines = [
  //     `- Type: ${equipment.type}`,
  //     `- Manufacturer: ${equipment.manufacturer}`,
  //     `- Model: ${equipment.model}`,
  //     equipment.location && `- Location: ${equipment.location}`,
  //     equipment.purchaseDate &&
  //       `- Purchase Date: ${
  //         new Date(equipment.purchaseDate).toISOString().split('T')[0]
  //       }`,
  //     equipment.warrantyExpiration &&
  //       `- Warranty Status: ${
  //         new Date(equipment.warrantyExpiration) >= new Date()
  //           ? 'Active'
  //           : 'Expired'
  //       }`,
  //     equipment.supplier && `- Supplier: ${equipment.supplier}`,
  //   ].filter(Boolean); // Remove empty lines
  //
  //   return `Equipment Details:\n${contextLines.join('\n')}`;
  // }

  private buildTroubleshootingPrompt(
    equipment: Equipment,
    problem: string
  ): string {
    return `Act as a professional ${equipment.type} technician with expertise in ${equipment.manufacturer} equipment.

Problem Description: "${problem}"
Equipment Details:
- Type: ${equipment.type}
- Manufacturer: ${equipment.manufacturer}
- Model: ${equipment.model}
- Installation Date: ${equipment.purchaseDate}

Generate a detailed troubleshooting guide with:
1. Three most probable causes ordered by likelihood
2. Step-by-step verification process for each cause
3. Required tools/materials
4. Safety precautions

Format response as JSON:
{
  "causes": [
    {
      "probability": "high/medium/low",
      "description": "...",
      "verification_steps": ["..."],
      "solution": "...",
      "tools_required": ["..."]
    }
  ],
  "safety": ["..."]
}`;
  }

  private parseAnalysisResponse(
    response: string,
    language = 'en'
  ): AnalysisResult {
    // Parse the AI response into a structured format
    const lines = response.split('\n');
    const summary = lines[0];
    const recommendation = lines.slice(1).join('\n');

    return {
      possibleCauses: this.extractList(summary),
      suggestedSolutions: this.extractList(recommendation),
      requiresTechnician: summary
        .toLowerCase()
        .includes(language === 'he' ? 'טכנאי' : 'technician'),
      severity: this.extractSeverity(summary),
      estimatedCost: this.extractCost(summary),
      estimatedTime: this.extractTime(summary),
    };
  }

  private parseSolutionResponse(response: string): string[] {
    // Split the response into individual solution steps
    return response
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());
  }

  private extractList(text: string): string[] {
    return text
      .split('\n')
      .filter(
        (line) => line.trim().startsWith('-') || line.trim().match(/^\d+\./)
      )
      .map((line) => line.replace(/^[-\d.]\s*/, '').trim());
  }

  private extractSeverity(text: string): 'low' | 'medium' | 'high' {
    const lower = text.toLowerCase();
    if (lower.includes('high severity') || lower.includes('severe'))
      return 'high';
    if (lower.includes('medium severity') || lower.includes('moderate'))
      return 'medium';
    return 'low';
  }

  private extractCost(text: string): number | undefined {
    const match = text.match(/\$(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  private extractTime(text: string): string | undefined {
    const timeMatch = text.match(/(\d+(?:-\d+)?)\s*(minutes?|hours?|days?)/i);
    return timeMatch ? timeMatch[0] : undefined;
  }

  /**
   * Generates a summary of the issue based on collected information
   */
  async generateIssueSummary(
    combinedDescription: string,
    equipment: Equipment,
    language = 'en'
  ): Promise<string> {
    const systemPrompt =
      language === 'he'
        ? 'אתה מומחה טכני שמסייע בסיכום מידע על בעיות בציוד. נתח את המידע שנאסף ותן סיכום מפורט.'
        : 'You are a technical expert helping summarize information about equipment problems. Analyze the collected information and provide a detailed summary.';

    const prompt =
      language === 'he'
        ? `ציוד: ${equipment.manufacturer} ${equipment.model}
סוג: ${equipment.type}
מידע שנאסף מהמשתמש:
${combinedDescription}

אנא נתח את המידע שנאסף ותספק:
1. סיכום של הבעיה העיקרית
2. תסמינים עיקריים
3. מתי הבעיה התחילה
4. מה כבר נוסה
5. חומרת הבעיה (נמוכה, בינונית, גבוהה)

תן תשובה מפורטת אך תמציתית שיכולה לשמש סיכום לפני אבחון.`
        : `Equipment: ${equipment.manufacturer} ${equipment.model}
Type: ${equipment.type}
Information collected from user:
${combinedDescription}

Please analyze the collected information and provide:
1. Summary of the main issue
2. Key symptoms
3. When the problem started
4. What has already been tried
5. Severity of the issue (low, medium, high)

Provide a detailed but concise response that can serve as a summary before diagnosis.`;

    const completion = await this.openai?.chat.completions.create({
      model: this.selectModel('CHAT'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return completion.choices[0].message.content;
  }
}
