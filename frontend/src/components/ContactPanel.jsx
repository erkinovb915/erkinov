import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Github,
  MessageSquare,
} from 'lucide-react';
import { submitContactForm } from '../lib/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactPanel({ socials, compact = false, autoFocusField = null }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    telegram_handle: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const handleCopyPlaceholder = async (key, value) => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setReceipt(null);

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (trimmedMessage.length < 10) {
      setErrorMsg('Please write a message of at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const saved = await submitContactForm({
        name: trimmedName,
        email: trimmedEmail,
        subject: form.subject.trim() || undefined,
        telegram_handle: form.telegram_handle.trim() || undefined,
        message: trimmedMessage,
      });

      // Displayed strictly AFTER PostgreSQL confirms persistence with record ID
      setReceipt(saved);
      setForm({
        name: '',
        email: '',
        telegram_handle: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setErrorMsg(
        err?.message ||
          'Unable to reach the FastAPI / PostgreSQL server. Your message was not saved yet.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`contact-panel ${compact ? 'contact-panel--compact' : ''}`}>
      {/* Verified Social Channels + Explicit Placeholders */}
      <div className="contact-channels-grid">
        <a
          href={socials.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="channel-card channel-card--cyan"
        >
          <div>
            <span className="channel-tag">TELEGRAM • VERIFIED</span>
            <strong className="channel-value">{socials.telegramHandle}</strong>
          </div>
          <ExternalLink size={17} />
        </a>

        <a
          href={socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="channel-card channel-card--purple"
        >
          <div>
            <span className="channel-tag">INSTAGRAM • VERIFIED</span>
            <strong className="channel-value">{socials.instagramHandle}</strong>
          </div>
          <ExternalLink size={17} />
        </a>

        <button
          type="button"
          className="channel-card channel-card--muted"
          onClick={() => handleCopyPlaceholder('email', socials.emailPlaceholder)}
          title="Placeholder email — click to copy"
        >
          <div className="channel-inline">
            <Mail size={16} className="text-cyan" />
            <div>
              <span className="channel-tag">EMAIL (PLACEHOLDER)</span>
              <strong className="channel-value">{socials.emailPlaceholder}</strong>
            </div>
          </div>
          {copiedKey === 'email' ? <Check size={16} className="text-cyan" /> : <Copy size={15} />}
        </button>

        <button
          type="button"
          className="channel-card channel-card--muted"
          onClick={() => handleCopyPlaceholder('github', socials.githubPlaceholder)}
          title="Placeholder GitHub URL — click to copy"
        >
          <div className="channel-inline">
            <Github size={16} className="text-purple" />
            <div>
              <span className="channel-tag">GITHUB (PLACEHOLDER)</span>
              <strong className="channel-value">github.com/your-username</strong>
            </div>
          </div>
          {copiedKey === 'github' ? <Check size={16} className="text-cyan" /> : <Copy size={15} />}
        </button>
      </div>

      {/* PostgreSQL-Backed Working Contact Form */}
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-header-row">
          <div className="form-header-badge">
            <MessageSquare size={15} />
            <span>Direct Message Dispatch</span>
          </div>
          <span className="db-badge">PostgreSQL Verified</span>
        </div>

        <div className="form-grid-two">
          <label className="form-field">
            <span>Name *</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              maxLength={120}
              required
              autoFocus={autoFocusField === 'form'}
              disabled={submitting}
            />
          </label>

          <label className="form-field">
            <span>Email *</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              maxLength={255}
              required
              disabled={submitting}
            />
          </label>
        </div>

        <div className="form-grid-two">
          <label className="form-field">
            <span>Telegram (Optional)</span>
            <input
              type="text"
              name="telegram_handle"
              value={form.telegram_handle}
              onChange={handleChange}
              placeholder="@username"
              maxLength={100}
              disabled={submitting}
            />
          </label>

          <label className="form-field">
            <span>Subject (Optional)</span>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Project inquiry"
              maxLength={200}
              disabled={submitting}
            />
          </label>
        </div>

        <label className="form-field">
          <span>Message *</span>
          <textarea
            name="message"
            rows={compact ? 3 : 4}
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message for Erkinov Boburjon..."
            maxLength={5000}
            required
            disabled={submitting}
          />
        </label>

        {errorMsg && (
          <div className="form-alert form-alert--error" role="alert">
            <AlertCircle size={17} />
            <span>{errorMsg}</span>
          </div>
        )}

        {receipt && (
          <div className="form-alert form-alert--success" role="status">
            <CheckCircle2 size={18} />
            <div>
              <strong>Saved to PostgreSQL (#{receipt.id})</strong>
              <p>
                {receipt.message} Recorded at{' '}
                {new Date(receipt.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                .
              </p>
            </div>
          </div>
        )}

        <button type="submit" className="btn-neon-submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={17} className="spin-icon" />
              <span>Saving to PostgreSQL...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Send Verified Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
