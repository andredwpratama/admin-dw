"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Book, 
  MessageCircle, 
  Video, 
  FileText, 
  ArrowRight,
  Sparkles,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics of AdMind AI and how to set up your account.",
    icon: Book,
    color: "text-blue-500 bg-blue-50"
  },
  {
    title: "AI Analysis",
    description: "Understand how our AI agents explore your data and generate insights.",
    icon: Sparkles,
    color: "text-purple-500 bg-purple-50"
  },
  {
    title: "Data Visualization",
    description: "Master the dashboard and export custom reports for your team.",
    icon: BarChart3,
    color: "text-green-500 bg-green-50"
  },
  {
    title: "Security & Privacy",
    description: "How we protect your marketing data and API credentials.",
    icon: ShieldCheck,
    color: "text-orange-500 bg-orange-50"
  }
];

const faqs = [
  {
    q: "How do I upload my Meta Ads data?",
    a: "Go to the 'Data Upload' section, select 'Meta Ads', and drop your CSV export from Meta Ads Manager. Ensure all required columns are included."
  },
  {
    q: "What AI model does AdMind use?",
    a: "We use the latest NVIDIA Nemotron model via OpenRouter, optimized for deep analytical reasoning and data exploration."
  },
  {
    q: "Can I automate the analysis process?",
    a: "Yes! By default, AdMind runs a daily analysis every morning at 8:00 WIB. You can also trigger manual runs anytime from the Insights page."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use a secure Neon (PostgreSQL) database and your marketing data is never used to train global AI models. All API calls are secured via HTTPS."
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">
      {/* Hero Search */}
      <div className="text-center space-y-6 py-12 bg-primary/5 rounded-[3rem] border border-primary/10 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">How can we help?</h1>
          <p className="text-muted-foreground text-lg">Search our documentation or browse categories below.</p>
        </div>
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <Input 
            placeholder="Search for articles, guides, or features..." 
            className="h-14 pl-12 rounded-full border-2 focus-visible:ring-primary/20 shadow-lg shadow-primary/5"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl hover:shadow-md transition-all group cursor-pointer">
            <CardContent className="p-8">
              <div className="flex gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${cat.color}`}>
                  <cat.icon size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {cat.title}
                    <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
        <Accordion className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 bg-card">
              <AccordionTrigger className="font-bold hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Support CTA */}
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-secondary text-secondary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-black">Still need help?</h2>
            <p className="opacity-80">Our technical support team is available 24/7 to assist you.</p>
          </div>
          <div className="flex gap-4">
            <button className="h-14 px-8 rounded-full bg-white text-secondary font-black shadow-lg hover:bg-opacity-90 transition-colors flex items-center gap-2">
              <MessageCircle size={20} /> Chat with Support
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
