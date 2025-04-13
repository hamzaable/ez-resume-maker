import { createContext, useContext, useState, ReactNode } from 'react';

interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  country: string;
  state: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface DocumentStyle {
  font: string;
  fontSize: number;
  lineSpacing: number;
  margins: number;
}

interface ResumeData {
  contact: ContactInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  summary: string;
  documentStyle: DocumentStyle;
}

interface ResumeContextType {
  resumeData: ResumeData;
  updateContact: (contact: ContactInfo) => void;
  updateExperiences: (experiences: Experience[]) => void;
  updateEducation: (education: Education[]) => void;
  updateSkills: (skills: string[]) => void;
  updateSummary: (summary: string) => void;
  updateDocumentStyle: (style: Partial<DocumentStyle>) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>({
    contact: {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      website: '',
      country: '',
      state: '',
    },
    experiences: [],
    education: [],
    skills: [],
    summary: '',
    documentStyle: {
      font: 'MERRIWEATHER',
      fontSize: 11,
      lineSpacing: 1.5,
      margins: 20,
    },
  });

  const updateContact = (contact: ContactInfo) => {
    setResumeData(prev => ({ ...prev, contact }));
  };

  const updateExperiences = (experiences: Experience[]) => {
    setResumeData(prev => ({ ...prev, experiences }));
  };

  const updateEducation = (education: Education[]) => {
    setResumeData(prev => ({ ...prev, education }));
  };

  const updateSkills = (skills: string[]) => {
    setResumeData(prev => ({ ...prev, skills }));
  };

  const updateSummary = (summary: string) => {
    setResumeData(prev => ({ ...prev, summary }));
  };

  const updateDocumentStyle = (style: Partial<DocumentStyle>) => {
    setResumeData(prev => ({
      ...prev,
      documentStyle: { ...prev.documentStyle, ...style },
    }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        updateContact,
        updateExperiences,
        updateEducation,
        updateSkills,
        updateSummary,
        updateDocumentStyle,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}