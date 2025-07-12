"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: "Culture Dating App <welcome@culture.app>",
        to: args.email,
        subject: "Welcome to Culture - Your Cultural Dating Journey Begins! 🌍",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin-bottom: 10px;">🐕 Welcome to Culture!</h1>
              <p style="font-size: 18px; margin: 0;">Hi ${args.displayName}!</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #FFD700; margin-top: 0;">Your Cultural Dating Adventure Starts Now!</h2>
              <p>Welcome to Culture, where meaningful connections are built through shared traditions, values, and cultural experiences.</p>
              
              <h3 style="color: #FFD700;">Meet Kandi, Your AI Companion 🐕</h3>
              <p>Kandi is your friendly AI assistant who will help you:</p>
              <ul>
                <li>Find conversation starters based on cultural connections</li>
                <li>Get dating advice tailored to cultural relationships</li>
                <li>Navigate meaningful conversations about traditions and values</li>
                <li>Build authentic connections with like-minded people</li>
              </ul>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #FFD700; margin-top: 0;">What Makes Culture Special:</h3>
              <ul>
                <li>🌍 Connect through shared cultural backgrounds</li>
                <li>💫 Match based on values and traditions</li>
                <li>📖 Share your cultural stories and experiences</li>
                <li>🤝 Build friendships and meaningful relationships</li>
                <li>🐕 Get personalized advice from Kandi AI</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Ready to start your cultural dating journey?</p>
              <p style="font-size: 14px; color: #FFD700;">
                💡 Pro tip: Complete your profile with cultural details to get better matches!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="font-size: 12px; color: rgba(255,255,255,0.7);">
                Happy connecting!<br>
                The Culture Team 🌟
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Failed to send welcome email:", error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      console.log("Welcome email sent successfully:", data);
      return data;
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error(`Email service error: ${error}`);
    }
  },
});

export const sendMatchNotificationEmail = internalAction({
  args: {
    email: v.string(),
    userName: v.string(),
    matchName: v.string(),
    sharedInterests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: "Culture Dating App <matches@culture.app>",
        to: args.email,
        subject: `🎉 New Cultural Match: ${args.matchName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); color: white; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin-bottom: 10px;">🎉 You have a new match!</h1>
              <p style="font-size: 18px; margin: 0;">Hi ${args.userName}!</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #FFD700; margin-top: 0;">You matched with ${args.matchName}! 💫</h2>
              <p>You both share some amazing cultural connections:</p>
              
              <div style="margin: 15px 0;">
                <h3 style="color: #FFD700;">Shared Interests:</h3>
                <ul>
                  ${args.sharedInterests.map(interest => `<li>${interest}</li>`).join('')}
                </ul>
              </div>
              
              <p>This could be the start of something beautiful! 🌟</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #FFD700; margin-top: 0;">💡 Kandi's Tips for Your First Message:</h3>
              <ul>
                <li>Ask about their cultural traditions or family customs</li>
                <li>Share a meaningful cultural experience you've had</li>
                <li>Suggest a cultural activity you could do together</li>
                <li>Ask about their favorite cultural foods or festivals</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Ready to start the conversation?</p>
              <p style="font-size: 14px; color: #FFD700;">
                🐕 Don't forget - Kandi can help you craft the perfect message!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="font-size: 12px; color: rgba(255,255,255,0.7);">
                Happy connecting!<br>
                The Culture Team & Kandi 🐕
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Failed to send match notification email:", error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      console.log("Match notification email sent successfully:", data);
      return data;
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error(`Email service error: ${error}`);
    }
  },
});

export const sendFriendRequestNotificationEmail = internalAction({
  args: {
    email: v.string(),
    recipientName: v.string(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: "Culture Dating App <friends@culture.app>",
        to: args.email,
        subject: `👥 ${args.senderName} sent you a friend request!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin-bottom: 10px;">👥 New Friend Request!</h1>
              <p style="font-size: 18px; margin: 0;">Hi ${args.recipientName}!</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #FFD700; margin-top: 0;">${args.senderName} wants to be friends! 🤝</h2>
              <p>Someone is interested in building a cultural connection with you.</p>
              <p>Check out their profile and see what cultural experiences you might share!</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #FFD700; margin-top: 0;">🐕 Kandi says:</h3>
              <p>"Woof! New friendships are paws-itively amazing! Take a look at their cultural background and see what traditions you might have in common. Building friendships through shared values creates the strongest bonds!"</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Ready to make a new cultural friend?</p>
              <p style="font-size: 14px; color: #FFD700;">
                Log in to Culture to respond to the friend request!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="font-size: 12px; color: rgba(255,255,255,0.7);">
                Happy connecting!<br>
                The Culture Team & Kandi 🐕
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Failed to send friend request notification email:", error);
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      console.log("Friend request notification email sent successfully:", data);
      return data;
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error(`Email service error: ${error}`);
    }
  },
});
