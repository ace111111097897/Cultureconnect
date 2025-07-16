import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface MessagingPromptsProps {
  conversationId: string;
  userProfile: any;
  matchProfile: any;
  onPromptSelect: (message: string) => void;
}

export function MessagingPrompts({ conversationId, userProfile, matchProfile, onPromptSelect }: MessagingPromptsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [showAIDog, setShowAIDog] = useState(false);

  const generateStarter = useAction(api.ai.generateConversationStarter);

  const predefinedPrompts = [
    "What's your favorite cultural tradition and why?",
    "I noticed we both love [shared interest] - what got you into it?",
    "What's the best dish from your culture that you'd recommend?",
    "I'd love to hear about your travel experiences!",
    "What values are most important to you in relationships?",
    "What's something unique about your cultural background?",
  ];

  const handleGenerateAIPrompt = async () => {
    if (!userProfile || !matchProfile) return;

    setIsGenerating(true);
    setShowAIDog(true);

    try {
      const aiPrompt = await generateStarter({
        userProfile: {
          culturalBackground: userProfile.culturalBackground || [],
          interests: [
            ...(userProfile.foodPreferences || []),
            ...(userProfile.musicGenres || []),
            ...(userProfile.travelInterests || []),
          ],
          values: userProfile.values || [],
        },
        matchProfile: {
          culturalBackground: matchProfile.culturalBackground || [],
          interests: [
            ...(matchProfile.foodPreferences || []),
            ...(matchProfile.musicGenres || []),
            ...(matchProfile.travelInterests || []),
          ],
          values: matchProfile.values || [],
        },
      });

      setGeneratedPrompts(prev => [aiPrompt, ...prev.slice(0, 2)]);
      toast.success("AI generated a personalized conversation starter!");
    } catch (error) {
      console.error("Failed to generate AI prompt:", error);
      toast.error("Failed to generate AI prompt");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setShowAIDog(false), 2000);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">💬 Conversation Starters</h3>
        
        {/* AI Dog */}
        <div className="relative">
          {showAIDog && (
            <div className="absolute -top-2 -right-2 animate-bounce">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white/20">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                AI thinking...
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleGenerateAIPrompt}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <span>🐕</span>
              <span>{isGenerating ? "Generating..." : "AI Starter"}</span>
            </button>
            
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* AI Generated Prompts */}
        {generatedPrompts.length > 0 && (
          <div>
            <p className="text-white/60 text-sm mb-2">🤖 AI Generated:</p>
            {generatedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect(prompt)}
                className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all mb-2"
              >
                <span className="text-sm">🐕 {prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Predefined Prompts */}
        <div>
          <p className="text-white/60 text-sm mb-2">💫 Suggested Starters:</p>
          <div className="grid gap-2">
            {predefinedPrompts.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptSelect(prompt)}
                className="text-left p-3 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-all text-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-white/50 text-xs">
            💡 Tip: Personalize these prompts with specific details from their profile!
          </p>
        </div>
      </div>
    </div>
  );
}
