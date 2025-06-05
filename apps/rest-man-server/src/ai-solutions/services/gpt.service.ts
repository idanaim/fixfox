// src/modules/ai/gpt.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Equipment } from '../../entities/equipment.entity';
import OpenAI from 'openai';
import { Problem } from '../entities/problem.entity';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private readonly apiKey: string;
  private readonly model = 'gpt-4'; // or 'gpt-3.5-turbo'
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.apiKey = ''//this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });
  }

  async identifyEquipmentType(userDescription: string): Promise<string> {
    const prompt = `Identify equipment type from description: "${userDescription}". Respond ONLY with the equipment type name.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
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
    return response.data.choices[0].message.content.trim();
  }

  async generateTroubleshootingGuide(
    equipment: Equipment,
    problemDescription: string
  ) {
    const prompt = this.buildTroubleshootingPrompt(equipment, problemDescription);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
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

  private parseResponse(response: string): any {
    try {
      const cleaned = response.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('Failed to parse GPT response:', response);
      throw new Error('Invalid response format from AI engine');
    }
  }

  private getEquipmentContext(equipment: Equipment): string {
    const contextLines = [
      `- Type: ${equipment.type}`,
      `- Manufacturer: ${equipment.manufacturer}`,
      `- Model: ${equipment.model}`,
      equipment.location && `- Location: ${equipment.location}`,
      equipment.purchaseDate && `- Purchase Date: ${equipment.purchaseDate.toISOString().split('T')[0]}`,
      equipment.warrantyExpiration && `- Warranty Status: ${equipment.warrantyExpiration >= new Date() ? 'Active' : 'Expired'}`,
      equipment.supplier && `- Supplier: ${equipment.supplier}`,
    ].filter(Boolean); // Remove empty lines

    return `Equipment Details:\n${contextLines.join('\n')}`;
  }

  async enhanceProblemDescription(
    userDescription: string,
    equipment: Equipment,
  ): Promise<string> {
    try {
      const equipmentContext = this.getEquipmentContext(equipment);

      const prompt = `
      Create a professional problem report for technical support using:
      1. The user's original description.
      2. Equipment specifications below.

      Guidelines:
      - Start with a concise summary (1 sentence).
      - Include "Affected Equipment" section with key details.
      - Add "Steps to Reproduce" if applicable.
      - Highlight warranty status if relevant.
      - End with "Suggested Actions".

      Original Description:
      "${userDescription}"

      ${equipmentContext}

      Formatted Problem Report:
    `;

      const response =await axios.post(
        'https://api.openai.com/v1/chat/completions',
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

      return response.data.choices[0]?.message?.content || userDescription;
    } catch (error) {
      console.error('GPT enhancement failed:', error);
      throw new Error('Failed to generate problem report');
    }
  }

  async categorizeProblem(
    problemDescription: string,
    equipmentType?: string
  ): Promise<string[]> {
    try {
      const prompt = equipmentType
        ? `Categorize this problem for a ${equipmentType}:\n"${problemDescription}"`
        : `Categorize this industrial equipment problem:\n"${problemDescription}"`;

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
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

        return this.parseResponse(response.data.choices[0].message.content);
      } catch (error) {
        this.logger.error('GPT API Error:', error.response?.data);
        throw new Error('Failed to generate troubleshooting guide');
      }
    }

  private parseCategories(categoriesText?: string): string[] {
    if (!categoriesText) return ['Uncategorized'];

    // Clean and split the response
    return categoriesText
      .split(',')
      .map(cat => cat.trim().replace(/\.$/, '')) // Remove trailing periods
      .filter(cat => cat.length > 0 && cat !== 'Uncategorized');
  }

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
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      // Parse the response to get the indices
      const similarIndices = JSON.parse(content).indices || [];

      // Convert 1-based indices to 0-based and filter out any out-of-range indices
      return similarIndices
        .map(index => problems[index - 1])
        .filter(Boolean);
    } catch (error) {
      console.error('Error finding similar problems with GPT:', error);
      return [];
    }
  }

  async generateDiagnosis(
    description: string,
    equipment: { type: string; manufacturer: string; model: string }
  ): Promise<{
    possibleCauses: string[];
    suggestedSolutions: string[];
    estimatedCost: string;
    partsNeeded: string[];
    diagnosisConfidence: number;
  }> {
    const prompt = `
      I need to diagnose a problem with restaurant equipment.

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
        model: 'gpt-4-turbo-preview',
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
      console.error('Error generating diagnosis with GPT:', error);
      return {
        possibleCauses: ['Could not determine causes due to processing error'],
        suggestedSolutions: ['Contact a technician for in-person diagnosis'],
        estimatedCost: 'Unknown',
        partsNeeded: [],
        diagnosisConfidence: 0
      };
    }
  }
}
