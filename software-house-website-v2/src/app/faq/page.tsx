import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Accordion from "@/components/Accordion";

export const metadata: Metadata = { title: "FAQ" };

const faqItems = [
  {
    question: "What services does iotaDev offer?",
    answer: "We specialize in web development, AI/machine learning solutions, and cloud consulting. From building modern web applications to deploying intelligent automation systems, we cover the full spectrum of software engineering.",
  },
  {
    question: "How does your engagement process work?",
    answer: "We start with a discovery phase to understand your goals, then propose a tailored solution. Once agreed, we work in iterative sprints with regular check-ins. You'll have full visibility into progress at every stage.",
  },
  {
    question: "What technologies do you use?",
    answer: "We're technology-agnostic and choose the best tools for each project. Our typical stack includes React, Next.js, Node.js, Python, TypeScript, AWS/GCP/Azure, and various AI/ML frameworks.",
  },
  {
    question: "How long does a typical project take?",
    answer: "Timelines vary based on scope. A typical web application takes 8–16 weeks, while ML projects can range from 4 to 24 weeks depending on data complexity.",
  },
  {
    question: "Can you work with our existing team?",
    answer: "Absolutely. We frequently embed with existing teams to accelerate delivery, provide specialized expertise, or lead specific workstreams.",
  },
  {
    question: "What is your pricing model?",
    answer: "We offer both fixed-price and time-and-materials models depending on project scope and requirements. We'll recommend the most cost-effective approach during the discovery phase.",
  },
  {
    question: "Do you provide ongoing support after launch?",
    answer: "Yes, we offer maintenance and support packages to ensure your solution continues to perform well post-launch.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader title="FAQ" description="Answers to common questions about how we work." />

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <Accordion items={faqItems} />
        </div>
      </section>
    </>
  );
}
