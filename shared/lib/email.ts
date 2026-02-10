import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendWelcomeEmail(email: string, name: string) {
    try {
      await resend.emails.send({
        from: 'CaptionFlow <hello@captionflow.app>',
        to: email,
        subject: 'Welcome to CaptionFlow! 🎉',
        html: welcomeEmailTemplate(name),
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  },

  async sendBetaInvite(email: string, inviteCode: string) {
    try {
      await resend.emails.send({
        from: 'CaptionFlow <hello@captionflow.app>',
        to: email,
        subject: 'Your CaptionFlow Beta Access 🚀',
        html: betaInviteTemplate(inviteCode),
      });
    } catch (error) {
      console.error('Failed to send beta invite:', error);
    }
  },

  async sendUpgradeConfirmation(email: string, tier: string) {
    try {
      await resend.emails.send({
        from: 'CaptionFlow <hello@captionflow.app>',
        to: email,
        subject: `Welcome to CaptionFlow ${tier}! 🎊`,
        html: upgradeConfirmationTemplate(tier),
      });
    } catch (error) {
      console.error('Failed to send upgrade email:', error);
    }
  },

  async sendPasswordReset(email: string, resetUrl: string) {
    try {
      await resend.emails.send({
        from: 'CaptionFlow <hello@captionflow.app>',
        to: email,
        subject: 'Reset your CaptionFlow password',
        html: passwordResetTemplate(resetUrl),
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  },
};

function welcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CaptionFlow</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CaptionFlow! 🎉</h1>
      </div>
      
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
        
        <p style="margin-bottom: 20px;">Welcome to CaptionFlow! We're excited to help you create amazing social media captions with AI.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Here's what you can do:</h3>
          <ul style="padding-left: 20px;">
            <li style="margin-bottom: 10px;">✨ Generate AI captions in seconds</li>
            <li style="margin-bottom: 10px;">🎯 Get optimized hashtags for better reach</li>
            <li style="margin-bottom: 10px;">📝 Train the AI on your brand voice (Pro)</li>
            <li style="margin-bottom: 10px;">📱 Support for Instagram, TikTok, LinkedIn & Twitter</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/caption-generator" 
             style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Start Creating Captions
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Free users get 10 captions per day. <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="color: #667eea;">Upgrade to Pro</a> for unlimited captions and brand voice training!
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          You're receiving this email because you signed up for CaptionFlow.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea;">captionflow.app</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

function betaInviteTemplate(inviteCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your CaptionFlow Beta Access</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">You're In! 🚀</h1>
      </div>
      
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi there,</p>
        
        <p style="margin-bottom: 20px;">Great news! You've been selected for the CaptionFlow beta program. You now have unlimited access to all Pro features during the beta period.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #666;">Your beta invite code:</p>
          <div style="background: #fff; border: 2px dashed #f5576c; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 24px; font-weight: bold; color: #f5576c;">
            ${inviteCode}
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/register?code=${inviteCode}" 
             style="background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Create Your Account
          </a>
        </div>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Beta Benefits:</strong></p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
            <li>Unlimited caption generation</li>
            <li>Brand voice training</li>
            <li>All platforms supported</li>
            <li>Priority support</li>
          </ul>
        </div>
        
        <p style="margin-bottom: 20px;">We'd love your feedback! Reply to this email with any bugs, suggestions, or thoughts.</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          You're receiving this because you signed up for the CaptionFlow beta.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #f5576c;">captionflow.app</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

function upgradeConfirmationTemplate(tier: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CaptionFlow ${tier}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">You're Now ${tier}! 🎊</h1>
      </div>
      
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="font-size: 18px; margin-bottom: 20px;">Congratulations!</p>
        
        <p style="margin-bottom: 20px;">Your CaptionFlow account has been upgraded to <strong>${tier}</strong>. You now have access to all premium features!</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0;">
          <h3 style="margin-top: 0; color: #166534;">Your ${tier} Benefits:</h3>
          <ul style="padding-left: 20px; color: #166534;">
            <li style="margin-bottom: 8px;">✅ Unlimited caption generation</li>
            <li style="margin-bottom: 8px;">✅ Brand voice training with 5 examples</li>
            <li style="margin-bottom: 8px;">✅ 10-15 optimized hashtags per caption</li>
            <li style="margin-bottom: 8px;">✅ All platforms: Instagram, TikTok, LinkedIn, Twitter</li>
            <li style="margin-bottom: 8px;">✅ Priority generation speed</li>
            ${tier === 'Team' ? '<li style="margin-bottom: 8px;">✅ 5 team members</li><li style="margin-bottom: 8px;">✅ Shared caption library</li>' : ''}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/caption-generator" 
             style="background: #22c55e; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Start Using Pro Features
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Questions? Reply to this email or contact us at support@captionflow.app
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          Thank you for supporting CaptionFlow!<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #22c55e;">captionflow.app</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

function passwordResetTemplate(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #333; margin: 0; font-size: 24px;">Reset Your Password</h1>
      </div>
      
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p style="margin-bottom: 20px;">Hi there,</p>
        
        <p style="margin-bottom: 20px;">We received a request to reset your CaptionFlow password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" 
             style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Security Tip:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          You're receiving this email because a password reset was requested for your CaptionFlow account.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea;">captionflow.app</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
