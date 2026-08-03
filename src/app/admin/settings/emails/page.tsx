"use client";

import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";
import toast from "react-hot-toast";

type EmailTemplateType = "NEW_APPLICATION" | "CONFIRMATION" | "INTERVIEW" | "OFFER" | "REJECTED";

interface EmailTemplate {
  id?: string;
  type: EmailTemplateType;
  subject: string;
  body: string;
}

const DEFAULT_TEMPLATES: Record<EmailTemplateType, { title: string; description: string; variables: string[] }> = {
  NEW_APPLICATION: {
    title: "New Application (Admin Notification)",
    description: "Sent to the admin when a new application is received.",
    variables: ["{{candidateName}}", "{{candidateEmail}}", "{{jobTitle}}", "{{jobDepartment}}", "{{link}}"],
  },
  CONFIRMATION: {
    title: "Application Received (Candidate)",
    description: "Sent to the candidate to confirm their application was received.",
    variables: ["{{candidateName}}", "{{jobTitle}}"],
  },
  INTERVIEW: {
    title: "Interview Invitation (Candidate)",
    description: "Sent to the candidate when their stage changes to Interview.",
    variables: ["{{candidateName}}", "{{jobTitle}}", "{{link}}"],
  },
  OFFER: {
    title: "Job Offer (Candidate)",
    description: "Sent to the candidate when their stage changes to Offer.",
    variables: ["{{candidateName}}", "{{jobTitle}}", "{{link}}"],
  },
  REJECTED: {
    title: "Application Rejected (Candidate)",
    description: "Sent to the candidate when their application is rejected.",
    variables: ["{{candidateName}}", "{{jobTitle}}"],
  },
};

export default function EmailSettingsPage() {
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [selectedType, setSelectedType] = useState<EmailTemplateType>("CONFIRMATION");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templates[selectedType]) {
      setSubject(templates[selectedType].subject);
      setBody(templates[selectedType].body);
    } else {
      setSubject("");
      setBody("");
    }
  }, [selectedType, templates]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/email-templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data: EmailTemplate[] = await res.json();
      const map = data.reduce((acc, t) => {
        acc[t.type] = t;
        return acc;
      }, {} as Record<string, EmailTemplate>);
      setTemplates(map);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!subject || !body) {
      toast.error("Subject and Body are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          subject,
          body,
        }),
      });

      if (!res.ok) throw new Error("Failed to save template");
      
      const saved = await res.json();
      setTemplates(prev => ({ ...prev, [selectedType]: saved }));
      toast.success("Template saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentTemplateDef = DEFAULT_TEMPLATES[selectedType];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-surface-500 mt-1">Manage automated emails sent by the system.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {Object.entries(DEFAULT_TEMPLATES).map(([type, def]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as EmailTemplateType)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors text-sm ${
                selectedType === type
                  ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 font-medium"
                  : "hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
              }`}
            >
              {def.title}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{currentTemplateDef.title}</h2>
              <p className="text-surface-500 text-sm mt-1">{currentTemplateDef.description}</p>
            </div>

            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl text-sm">
              <span className="font-medium text-surface-700 dark:text-surface-300">Available Variables: </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentTemplateDef.variables.map(v => (
                  <code key={v} className="bg-white dark:bg-surface-800 px-2 py-1 rounded border border-surface-200 dark:border-surface-700 text-primary-600">
                    {v}
                  </code>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input w-full"
                placeholder="Email Subject..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email Body</label>
              <div className="prose-container min-h-[300px]">
                <RichTextEditor
                  content={body}
                  onChange={setBody}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export const dynamic = "force-dynamic";
