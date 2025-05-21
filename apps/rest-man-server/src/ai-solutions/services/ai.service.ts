import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';
import { Equipment } from '../entities/equipment.entity';
import { Problem } from '../entities/problem.entity';
import { Issue } from '../entities/issue.entity';

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

@Injectable()
export class AIService {
  private openai: OpenAI;
  private readonly logger = new Logger(AIService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly model = 'gpt-4-turbo-preview'; // Default model

  constructor(private configService: ConfigService) {
    // Use environment variable in production
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    // Initialize OpenAI client
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
    equipment?: Equipment
  ): Promise<string> {
    try {
      const equipmentContext = equipment ? this.getEquipmentContext(equipment) : '';

      /* ---------- strict system prompt ---------- */
      const systemPrompt =
        language === 'he'
          ? `אתה מומחה טכני שמשפר תיאורי תקלות.\n` +
          `כלל ברזל: מותר להשתמש רק במידע שמופיע ב"תיאור המקורי" ` +
          `או ב-equipmentContext. אסור להמציא עובדות חדשות.\n` +
          `שלב במידת האפשר פרטים מ-equipmentContext, ושמור על אורך ≤150 תווים.`
          : `You are a technical expert refining problem descriptions.\n` +
          `Rule: you may use ONLY facts found in the ORIGINAL DESCRIPTION ` +
          `or in equipmentContext—nothing else.\n` +
          `Include equipmentContext details when present, keep length ≤150 chars.`;

      /* ---------- user prompt ---------- */
      const userPrompt =
        language === 'he'
          ? `שפר את התיאור הבא (עד 150 תווים).\n` +
          `1. אל תוסיף מותג/דגם/מיקום/תסמין שלא קיים במקור או ב-equipmentContext.\n` +
          `2. אם יש equipmentContext – שלב אותו בתיאור.\n` +
          `3. השתמש במונחים טכניים מדויקים ותבנה ניסוח ברור ותמציתי.\n\n` +
          `תיאור מקורי:\n"${userDescription}"\n\n` +
          (equipmentContext ? `equipmentContext:\n${equipmentContext}\n\n` : '') +
          `תיאור משופר:`
          : `Enhance the text below (≤150 chars).\n` +
          `1. Do NOT add brand/model/location/symptom not found in original or equipmentContext.\n` +
          `2. If equipmentContext is provided—incorporate its info.\n` +
          `3. Use precise technical wording; keep it concise & clear.\n\n` +
          `ORIGINAL DESCRIPTION:\n"${userDescription}"\n\n` +
          (equipmentContext ? `equipmentContext:\n${equipmentContext}\n\n` : '') +
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

  // ========= Private Helper Methods =========

  private parseCategories(categoriesText?: string): string[] {
    if (!categoriesText) return ['Uncategorized'];

    // Clean and split the response
    return categoriesText
      .split(',')
      .map((cat) => cat.trim().replace(/\.$/, '')) // Remove trailing periods
      .filter((cat) => cat.length > 0 && cat !== 'Uncategorized');
  }

  private getEquipmentContext(equipment: Equipment): string {
    const contextLines = [
      `- Type: ${equipment.type}`,
      `- Manufacturer: ${equipment.manufacturer}`,
      `- Model: ${equipment.model}`,
      equipment.location && `- Location: ${equipment.location}`,
      equipment.purchaseDate &&
        `- Purchase Date: ${
          new Date(equipment.purchaseDate).toISOString().split('T')[0]
        }`,
      equipment.warrantyExpiration &&
        `- Warranty Status: ${
          new Date(equipment.warrantyExpiration) >= new Date()
            ? 'Active'
            : 'Expired'
        }`,
      equipment.supplier && `- Supplier: ${equipment.supplier}`,
    ].filter(Boolean); // Remove empty lines

    return `Equipment Details:\n${contextLines.join('\n')}`;
  }

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
}
