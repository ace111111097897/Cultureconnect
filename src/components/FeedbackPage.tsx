import React, { useState } from "react";

export function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFeedback("");
    // In a real app, send feedback to backend here
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-8 border border-white/20 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">Feedback</h2>
      <p className="text-white/80 mb-6 text-center max-w-lg text-base sm:text-lg">
        We value your thoughts! Please let us know what you love, what could be better, or any ideas you have for CultureConnect.
      </p>
      {submitted ? (
        <div className="text-green-300 text-lg font-semibold">Thank you for your feedback! 💡</div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col space-y-4">
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className="w-full min-h-[100px] sm:min-h-[120px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-base sm:text-lg"
            placeholder="Type your feedback here..."
            required
          />
          <button
            type="submit"
            className="px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all text-base sm:text-lg"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
} 