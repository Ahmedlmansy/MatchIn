import React, { useState } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  LayoutGrid 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function DashBoardauthContent() {
  const [activeTab, setActiveTab] = useState('auth-form');
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const [formData, setFormData] = useState({
    welcomeTitle: "Welcome Back",
    welcomeSubtitle: "Log in to your account to continue",
    footerTerms: "By signing in, you agree to MatchIn's Terms Privacy Policy.",
    noAccountText: "Don't have an account?",
    createAccountLinkText: "Create an account →",

    badgeText: "Better Opportunities",
    heroTitle: "Great companies hire great people",
    heroSubtitle: "Build your career with the right opportunities and take the next step toward your future."
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saved CMS Data:", formData);
    alert("Saved successfully");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6 dir-ltr text-slate-800">
      
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search sections and content..." 
            className="pl-9 bg-gray-50/50 border-gray-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAccordionOpen(true)}
            className="text-xs text-gray-600 border-gray-200"
          >
            Expand all
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAccordionOpen(false)}
            className="text-xs text-gray-600 border-gray-200"
          >
            Collapse all
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-3 min-w-max bg-gray-50/80 p-2 rounded-xl border border-gray-100">
          <button
            onClick={() => setActiveTab('auth-form')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'auth-form'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="text-left">
              <div className="font-semibold text-sm">Auth Form</div>
              <div className={`text-[11px] ${activeTab === 'auth-form' ? 'opacity-80' : 'text-gray-400'}`}>
                Login & Signup texts
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('hero-section')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'hero-section'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="text-left">
              <div className="font-semibold text-sm">Hero Side</div>
              <div className={`text-[11px] ${activeTab === 'hero-section' ? 'opacity-80' : 'text-gray-400'}`}>
                Background & Title panel
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden bg-white">
        {/* Card Header */}
        <div 
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-100 rounded-xl text-slate-700">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeTab === 'auth-form' 
                  ? 'Auth Page Texts' 
                  : 'Hero Side Panel'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage titles, sub-titles, links and privacy texts.
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="text-gray-400">
            {isAccordionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>

        {/* Card Body */}
        {isAccordionOpen && (
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* TAB 1: AUTH FORM FIELDS */}
              {activeTab === 'auth-form' && (
                <div className="space-y-6">
                  <SingleInputGroup
                    label="WELCOME TITLE"
                    fieldKey="welcomeTitle"
                    value={formData.welcomeTitle}
                    onChange={handleInputChange}
                  />

                  <SingleInputGroup
                    label="WELCOME SUBTITLE"
                    fieldKey="welcomeSubtitle"
                    value={formData.welcomeSubtitle}
                    onChange={handleInputChange}
                  />

                  <SingleInputGroup
                    label="TERMS & PRIVACY POLICY TEXT"
                    fieldKey="footerTerms"
                    value={formData.footerTerms}
                    onChange={handleInputChange}
                  />

                  <SingleInputGroup
                    label="NO ACCOUNT TEXT"
                    fieldKey="noAccountText"
                    value={formData.noAccountText}
                    onChange={handleInputChange}
                  />

                  <SingleInputGroup
                    label="CREATE ACCOUNT LINK TEXT"
                    fieldKey="createAccountLinkText"
                    value={formData.createAccountLinkText}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {/* TAB 2: HERO SIDE FIELDS */}
              {activeTab === 'hero-section' && (
                <div className="space-y-6">
                  <SingleInputGroup
                    label="BADGE TEXT"
                    fieldKey="badgeText"
                    value={formData.badgeText}
                    onChange={handleInputChange}
                  />

                  <SingleInputGroup
                    label="MAIN HERO TITLE"
                    fieldKey="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleInputChange}
                  />

                  <SingleInputGroup
                    label="HERO SUBTITLE"
                    fieldKey="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={handleInputChange}
                    isTextarea={true}
                  />
                </div>
              )}

              {/* Save Button Container */}
              <div className="pt-2 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded-xl font-medium shadow-sm transition-all"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Reusable Single Input Component (English Only)
function SingleInputGroup({ label, fieldKey, value, onChange, isTextarea = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold tracking-wider text-gray-500 uppercase">
        {label}
      </label>
      
      <div className="relative">
        {isTextarea ? (
          <Textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            className="bg-white border-gray-200 text-sm focus:border-primary"
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            className="bg-white border-gray-200 text-sm focus:border-primary"
          />
        )}
      </div>
    </div>
  );
}