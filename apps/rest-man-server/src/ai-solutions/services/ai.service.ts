import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';
import { Equipment } from '../entities/equipment.entity';
import { Problem } from '../entities/problem.entity';

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
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY')
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: this.apiKey
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

          Return ONLY category names as a comma-separated list, no explanations.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
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
        max_tokens: 50,   // We only need a short response
      });

      const equipmentType = response.choices[0]?.message?.content?.trim() || '';

      // Clean up the response by removing any punctuation or extra text
      return equipmentType.replace(/[.,;:"'!?()]/g, '').split(/\s+/).slice(0, 2).join(' ');
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
    equipment?: Equipment,
  ): Promise<string> {
    try {
      let equipmentContext = '';
      if (equipment) {
        equipmentContext = this.getEquipmentContext(equipment);
      }

      const prompt = `
        I need you to enhance and enrich the following problem description.
        Make it more technically precise and comprehensive while keeping the original meaning and not more than 150 chars.

        ORIGINAL DESCRIPTION:
        "${userDescription}"

        ${equipmentContext}

        Enhancement Guidelines:
        1. Identify the specific symptoms and their frequency/severity
        2. Include any observable patterns (when does it happen, what makes it better/worse)
        3. Add relevant technical terminology appropriate for this equipment
        4. Structure it clearly with proper formatting
        5. Keep it concise but comprehensive
        6. Maintain all facts from the original description
        7. Do NOT invent new symptoms that weren't mentioned

        ENHANCED DESCRIPTION:
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 350,
      });

      return response.choices[0]?.message?.content?.trim() || userDescription;
    } catch (error) {
      this.logger.error('Error enhancing problem description:', error);
      return userDescription; // Return original if enhancement fails
    }
  }

  /**
   * Finds similar problems using AI
   */
  async findSimilarProblems(description: string, problems: Problem[]): Promise<Problem[]> {
    if (!problems || problems.length === 0) {
      return [];
    }

    // Format problems for the prompt
    const problemsText = problems.map(
      (p, index) => `${index + 1}. ${p.description}`
    ).join('\n');

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
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      // Parse the response to get the indices
      const similarIndices = JSON.parse(content).similar_problems || [];

      // Convert 1-based indices to 0-based and filter out any out-of-range indices
      return similarIndices
        .map(index => problems[index - 1])
        .filter(Boolean);
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
    equipmentDetails: any,
    previousIssues?: any[]
  ): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(description, equipmentDetails, previousIssues);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert equipment maintenance AI assistant. Analyze the problem and provide detailed solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return this.parseAnalysisResponse(response.choices[0].message.content);
    } catch (error) {
      this.logger.error('Error analyzing problem:', error);
      throw new Error('Failed to analyze problem');
    }
  }

  /**
   * Generates diagnosis for equipment problems
   */
  async generateDiagnosis(
    description: string,
    equipment: { type: string; manufacturer: string; model: string }
  ): Promise<Diagnosis> {
    const prompt = `
      I need to diagnose a problem with the following equipment.

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
      possibleCauses: string[]
      suggestedSolutions: string[]
      estimatedCost: string
      partsNeeded: string[]
      diagnosisConfidence: number (0-100)
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
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
        possibleCauses: ['Could not determine causes due to processing error'],
        suggestedSolutions: ['Contact a technician for in-person diagnosis'],
        estimatedCost: 'Unknown',
        partsNeeded: [],
        diagnosisConfidence: 0
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
    const prompt = this.buildTroubleshootingPrompt(equipment, problemDescription);

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
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
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
    problem: string,
    analysis?: AnalysisResult,
    equipmentDetails?: any
  ): Promise<string[] | string> {
    if (analysis && equipmentDetails) {
      // If we have analysis and equipment details, generate detailed solution
      const prompt = this.buildSolutionPrompt(problem, analysis, equipmentDetails);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert equipment maintenance AI assistant. Provide step-by-step solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return this.parseSolutionResponse(response.choices[0].message.content);
    } else {
      // Simple solution generation with just the problem description
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'gpt-3.5-turbo', // Use a faster model for simple solutions
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that provides solutions to problems.',
              },
              {
                role: 'user',
                content: problem,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );

        return response.data.choices[0].message.content.trim();
      } catch (error) {
        this.logger.error('OpenAI API Error:', error.response?.data || error.message);
        throw new HttpException(
          'Failed to generate solution using OpenAI',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Finds issues similar to a description using AI
   */
  async findSimilarIssues(
    description: string,
    issueDescriptions: { id: number, description: string, symptoms: string }[],
    limit = 5
  ): Promise<number[]> {
    if (!issueDescriptions || issueDescriptions.length === 0) {
      return [];
    }
    // Format issues for the prompt
    const issuesText = issueDescriptions.map(
      (issue, index) => `${index + 1}. ID ${issue.id}: ${issue.description} ${issue.symptoms}`
    ).join('\n');

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
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      // Parse the response to get the IDs
      const result = JSON.parse(content);
      const similarIssueIds = Array.isArray(result.similar_issues) ? result.similar_issues :
                            (Array.isArray(result.similar_issues) ? result.similar_issues : []);

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
      .map(cat => cat.trim().replace(/\.$/, '')) // Remove trailing periods
      .filter(cat => cat.length > 0 && cat !== 'Uncategorized');
  }

  private getEquipmentContext(equipment: Equipment): string {
    const contextLines = [
      `- Type: ${equipment.type}`,
      `- Manufacturer: ${equipment.manufacturer}`,
      `- Model: ${equipment.model}`,
      equipment.location && `- Location: ${equipment.location}`,
      equipment.purchaseDate && `- Purchase Date: ${new Date(equipment.purchaseDate).toISOString().split('T')[0]}`,
      equipment.warrantyExpiration && `- Warranty Status: ${new Date(equipment.warrantyExpiration) >= new Date() ? 'Active' : 'Expired'}`,
      equipment.supplier && `- Supplier: ${equipment.supplier}`,
    ].filter(Boolean); // Remove empty lines

    return `Equipment Details:\n${contextLines.join('\n')}`;
  }

  private buildTroubleshootingPrompt(equipment: Equipment, problem: string): string {
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

  private buildAnalysisPrompt(
    description: string,
    equipmentDetails: any,
    previousIssues?: any[]
  ): string {
    let prompt = `Analyze the following equipment problem:\n\n`;
    prompt += `Equipment Details:\n`;
    prompt += `- Type: ${equipmentDetails.type}\n`;
    prompt += `- Manufacturer: ${equipmentDetails.manufacturer}\n`;
    prompt += `- Model: ${equipmentDetails.model}\n\n`;
    prompt += `Problem Description:\n${description}\n\n`;

    if (previousIssues?.length) {
      prompt += `Previous Issues:\n`;
      previousIssues.forEach((issue, index) => {
        prompt += `${index + 1}. ${issue.symptoms} - ${issue.solution}\n`;
      });
    }

    prompt += `\nPlease provide:\n`;
    prompt += `1. Possible causes\n`;
    prompt += `2. Suggested solutions\n`;
    prompt += `3. Whether a technician is required\n`;
    prompt += `4. Problem severity (low/medium/high)\n`;
    prompt += `5. Estimated repair cost (if possible)\n`;
    prompt += `6. Estimated repair time\n`;

    return prompt;
  }

  private buildSolutionPrompt(
    problem: string,
    analysis: AnalysisResult,
    equipmentDetails: any
  ): string {
    let prompt = `Generate detailed step-by-step solutions for the following problem:\n\n`;
    prompt += `Equipment: ${equipmentDetails.manufacturer} ${equipmentDetails.model}\n`;
    prompt += `Problem: ${problem}\n\n`;
    prompt += `Analysis:\n`;
    prompt += `- Causes: ${analysis.possibleCauses.join(', ')}\n`;
    prompt += `- Severity: ${analysis.severity}\n`;
    prompt += `- Requires Technician: ${analysis.requiresTechnician}\n\n`;
    prompt += `Please provide detailed steps to resolve the issue, including:\n`;
    prompt += `1. Safety precautions\n`;
    prompt += `2. Required tools\n`;
    prompt += `3. Step-by-step instructions\n`;
    prompt += `4. Testing procedures\n`;
    prompt += `5. Prevention tips\n`;

    return prompt;
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    // This is a simple parser. In production, you'd want more robust parsing
    const sections = response.split('\n\n');

    return {
      possibleCauses: this.extractList(sections.find(s => s.includes('Possible causes')) || ''),
      suggestedSolutions: this.extractList(sections.find(s => s.includes('Suggested solutions')) || ''),
      requiresTechnician: response.toLowerCase().includes('technician required') ||
                         response.toLowerCase().includes('needs technician'),
      severity: this.extractSeverity(response),
      estimatedCost: this.extractCost(response),
      estimatedTime: this.extractTime(response)
    };
  }

  private parseSolutionResponse(response: string): string[] {
    return response.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  }

  private extractList(text: string): string[] {
    return text.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
      .map(line => line.replace(/^[-\d.]\s*/, '').trim());
  }

  private extractSeverity(text: string): 'low' | 'medium' | 'high' {
    const lower = text.toLowerCase();
    if (lower.includes('high severity') || lower.includes('severe')) return 'high';
    if (lower.includes('medium severity') || lower.includes('moderate')) return 'medium';
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
