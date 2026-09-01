import { useState } from 'react';

export default function ContactScreen() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('sending');

    // This is the integration point for the contact API payload.
    window.setTimeout(() => {
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    }, 350);
  };

  return (
    <main className="contact-page">
      <section className="contact-card" aria-labelledby="contact-heading">
        <div className="contact-intro">
          <p className="contact-eyebrow">Get in touch</p>
          <h1 id="contact-heading" className="font-heading">Let&apos;s build a stronger community.</h1>
          <p>Have a question about our work or want to help? Send us a message and our team will get back to you.</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label className="contact-message-field">
            <span>Message</span>
            <textarea name="message" value={form.message} onChange={handleChange} rows="6" required />
          </label>
          <div className="contact-form-actions">
            <button type="submit" className="contact-submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'}</button>
            {status === 'sent' && <p className="contact-success" role="status">Thanks — your message has been received.</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
