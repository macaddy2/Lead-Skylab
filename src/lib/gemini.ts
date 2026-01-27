// Gemini AI Client for Content Generation
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ContentPlatform, ContentTone, ContentPiece, ProductProfile } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn('Gemini API key not configured - AI features will be disabled');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Platform-specific content guidelines
const platformGuidelines: Record<ContentPlatform, { maxLength: number; style: string }> = {
    twitter: { maxLength: 280, style: 'Concise, punchy, use hashtags sparingly' },
    linkedin: { maxLength: 3000, style: 'Professional, thoughtful, can be longer form' },
    instagram: { maxLength: 2200, style: 'Visual-first, engaging, use emojis and hashtags' },
    tiktok: { maxLength: 150, style: 'Trendy, casual, hook within first 3 words' },
    reddit: { maxLength: 10000, style: 'Authentic, conversational, avoid being salesy' },
    facebook: { maxLength: 63206, style: 'Friendly, community-focused, can include links' },
    email: { maxLength: 50000, style: 'Clear subject line, scannable body, strong CTA' },
};

const toneDescriptions: Record<ContentTone, string> = {
    professional: 'formal, authoritative, industry-focused',
    casual: 'relaxed, conversational, approachable',
    bold: 'confident, direct, attention-grabbing',
    friendly: 'warm, personable, inclusive',
    witty: 'clever, humorous, memorable',
    informative: 'educational, clear, helpful',
};

export interface GenerateContentParams {
    productProfile: ProductProfile;
    platform: ContentPlatform;
    tone: ContentTone;
    topic?: string;
    includeHashtags?: boolean;
}

export interface GenerateLaunchContentParams {
    productProfile: ProductProfile;
    launchDate: string;
    platforms: ContentPlatform[];
    toneByPlatform: Record<ContentPlatform, ContentTone>;
    contentPillars: string[];
    phase: 'pre_launch' | 'launch_day' | 'growth';
    count: number;
}

// Generate a single content piece
export async function generateContent(params: GenerateContentParams): Promise<string> {
    if (!model) {
        throw new Error('Gemini AI is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    const { productProfile, platform, tone, topic, includeHashtags = true } = params;
    const guidelines = platformGuidelines[platform];
    const toneDesc = toneDescriptions[tone];

    const prompt = `You are an expert social media content creator. Generate a single ${platform} post for the following product:

PRODUCT: ${productProfile.name}
DESCRIPTION: ${productProfile.description}
VALUE PROPOSITIONS: ${productProfile.valueProps.join(', ')}
TARGET AUDIENCE: ${productProfile.targetAudience}
KEYWORDS: ${productProfile.keywords.join(', ')}

PLATFORM: ${platform}
MAX LENGTH: ${guidelines.maxLength} characters
STYLE: ${guidelines.style}
TONE: ${toneDesc}
${topic ? `TOPIC/ANGLE: ${topic}` : ''}

REQUIREMENTS:
- Stay within character limit
- Match the tone perfectly
- Include a clear value proposition
${includeHashtags ? '- Include 2-3 relevant hashtags at the end' : '- Do not include hashtags'}
- Make it engaging and actionable
- Do not use quotes around the content

Generate ONLY the post content, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
}

// Generate hashtags for content
export async function generateHashtags(
    content: string,
    productProfile: ProductProfile,
    platform: ContentPlatform,
    count: number = 5
): Promise<string[]> {
    if (!model) {
        throw new Error('Gemini AI is not configured.');
    }

    const prompt = `Generate ${count} relevant hashtags for this ${platform} post about ${productProfile.name}:

CONTENT: ${content}
KEYWORDS: ${productProfile.keywords.join(', ')}

Return ONLY the hashtags, one per line, with the # symbol.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return text
        .split('\n')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#'))
        .slice(0, count);
}

// Rewrite content for a different platform/tone
export async function rewriteContent(
    originalContent: string,
    targetPlatform: ContentPlatform,
    targetTone: ContentTone,
    productProfile: ProductProfile
): Promise<string> {
    if (!model) {
        throw new Error('Gemini AI is not configured.');
    }

    const guidelines = platformGuidelines[targetPlatform];
    const toneDesc = toneDescriptions[targetTone];

    const prompt = `Rewrite this content for ${targetPlatform} with a ${targetTone} tone:

ORIGINAL: ${originalContent}
PRODUCT: ${productProfile.name}

TARGET PLATFORM: ${targetPlatform}
MAX LENGTH: ${guidelines.maxLength} characters
STYLE: ${guidelines.style}
TONE: ${toneDesc}

Generate ONLY the rewritten post, nothing else.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}

// Generate a full content calendar for a launch phase
export async function generateLaunchContent(
    params: GenerateLaunchContentParams
): Promise<Array<Partial<ContentPiece>>> {
    if (!model) {
        throw new Error('Gemini AI is not configured.');
    }

    const { productProfile, launchDate, platforms, toneByPlatform, contentPillars, phase, count } = params;

    const phaseGuidance = {
        pre_launch: 'Build anticipation, tease features, create FOMO, collect waitlist signups',
        launch_day: 'Announce the launch, celebrate, highlight main benefits, strong CTAs',
        growth: 'Share user testimonials, tips, use cases, community building',
    };

    const prompt = `Generate ${count} social media posts for a product launch campaign.

PRODUCT: ${productProfile.name}
DESCRIPTION: ${productProfile.description}
VALUE PROPS: ${productProfile.valueProps.join(', ')}
TARGET AUDIENCE: ${productProfile.targetAudience}
LAUNCH DATE: ${launchDate}
PHASE: ${phase}
PHASE FOCUS: ${phaseGuidance[phase]}
CONTENT PILLARS: ${contentPillars.join(', ')}

PLATFORMS TO USE: ${platforms.join(', ')}
TONES: ${platforms.map(p => `${p}: ${toneByPlatform[p]}`).join(', ')}

Generate ${count} posts as a JSON array with this structure:
[
  {
    "title": "Brief title for internal reference",
    "content": "The actual post content",
    "platform": "twitter|linkedin|etc",
    "hashtags": ["tag1", "tag2"]
  }
]

Distribute posts evenly across platforms. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error('Failed to parse AI response as JSON');
    }

    const posts = JSON.parse(jsonMatch[0]);
    
    return posts.map((post: { title: string; content: string; platform: ContentPlatform; hashtags: string[] }) => ({
        title: post.title,
        content: post.content,
        platform: post.platform as ContentPlatform,
        hashtags: post.hashtags || [],
        status: 'draft' as const,
        tone: toneByPlatform[post.platform as ContentPlatform] || 'professional',
    }));
}

// Analyze a product URL and suggest launch strategy
export async function analyzeProductForLaunch(
    productUrl: string,
    productName: string,
    productDescription: string
): Promise<{
    suggestedPillars: string[];
    suggestedKeywords: string[];
    suggestedPlatforms: ContentPlatform[];
    launchStrategy: string;
}> {
    if (!model) {
        throw new Error('Gemini AI is not configured.');
    }

    const prompt = `Analyze this product and suggest a launch strategy:

PRODUCT NAME: ${productName}
PRODUCT URL: ${productUrl}
DESCRIPTION: ${productDescription}

Provide a JSON response with:
{
  "suggestedPillars": ["3-5 content themes/pillars to focus on"],
  "suggestedKeywords": ["10 relevant keywords for the product"],
  "suggestedPlatforms": ["top 3-4 platforms from: twitter, linkedin, instagram, tiktok, reddit, facebook, email"],
  "launchStrategy": "A brief 2-3 sentence launch strategy recommendation"
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
}

export const isAIConfigured = (): boolean => !!model;
