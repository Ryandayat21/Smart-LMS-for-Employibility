import React, { useState, useEffect } from 'react';
import QuestionBank from './QuestionBank';

const ASPECTS = [
  { value: "technical", label: "Technical" },
  { value: "communication", label: "Communication" },
  { value: "problemSolving", label: "Problem Solving" },
  { value: "leadership", label: "Leadership" },
  { value: "teamwork", label: "Teamwork" },
  { value: "workEthic", label: "Work Ethic" },
  { value: "digitalLiteracy", label: "Digital Literacy" },
  { value: "criticalThinking", label: "Critical Thinking" },
  { value: "attentionDetail", label: "Attention To Detail" },
  { value: "emotionalIntel", label: "Emotional Intelligence" },
];

const JOBS = [
  { id: "frontend", label: "Front Office / Customer Service", cat: "FO" },
  { id: "marketing", label: "Marketing & Sales", cat: "FO" },
  { id: "uiux", label: "UI/UX Designer", cat: "FO" },
  { id: "software-eng", label: "Software Engineer", cat: "BO" },
  { id: "data-analyst", label: "Data Analyst", cat: "BO" },
  { id: "admin", label: "Administrative Assistant", cat: "BO" },
];

const AdminQuestionBank = ({ user }) => {
  const [newPackageTargetJob, setNewPackageTargetJob] = useState("");
  const [isCustomTargetJob, setIsCustomTargetJob] = useState(false);

  const handleCreatePackage = (packageData) => {
    const finalJob = isCustomTargetJob ? packageData.customJob : newPackageTargetJob;
    // ... existing logic with finalJob
  };

  return <QuestionBank user={user} />;
};

export default AdminQuestionBank;
