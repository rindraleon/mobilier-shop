import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ChevronDown, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../components/ui/Form";
import Reveal from "../../components/ui/Reveal";

interface ContactInfo {
  icon: LucideIcon;
  title: string;
  lines: string[];
}

const contactInfo: ContactInfo[] = [
  { icon: MapPin, title: "Showroom", lines: ["14 rue du Faubourg", "75010 Paris, France"] },
  { icon: Phone, title: "Téléphone", lines: ["+33 1 23 45 67 89", "Du lundi au samedi"] },
  { icon: Mail, title: "Email", lines: ["bonjour@anti-mobilier.fr", "Réponse sous 24 h"] },
  { icon: Clock, title: "Horaires", lines: ["Lun – Sam : 10 h – 19 h", "Dim : sur rendez-vous"] },
];

interface Faq {
  q: string;
  a: string;
}

const faqs: Faq[] = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "La livraison standard prend 3 à 5 jours ouvrés, l'express 24 à 48 h. Les produits en stock sont expédiés le jour même pour toute commande passée avant 14 h.",
  },
  {
    q: "Comment fonctionnent les retours ?",
    a: "Vous disposez de 30 jours après réception pour changer d'avis. Le retour est gratuit : imprimez l'étiquette prépayée depuis votre espace client et déposez le colis en point relais.",
  },
  {
    q: "Proposez-vous un service de montage ?",
    a: "Oui, dans toute la France métropolitaine, pour 79 € par commande. Nos livreurs montent vos meubles, débarrassent les emballages et repartent avec.",
  },
  {
    q: "La garantie couvre-t-elle tout ?",
    a: "Nos meubles sont garantis 5 ans contre les défauts de fabrication et de matériaux. L'usure normale et les dégâts d'humidité ne sont pas couverts.",
  },
];

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", subject: "Question produit", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [openFaq, setOpenFaq] = useState<number>(0);

  const set =
    (key: keyof ContactForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.name.trim()) errs.name = "Votre nom est requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Adresse email invalide.";
    if (form.message.trim().length < 10) errs.message = "Votre message doit contenir au moins 10 caractères.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setForm({ name: "", email: "", subject: "Question produit", message: "" });
    toast("Merci ! Votre message a bien été envoyé. Nous revenons vers vous sous 24 h.");
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Contact" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-display-md text-primary">Contactez-nous</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Une question sur un produit, une commande ou un projet d'aménagement ? Notre équipe vous répond en
          moins de 24 heures.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* Formulaire */}
        <Reveal className="lg:col-span-2">
          <form onSubmit={submit} className="card space-y-5 p-6 md:p-8" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom complet" required error={errors.name}>
                <Input value={form.name} onChange={set("name")} placeholder="Camille Moreau" />
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="camille@exemple.fr" />
              </Field>
            </div>
            <Field label="Sujet">
              <Select value={form.subject} onChange={set("subject")}>
                <option>Question produit</option>
                <option>Suivi de commande</option>
                <option>Retour / échange</option>
                <option>Projet d'aménagement</option>
                <option>Partenariat</option>
                <option>Autre</option>
              </Select>
            </Field>
            <Field label="Message" required error={errors.message}>
              <Textarea
                value={form.message}
                onChange={set("message")}
                placeholder="Décrivez votre demande en quelques lignes…"
                rows={6}
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" variant="accent" size="lg">
                <Send size={17} /> Envoyer le message
              </Button>
            </div>
          </form>
        </Reveal>

        {/* Infos */}
        <div className="space-y-4">
          {contactInfo.map(({ icon: Icon, title, lines }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="card flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="text-label-lg text-primary">{title}</h3>
                  {lines.map((line) => (
                    <p key={line} className="text-body-sm text-on-surface-variant">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-6 text-center font-display text-headline-lg text-primary">Questions fréquentes</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={faq.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-primary">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-secondary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-body-md text-on-surface-variant">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
