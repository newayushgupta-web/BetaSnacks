/**
 * Email Service — stub implementation for demo.
 * Replace with Nodemailer + SMTP or SendGrid in production.
 */

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EmailService] Sending email to: ${to}`);
    console.log(`[EmailService] Subject: ${subject}`);
    console.log(`[EmailService] Body: ${text || html}`);
  }
  // In production, integrate with nodemailer or sendgrid here.
  return { success: true, message: 'Email sent (simulated)' };
};

const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Betasnacks! 🍟',
    text: `Hi ${user.name}, welcome to Betasnacks! Snack Smart. Order Fast. Enjoy amazing snacks delivered to your doorstep.`,
  });
};

const sendOrderConfirmationEmail = async (user, order) => {
  return sendEmail({
    to: user.email,
    subject: `Order Confirmed — #${order.orderNumber}`,
    text: `Hi ${user.name}, your Betasnacks order #${order.orderNumber} has been placed successfully! Total: ₹${order.total}`,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: 'Betasnacks — Password Reset Request',
    text: `Hi ${user.name}, click the link to reset your password: ${resetUrl}`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
};
