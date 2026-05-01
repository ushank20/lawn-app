import { Link } from 'react-router-dom';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#2d6a4f]" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">You're all set!</h1>
        <p className="text-gray-600 mb-4">
          We received your request and will be in touch soon to confirm your appointment.
        </p>
        <p className="text-gray-600 mb-8">
          Have questions? Call or text us at{' '}
          <a href="tel:+15555555555" className="text-[#2d6a4f] font-semibold hover:underline">
            (555) 555-5555
          </a>
        </p>

        <Link
          to="/"
          className="inline-block bg-[#2d6a4f] hover:bg-[#245a42] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Schedule Another Service
        </Link>
      </div>
    </div>
  );
}
