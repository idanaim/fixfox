import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';
import { Problem } from '../entities/problem.entity';
import { Issue } from '../entities/issue.entity';
import { Equipment } from '../../entities/equipment.entity';

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
interface FollowUpQuestion {
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
  private openai: OpenAI;
  private readonly logger = new Logger(AIService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly model = 'gpt-4-turbo-preview'; // Default model

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
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
    try {
      const prompt = equipmentType
        ? `Categorize this problem for a ${equipmentType}:\n"${problemDescription}"`
        : `Categorize this industrial equipment problem:\n"${problemDescription}"`;

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
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

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Lower temperature for more deterministic results
        max_tokens: 50, // We only need a short response
      });

      const equipmentType = response.choices[0]?.message?.content?.trim() || '';

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
    try {
      const equipmentContext = equipment ? await this.getEquipmentContext(equipment, language) : '';
      const followUpQuestionsContext = followUpQuestions.length > 0 ?
        await this.getFollowUpQuestionsContext(followUpQuestions) : '';

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
          (equipmentContext ? `equipmentContext:\n${equipmentContext}\n\n` : '') +
          (followUpQuestionsContext ? `followUpQuestionsContext:\n${followUpQuestionsContext}\n\n` : '') +
          `תיאור משופר:`
          : `Enhance the text below (≤150 chars).\n` +
          `1. Do NOT add brand/model/location/symptom not found in original, equipmentContext, or followUpQuestionsContext.\n` +
          `2. If contexts are provided—incorporate their info.\n` +
          `3. Use precise technical wording; keep it concise & clear.\n\n` +
          `ORIGINAL DESCRIPTION:\n"${userDescription}"\n\n` +
          (equipmentContext ? `equipmentContext:\n${equipmentContext}\n\n` : '') +
          (followUpQuestionsContext ? `followUpQuestionsContext:\n${followUpQuestionsContext}\n\n` : '') +
          `ENHANCED DESCRIPTION:`;

      /* ---------- model call ---------- */
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt  },
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

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
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

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
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
      const response = await this.openai.chat.completions.create({
        model: this.model,
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

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
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

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
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

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
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
  async generateFollowUpQuestions(
    description: string,
    equipment: Equipment,
    language = 'en'
  ): Promise<FollowUpQuestion[]> {
    const systemPrompt = language === 'he'
      ? 'אתה מומחה טכני שמסייע לאבחן בעיות בציוד. שאל שאלות ממוקדות כדי להבין טוב יותר את הבעיה. עדיף שאלות עם אפשרויות בחירה.'
      : 'You are a technical expert helping diagnose equipment problems. Ask focused questions to better understand the issue. Prefer multiple-choice questions when possible.';

    const prompt = language === 'he'
      ? `ציוד: ${equipment.manufacturer} ${equipment.model}
תיאור הבעיה: ${description}

אנא צור רשימה של שאלות מעקב שיעזרו להבין טוב יותר את הבעיה. כל שאלה צריכה להיות מסוג אחד מהבאים:
- timing: מתי הבעיה התחילה
- symptom: תסמינים נוספים
- context: הקשר או נסיבות
- severity: חומרת הבעיה

הקפד שמרבית השאלות יהיו שאלות ברירה (עם אפשרויות), לא שאלות פתוחות.
לדוגמה, במקום "מתי התחילה הבעיה?" תן אפשרויות כמו "היום", "בשבוע האחרון", "לפני מספר שבועות", "לפני מספר חודשים".

החזר את התוצאה בפורמט JSON עם המבנה הבא:
{
  "questions": [
    {
      "question": "שאלה",
      "type": "timing|symptom|context|severity",
      "options": ["אפשרות 1", "אפשרות 2"] // חובה עבור רוב השאלות
    }
  ]
}`
      : `Equipment: ${equipment.manufacturer} ${equipment.model}
Problem Description: ${description}

Please create a list of follow-up questions that will help better understand the issue. Each question should be of one of the following types:
- timing: when the problem started
- symptom: additional symptoms
- context: circumstances or context
- severity: severity of the issue

Make sure that most questions are multiple-choice (with options), not open-ended questions.
For example, instead of "When did the problem start?" provide options like "Today", "Within the past week", "Several weeks ago", "Several months ago".

Return the result in JSON format with the following structure:
{
  "questions": [
    {
      "question": "Question",
      "type": "timing|symptom|context|severity",
      "options": ["Option 1", "Option 2"] // Required for most questions
    }
  ]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    try {
      const parsedResponse = JSON.parse(response);

      // Ensure all questions have options when possible
      return parsedResponse.questions.map(question => {
        // If no options are provided, add some generic ones based on the question type
        if (!question.options || question.options.length === 0) {
          if (question.type === 'timing') {
            question.options = [
              language === 'he' ? 'היום' : 'Today',
              language === 'he' ? 'בשבוע האחרון' : 'Within the past week',
              language === 'he' ? 'לפני מספר שבועות' : 'Several weeks ago',
              language === 'he' ? 'לפני מספר חודשים' : 'Several months ago'
            ];
          } else if (question.type === 'severity') {
            question.options = [
              language === 'he' ? 'קלה' : 'Minor',
              language === 'he' ? 'בינונית' : 'Moderate',
              language === 'he' ? 'חמורה' : 'Severe'
            ];
          }
        }

        return question;
      });
    } catch (error) {
      console.error('Error parsing follow-up questions:', error);
      return [];
    }
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
      confidence
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
    const systemPrompt = language === 'he'
      ? 'אתה מומחה טכני שמנתח תיאורי בעיות בציוד. חלץ מידע מובנה מהתיאור.'
      : 'You are a technical expert analyzing equipment problem descriptions. Extract structured data from the description.';

    const prompt = language === 'he'
      ? `ציוד: ${equipment.manufacturer} ${equipment.model}
תיאור מקורי: ${originalDescription}
תיאור משופר: ${enhancedDescription}

אנא חלץ את המידע המובנה הבא:
- timing: מתי הבעיה התחילה
- symptoms: רשימת תסמינים
- severity: חומרת הבעיה
- context: הקשר או נסיבות

החזר את התוצאה בפורמט JSON.`
      : `Equipment: ${equipment.manufacturer} ${equipment.model}
Original Description: ${originalDescription}
Enhanced Description: ${enhancedDescription}

Please extract the following structured data:
- timing: when the problem started
- symptoms: list of symptoms
- severity: severity of the issue
- context: circumstances or context

Return the result in JSON format.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
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
    const systemPrompt = language === 'he'
      ? 'אתה מומחה טכני שמספק מידע על ציוד. ספק מידע רלוונטי על הציוד.'
      : 'You are a technical expert providing information about equipment. Provide relevant information about the equipment.';

    const prompt = language === 'he'
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

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
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

    const descriptionScore = this.calculateDescriptionScore(originalDescription, enhancedDescription);
    const structuredDataScore = this.calculateStructuredDataScore(structuredData);
    const equipmentScore = this.calculateEquipmentScore(equipment);

    const totalScore = (descriptionScore + structuredDataScore + equipmentScore) / 3;
    return `${Math.round(totalScore * 100)}%`;
  }

  private calculateDescriptionScore(original: string, enhanced: string): number {
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
    const systemPrompt = language === 'he'
      ? 'אתה מומחה טכני שמסייע בסיכום מידע על בעיות בציוד. נתח את המידע שנאסף ותן סיכום מפורט.'
      : 'You are a technical expert helping summarize information about equipment problems. Analyze the collected information and provide a detailed summary.';

    const prompt = language === 'he'
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

תן תשובה מפורטת אך תמציתית שיכולה לשמש כסיכום לפני אבחון.`
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

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return completion.choices[0].message.content;
  }
}
