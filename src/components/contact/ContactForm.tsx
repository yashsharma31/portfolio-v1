"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "@phosphor-icons/react";
import emailjs from "@emailjs/browser";
import toast, { Toaster } from "react-hot-toast";
import { triggerContactBurst } from "@/components/background/burstControl";
import { EASE_OUT, DUR } from "@/utils/motion";

type Fields = {
  name: string;
  email: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", message: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Enter a valid email.";
  }
  if (!fields.message.trim()) errors.message = "Message is required.";
  return errors;
}

/**
 * Inline contact form (PRD 6.8). EmailJS transport, inline validation,
 * blur-crossfade morph to success on the submit button.
 */
export default function ContactForm() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (!publicKey) {
      console.error("EmailJS public key is missing");
      return;
    }
    emailjs.init(publicKey);
    setReady(true);
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name as keyof Fields]) return prev;
      const next = { ...prev };
      delete next[name as keyof Fields];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || success) return;

    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!ready || !serviceId || !templateId || !publicKey) {
      toast.error("Email service is not ready. Try again in a moment.");
      return;
    }

    setSending(true);
    try {
      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: fields.name.trim(),
          from_email: fields.email.trim(),
          subject: "Portfolio contact",
          message: fields.message.trim(),
        },
        publicKey,
      );

      if (result.text === "OK") {
        setFields(EMPTY);
        setSuccess(true);
        triggerContactBurst();
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setSuccess(false), 4000);
      } else {
        toast.error("Could not send. Try again, or email me directly.");
      }
    } catch {
      toast.error("Could not send. Try again, or email me directly.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full border border-line bg-subtle px-5 py-3 text-ink placeholder:text-ink-tertiary transition-[border-color] duration-200 ease-[var(--ease-out)] outline-none focus:border-line-strong";

  const duration = reduce ? 0 : DUR.ui;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-elevated)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
          },
        }}
      />
      <form
        noValidate
        onSubmit={onSubmit}
        className="flex max-w-xl flex-col gap-5"
      >
        <Field
          id={`${baseId}-name`}
          label="Name"
          error={errors.name}
        >
          <input
            id={`${baseId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={onChange}
            className={`${inputClass} rounded-full`}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${baseId}-name-err` : undefined}
          />
        </Field>

        <Field
          id={`${baseId}-email`}
          label="Email"
          error={errors.email}
        >
          <input
            id={`${baseId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={onChange}
            className={`${inputClass} rounded-full`}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${baseId}-email-err` : undefined}
          />
        </Field>

        <Field
          id={`${baseId}-message`}
          label="Message"
          error={errors.message}
        >
          <textarea
            id={`${baseId}-message`}
            name="message"
            rows={5}
            value={fields.message}
            onChange={onChange}
            className={`${inputClass} resize-none rounded-2xl`}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? `${baseId}-message-err` : undefined
            }
          />
        </Field>

        <button
          type="submit"
          data-organism-anchor="contact-cta"
          disabled={sending || success}
          className="relative inline-flex h-12 min-w-[10.5rem] items-center justify-center self-start overflow-hidden rounded-full bg-accent px-8 font-medium text-page transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97] disabled:cursor-wait"
        >
          <AnimatePresence mode="wait" initial={false}>
            {success ? (
              <motion.span
                key="ok"
                className="inline-flex items-center gap-2"
                initial={
                  reduce
                    ? false
                    : { opacity: 0, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(4px)" }
                }
                transition={{ duration, ease: EASE_OUT }}
              >
                <Check size={18} weight="bold" aria-hidden />
                Message sent
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={
                  reduce
                    ? false
                    : { opacity: 0, filter: "blur(4px)" }
                }
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(4px)" }
                }
                transition={{ duration, ease: EASE_OUT }}
              >
                {sending ? "Sending..." : "Send message"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </form>
    </>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-xs tracking-wide text-ink-tertiary"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-[13px] text-accent-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}
