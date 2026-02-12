import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { useToast } from '../../components/ui/Toast';
import { generateContent, generateHashtags, isAIConfigured } from '../../lib/gemini';
import type { ContentPiece, ContentPlatform, ContentTone } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    sparkle: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    ),
    copy: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    ),
    save: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
};

const platforms: { value: ContentPlatform; label: string; charLimit?: number }[] = [
    { value: 'twitter', label: 'Twitter/X', charLimit: 280 },
    { value: 'linkedin', label: 'LinkedIn', charLimit: 3000 },
    { value: 'instagram', label: 'Instagram', charLimit: 2200 },
    { value: 'tiktok', label: 'TikTok', charLimit: 2200 },
    { value: 'reddit', label: 'Reddit', charLimit: 10000 },
    { value: 'facebook', label: 'Facebook', charLimit: 63206 },
    { value: 'email', label: 'Email' },
];

const tones: ContentTone[] = ['professional', 'casual', 'bold', 'friendly', 'witty'];

// Template-based fallback when Gemini API is not configured
function generateFallbackContent(
    platform: ContentPlatform,
    productProfile: { name: string; description: string; valueProps: string[]; url?: string; keywords: string[]; targetAudience: string } | null,
    templateExample: string | undefined
): string {
    if (templateExample) return templateExample;
    if (!productProfile) {
        return `Check out our new product!\n\nWe're solving [problem] for [audience].\n\nKey benefits:\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\nLearn more: [link]`;
    }

    const prompts: Record<ContentPlatform, string> = {
        twitter: `${productProfile.name} is here!\n\n${productProfile.valueProps[0] || 'Solve your problems faster.'}\n\nTry it today: ${productProfile.url || 'link in bio'}\n\n${productProfile.keywords.slice(0, 3).map(k => `#${k}`).join(' ')}`,
        linkedin: `I'm excited to share ${productProfile.name}.\n\n${productProfile.description}\n\nHere's what makes it different:\n\n${productProfile.valueProps.map((v, i) => `${i + 1}. ${v}`).join('\n')}\n\nWho else is solving this problem? Let me know in the comments.`,
        instagram: `${productProfile.name}\n\n${productProfile.description}\n\nKey benefits:\n${productProfile.valueProps.map(v => `- ${v}`).join('\n')}\n\nLink in bio!`,
        tiktok: `POV: You just discovered ${productProfile.name}\n\n${productProfile.valueProps[0] || 'And it changes everything.'}\n\n#${productProfile.keywords.join(' #')}`,
        reddit: `[Discussion] We built ${productProfile.name} - ${productProfile.description}\n\nWe're targeting ${productProfile.targetAudience}.\n\nWould love to get feedback from this community. What features would you want to see?`,
        facebook: `Introducing ${productProfile.name}!\n\n${productProfile.description}\n\nWhy we built this:\n${productProfile.valueProps.map(v => `- ${v}`).join('\n')}\n\nCheck it out: ${productProfile.url || 'link below'}`,
        email: `Subject: Introducing ${productProfile.name}\n\nHi [Name],\n\n${productProfile.description}\n\nHere's what you'll get:\n${productProfile.valueProps.map(v => `- ${v}`).join('\n')}\n\nClick here to get started: ${productProfile.url || '[link]'}\n\nBest,\n[Your name]`,
    };
    return prompts[platform];
}

export default function Generator() {
    const navigate = useNavigate();
    const { state, dispatch } = useData();
    const { addToast } = useToast();
    const { productProfile, contentTemplates } = state;

    const [platform, setPlatform] = useState<ContentPlatform>('twitter');
    const [tone, setTone] = useState<ContentTone>(productProfile?.tone || 'professional');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [hashtagInput, setHashtagInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const filteredTemplates = contentTemplates.filter(
        t => t.platform === platform || t.platform === 'all'
    );

    const currentPlatform = platforms.find(p => p.value === platform);
    const charCount = content.length;
    const isOverLimit = currentPlatform?.charLimit ? charCount > currentPlatform.charLimit : false;
    const aiAvailable = isAIConfigured();

    const handleGenerate = async () => {
        setIsGenerating(true);

        // If Gemini is configured and we have a product profile, use real AI
        if (aiAvailable && productProfile) {
            try {
                const generatedContent = await generateContent({
                    productProfile,
                    platform,
                    tone,
                    includeHashtags: true,
                });
                setContent(generatedContent);
                setTitle(generatedContent.slice(0, 50) + '...');
                addToast('success', 'Content generated with AI');

                // Auto-generate hashtags
                try {
                    const tags = await generateHashtags(generatedContent, productProfile, platform, 5);
                    setHashtags(tags.map(t => t.replace('#', '')));
                } catch {
                    // Hashtag generation is non-critical, silent fail
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'AI generation failed';
                addToast('error', errorMsg);
                // Fall back to templates
                const template = contentTemplates.find(t => t.id === selectedTemplate);
                const fallback = generateFallbackContent(platform, productProfile, template?.example);
                setContent(fallback);
                setTitle(fallback.slice(0, 50) + '...');
            }
        } else {
            // Fallback to template-based generation
            const template = contentTemplates.find(t => t.id === selectedTemplate);
            const fallback = generateFallbackContent(platform, productProfile, template?.example);
            setContent(fallback);
            setTitle(fallback.slice(0, 50) + '...');

            if (!aiAvailable) {
                addToast('info', 'Using templates. Add VITE_GEMINI_API_KEY for AI generation.');
            }
        }

        setIsGenerating(false);
    };

    const handleSave = (status: ContentPiece['status'] = 'draft') => {
        if (!content.trim()) {
            addToast('warning', 'Generate or write some content first');
            return;
        }

        const newContent: ContentPiece = {
            id: uuidv4(),
            title: title || content.slice(0, 50),
            content,
            platform,
            status,
            tone,
            hashtags,
            templateId: selectedTemplate || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_CONTENT', payload: newContent });
        addToast('success', `Content saved as ${status}`);
        navigate('/content');
    };

    const addHashtag = () => {
        const tag = hashtagInput.replace('#', '').trim();
        if (tag && !hashtags.includes(tag)) {
            setHashtags([...hashtags, tag]);
            setHashtagInput('');
        }
    };

    const removeHashtag = (tag: string) => {
        setHashtags(hashtags.filter(h => h !== tag));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        addToast('success', 'Copied to clipboard');
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/content')} aria-label="Back to Content Studio">
                        {icons.back}
                    </button>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                            Content Generator
                        </h1>
                        <p className="text-muted">
                            {aiAvailable ? 'Create AI-powered marketing content' : 'Create marketing content from templates'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={() => handleSave('draft')}>
                        {icons.save} Save Draft
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSave('review')}>
                        Save & Send to Review
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                {/* Left Column - Settings */}
                <div className="flex flex-col gap-6">
                    {/* Platform Selection */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <div className="flex flex-wrap gap-2">
                            {platforms.map((p) => (
                                <button
                                    key={p.value}
                                    className={`btn btn-sm ${platform === p.value ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setPlatform(p.value)}
                                    aria-pressed={platform === p.value}
                                >
                                    {p.label}
                                    {p.charLimit && (
                                        <span className="text-xs text-muted ml-1">({p.charLimit})</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tone Selection */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Tone</h3>
                        <div className="flex flex-wrap gap-2">
                            {tones.map((t) => (
                                <button
                                    key={t}
                                    className={`btn btn-sm ${tone === t ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setTone(t)}
                                    aria-pressed={tone === t}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template Selection */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Templates</h3>
                        {filteredTemplates.length === 0 ? (
                            <p className="text-muted text-sm">No templates for this platform yet</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <button
                                    className={`btn btn-sm ${!selectedTemplate ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setSelectedTemplate(null)}
                                    style={{ justifyContent: 'flex-start' }}
                                    aria-pressed={!selectedTemplate}
                                >
                                    Custom (no template)
                                </button>
                                {filteredTemplates.map((template) => (
                                    <button
                                        key={template.id}
                                        className={`btn btn-sm ${selectedTemplate === template.id ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setSelectedTemplate(template.id)}
                                        style={{ justifyContent: 'flex-start' }}
                                        aria-pressed={selectedTemplate === template.id}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        style={{ width: '100%', padding: 'var(--space-4)' }}
                    >
                        {isGenerating ? (
                            'Generating...'
                        ) : (
                            <>
                                {icons.sparkle}
                                <span className="ml-2">
                                    {aiAvailable ? 'Generate with AI' : 'Generate from Template'}
                                </span>
                            </>
                        )}
                    </button>

                    {!productProfile && (
                        <div
                            className="card"
                            style={{
                                padding: 'var(--space-4)',
                                background: 'rgba(251, 191, 36, 0.1)',
                                borderColor: 'rgba(251, 191, 36, 0.3)',
                            }}
                        >
                            <p className="text-sm">
                                Set up your <a href="/content/analyze" style={{ color: 'var(--color-primary)' }}>Product Profile</a> for {aiAvailable ? 'better AI-generated' : 'personalized'} content
                            </p>
                        </div>
                    )}

                    {!aiAvailable && (
                        <div
                            className="card"
                            role="alert"
                            style={{
                                padding: 'var(--space-4)',
                                background: 'rgba(99, 102, 241, 0.08)',
                                borderColor: 'rgba(99, 102, 241, 0.2)',
                            }}
                        >
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                <strong>AI not configured.</strong> Add <code style={{ fontSize: '0.85em', padding: '1px 4px', background: 'var(--color-bg-tertiary)', borderRadius: '3px' }}>VITE_GEMINI_API_KEY</code> to your <code style={{ fontSize: '0.85em', padding: '1px 4px', background: 'var(--color-bg-tertiary)', borderRadius: '3px' }}>.env</code> file for AI-powered content generation.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column - Content Editor */}
                <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <label htmlFor="content-title" className="font-semibold mb-4" style={{ display: 'block' }}>Title</label>
                        <input
                            id="content-title"
                            type="text"
                            className="input"
                            placeholder="Give your content a title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Content Editor */}
                    <div className="card" style={{ padding: 'var(--space-6)', flex: 1 }}>
                        <div className="flex items-center justify-between mb-4">
                            <label htmlFor="content-editor" className="font-semibold">Content</label>
                            <div className="flex items-center gap-2">
                                <button className="btn btn-ghost btn-sm" onClick={copyToClipboard} aria-label="Copy content to clipboard">
                                    {icons.copy} Copy
                                </button>
                                <span
                                    className={`text-sm ${isOverLimit ? 'text-error' : 'text-muted'}`}
                                    aria-live="polite"
                                >
                                    {charCount}
                                    {currentPlatform?.charLimit && ` / ${currentPlatform.charLimit}`}
                                </span>
                            </div>
                        </div>
                        <textarea
                            id="content-editor"
                            className="input"
                            rows={12}
                            placeholder="Your content will appear here after generation, or type your own..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            aria-invalid={isOverLimit}
                            style={{
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                borderColor: isOverLimit ? 'var(--color-error)' : undefined,
                            }}
                        />
                    </div>

                    {/* Hashtags */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Hashtags</h3>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                className="input"
                                style={{ flex: 1 }}
                                placeholder="Add hashtag"
                                value={hashtagInput}
                                onChange={(e) => setHashtagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                                aria-label="Add hashtag"
                            />
                            <button className="btn btn-secondary" onClick={addHashtag}>
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2" role="list" aria-label="Selected hashtags">
                            {hashtags.map((tag) => (
                                <span key={tag} className="badge badge-primary" role="listitem">
                                    #{tag}
                                    <button
                                        onClick={() => removeHashtag(tag)}
                                        aria-label={`Remove #${tag}`}
                                        style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                                    >
                                        x
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
