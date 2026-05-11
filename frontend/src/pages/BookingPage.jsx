import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../lib/api';

const SERVICES = [
  {
    key: 'lawnMowing',
    dateKey: 'lawnMowingDate',
    title: 'Lawn Mowing',
    description: 'Full mow, edge trimming, and cleanup',
    icon: '🌿',
  },
  {
    key: 'dethatching',
    dateKey: 'dethatchingDate',
    title: 'Dethatching',
    description: 'Remove thatch buildup for healthier grass',
    icon: '🌱',
  },
  {
    key: 'sprinklerBlowout',
    dateKey: 'sprinklerBlowoutDate',
    title: 'Sprinkler Blowout',
    description: 'Winterize your sprinkler system',
    icon: '💧',
  },
];

const TODAY = new Date().toISOString().split('T')[0];

export default function BookingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    streetAddress: '', city: '', state: '', zipCode: '',
    communityName: '',
    lawnMowing: false, lawnMowingDate: '',
    dethatching: false, dethatchingDate: '',
    sprinklerBlowout: false, sprinklerBlowoutDate: '',
    paymentMethod: '',
    notes: '',
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function toggleService(key, dateKey) {
    setForm(prev => ({
      ...prev,
      [key]: !prev[key],
      [dateKey]: !prev[key] ? prev[dateKey] : '',
    }));
  }

  function selectPayment(method) {
    setForm(prev => ({ ...prev, paymentMethod: method }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await bookingApi.submit(form);
      navigate('/confirmation');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#2d6a4f] text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Green & Clean Lawn Services</h1>
        <p className="text-lg text-green-100">Schedule your lawn service in 2 minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Section: Personal info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Your Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name <span className="text-red-500">*</span></label>
                <input
                  name="firstName" value={form.firstName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name <span className="text-red-500">*</span></label>
                <input
                  name="lastName" value={form.lastName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number <span className="text-red-500">*</span></label>
              <input
                name="phone" value={form.phone} onChange={handleChange} type="tel"
                placeholder="(555) 555-5555"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address <span className="text-gray-400 font-normal">(optional — for confirmation)</span></label>
              <input
                name="email" value={form.email} onChange={handleChange} type="email"
                placeholder="you@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]" />
            </div>
          </div>
        </section>

        {/* Section: Services */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Services</h2>
          <p className="text-sm text-gray-500 mb-5">Choose one or more services and pick your preferred date.</p>
          <div className="space-y-3">
            {SERVICES.map(({ key, dateKey, title, description, icon }) => (
              <div
                key={key}
                onClick={() => toggleService(key, dateKey)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  form[key] ? 'border-[#2d6a4f] bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      form[key] ? 'bg-[#2d6a4f] border-[#2d6a4f]' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {form[key] && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>

                {form[key] && (
                  <div className="mt-4" onClick={e => e.stopPropagation()}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name={dateKey}
                      value={form[dateKey]}
                      min={TODAY}
                      onChange={handleChange}
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Address */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Service Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street address <span className="text-red-500">*</span></label>
              <input
                name="streetAddress" value={form.streetAddress} onChange={handleChange}
                placeholder="123 Main St"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input
                  name="city" value={form.city} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                <input
                  name="state" value={form.state} onChange={handleChange}
                  placeholder="CO"
                  maxLength={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] uppercase"
                  required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP code <span className="text-red-500">*</span></label>
              <input
                name="zipCode" value={form.zipCode} onChange={handleChange}
                placeholder="80201"
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                required />
            </div>
          </div>
        </section>

        {/* Section: Community */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Community</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Community name <span className="text-gray-400 font-normal">(optional)</span></label>
            <select
              name="communityName"
              value={form.communityName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] bg-white"
            >
              <option value="">— Select your community —</option>
              <option value="Elm Creek">Elm Creek</option>
              <option value="Tavera">Tavera</option>
              <option value="Bonair">Bonair</option>
            </select>
          </div>
        </section>

        {/* Section: Payment */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Payment Method</h2>
          <div className="grid grid-cols-2 gap-4">
            {[{ value: 'cash', label: 'Cash', sub: 'Pay on day of service' }, { value: 'zelle', label: 'Zelle', sub: "We'll text you our Zelle info" }].map(({ value, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => selectPayment(value)}
                className={`rounded-xl border-2 p-5 text-left transition-all ${
                  form.paymentMethod === value
                    ? 'border-[#2d6a4f] bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-gray-900">{label}</span>
                  {form.paymentMethod === value && (
                    <div className="w-5 h-5 rounded-full bg-[#2d6a4f] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">{sub}</p>
              </button>
            ))}
          </div>
          {form.paymentMethod === 'zelle' && (
            <p className="mt-3 text-sm text-[#2d6a4f] bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              After booking, we'll text you our Zelle info.
            </p>
          )}
        </section>

        {/* Section: Notes */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Additional Notes</h2>
          <p className="text-sm text-gray-500 mb-4">Optional — gate codes, pet information, specific areas, etc.</p>
          <textarea
            name="notes" value={form.notes} onChange={handleChange}
            rows={4}
            placeholder="Any special instructions or notes for us?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] resize-none"
          />
        </section>

        {/* Submit */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2d6a4f] hover:bg-[#245a42] disabled:opacity-50 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          {loading ? 'Submitting...' : 'Schedule My Service →'}
        </button>
      </form>
    </div>
  );
}
