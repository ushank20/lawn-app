const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendBookingConfirmation(booking) {
  const services = [];
  if (booking.lawnMowing) services.push(`Lawn mowing — ${booking.lawnMowingDate?.toDateString()}`);
  if (booking.dethatching) services.push(`Dethatching — ${booking.dethatchingDate?.toDateString()}`);
  if (booking.sprinklerBlowout) services.push(`Sprinkler blowout — ${booking.sprinklerBlowoutDate?.toDateString()}`);

  await transporter.sendMail({
    from: `"Green & Clean Lawn Services" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New booking from ${booking.firstName} ${booking.lastName} — ${booking.city}`,
    text: `
New service request received!

Customer: ${booking.firstName} ${booking.lastName}
Phone: ${booking.phone}
Address: ${booking.streetAddress}, ${booking.city}, ${booking.state} ${booking.zipCode}

Services requested:
${services.join('\n')}

Payment: ${booking.paymentMethod}
Notes: ${booking.notes || 'None'}
    `.trim(),
  });
}

async function sendCustomerConfirmation(booking) {
  if (!booking.email) return;

  const services = [];
  if (booking.lawnMowing) services.push(`Lawn mowing on ${booking.lawnMowingDate?.toDateString()}`);
  if (booking.dethatching) services.push(`Dethatching on ${booking.dethatchingDate?.toDateString()}`);
  if (booking.sprinklerBlowout) services.push(`Sprinkler blowout on ${booking.sprinklerBlowoutDate?.toDateString()}`);

  await transporter.sendMail({
    from: `"Green & Clean Lawn Services" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: 'We received your service request!',
    text: `
Hi ${booking.firstName},

Thanks for booking with us! Here's a summary:

Services:
${services.join('\n')}

Payment: ${booking.paymentMethod === 'zelle' ? 'Zelle — we will send you our Zelle info shortly' : 'Cash — payable on the day of service'}

We'll be in touch to confirm your dates. Feel free to call or text us with any questions.

Thanks,
Green & Clean Lawn Services
    `.trim(),
  });
}

module.exports = { sendBookingConfirmation, sendCustomerConfirmation };
