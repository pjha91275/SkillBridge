import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Goal from "@/models/Goal";
import ResumeChecklist from "@/models/ResumeChecklist";
import AnalyticsDashboardClient from "./AnalyticsDashboardClient";

const ROLE_SKILLS: Record<string, string[]> = {
  'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
  'Backend Developer': ['Node.js', 'Express', 'MongoDB', 'SQL', 'DBMS', 'Docker', 'Git'],
  'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'DBMS', 'SQL', 'Git', 'Tailwind CSS'],
  'Software Engineer': ['Data Structures', 'Algorithms', 'DBMS', 'Java', 'Python', 'System Design', 'Git'],
  'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics', 'Pandas', 'Git'],
  'Machine Learning Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'SQL', 'Statistics', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Git', 'Shell Scripting'],
  'Cloud Architect': ['AWS', 'Cloud Computing', 'System Design', 'Networking', 'Security', 'Git'],
  'Cybersecurity Analyst': ['Networking', 'Linux', 'Security', 'Python', 'Cryptography', 'Penetration Testing'],
  'Mobile Developer': ['React Native', 'Swift', 'Kotlin', 'JavaScript', 'Git'],
};

interface ChecklistItem {
  id: string;
  isDynamic: boolean;
  check?: (data: any) => boolean;
}

const RESUME_ITEMS: ChecklistItem[] = [
  { id: 'prof-name', isDynamic: true, check: (d) => !!d.name?.trim() },
  { id: 'prof-email', isDynamic: true, check: (d) => !!d.email?.trim() },
  { id: 'prof-role', isDynamic: true, check: (d) => !!d.targetRole?.trim() },
  { id: 'edu-college', isDynamic: true, check: (d) => !!d.college?.trim() },
  { id: 'edu-branch', isDynamic: true, check: (d) => !!d.branch?.trim() },
  { id: 'edu-year', isDynamic: true, check: (d) => !!d.graduationYear },
  { id: 'edu-cgpa', isDynamic: true, check: (d) => Number(d.cgpa) > 0 },
  { id: 'skills-count', isDynamic: true, check: (d) => (d.skills || []).length >= 3 },
  { id: 'proj-count', isDynamic: true, check: (d) => (d.projects || []).length >= 2 },
  { id: 'proj-desc', isDynamic: true, check: (d) => (d.projects || []).length > 0 && (d.projects || []).every((p: any) => !!p.description?.trim() && p.description.trim().length > 5) },
  { id: 'cert-count', isDynamic: true, check: (d) => (d.certifications || []).length >= 1 },
  // Manual checklist items
  { id: 'exp-added', isDynamic: false },
  { id: 'exp-verbs', isDynamic: false },
  { id: 'exp-quantified', isDynamic: false },
  { id: 'ach-contest', isDynamic: false },
  { id: 'ach-hackathon', isDynamic: false },
  { id: 'links-linkedin', isDynamic: false },
  { id: 'links-github', isDynamic: false },
  { id: 'links-portfolio', isDynamic: false },
];

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  await dbConnect();

  const userDoc = await User.findById(userId);
  if (!userDoc) {
    redirect("/login");
  }

  const profileDoc = await Profile.findOne({ userId });
  const profile = profileDoc || {
    skills: [],
    targetRole: '',
    projects: [],
    dsaProgress: 0,
    certifications: [],
    cgpa: 0,
  };

  // 1. Placement Readiness Score Components
  const userSkillsLower = (profile.skills || []).map((s: string) => s.toLowerCase().trim());
  const targetRole = profile.targetRole || '';
  const requiredSkills = ROLE_SKILLS[targetRole] || [];

  const acquiredSkills = requiredSkills.filter((skill) =>
    userSkillsLower.includes(skill.toLowerCase().trim())
  );
  const missingSkills = requiredSkills.filter((skill) =>
    !userSkillsLower.includes(skill.toLowerCase().trim())
  );

  // A. Skills Score (Max 30)
  let skillsPoints = 0;
  if (targetRole) {
    skillsPoints = requiredSkills.length > 0 
      ? Math.round((acquiredSkills.length / requiredSkills.length) * 30) 
      : 0;
  } else {
    skillsPoints = Math.min(30, (profile.skills?.length || 0) * 5);
  }

  // B. Projects Score (Max 25)
  const projectsCount = profile.projects?.length || 0;
  const projectsPoints = Math.min(25, projectsCount * 10);

  // C. DSA Score (Max 25)
  const dsaProgressVal = profile.dsaProgress || 0;
  const dsaPoints = Math.round(dsaProgressVal * 0.25);

  // D. Certifications Score (Max 10)
  const certsCount = profile.certifications?.length || 0;
  const certsPoints = Math.min(10, certsCount * 5);

  // E. Profile Completion Score (Max 10)
  let profilePoints = 0;
  if (userDoc.name) profilePoints += 2;
  if (userDoc.college) profilePoints += 2;
  if (userDoc.branch) profilePoints += 2;
  if (userDoc.graduationYear) profilePoints += 2;
  if (profile.cgpa > 0) profilePoints += 1;
  if (targetRole) profilePoints += 1;

  const readinessScore = skillsPoints + projectsPoints + dsaPoints + certsPoints + profilePoints;

  // 2. Skill Completion %
  const skillCompletionPercent = targetRole
    ? (requiredSkills.length > 0 ? Math.round((acquiredSkills.length / requiredSkills.length) * 100) : 0)
    : (profile.skills?.length ? Math.min(100, Math.round((profile.skills.length / 8) * 100)) : 0);

  // 3. Roadmap Progress %
  // 1 step per target skill, 1 project step, 1 interview prep step
  const roadmapSteps = [];
  const roadmapSkills = ROLE_SKILLS[targetRole] || ['Data Structures', 'Algorithms', 'Web Development', 'DBMS'];
  roadmapSkills.forEach((s) => {
    roadmapSteps.push(userSkillsLower.includes(s.toLowerCase().trim()));
  });
  const hasProjects = projectsCount >= 1;
  roadmapSteps.push(hasProjects); // projects step
  
  const allSkillsCompleted = roadmapSkills.every((s) => userSkillsLower.includes(s.toLowerCase().trim()));
  roadmapSteps.push(allSkillsCompleted && hasProjects); // interview prep step
  
  const completedRoadmapSteps = roadmapSteps.filter(Boolean).length;
  const roadmapProgressPercent = Math.round((completedRoadmapSteps / roadmapSteps.length) * 100);

  // 4. Resume Completion %
  let checklistDoc = await ResumeChecklist.findOne({ userId });
  const checkedItems = checklistDoc?.checkedItems || [];
  
  const resumeEvalData = {
    name: userDoc.name,
    email: userDoc.email,
    college: userDoc.college,
    branch: userDoc.branch,
    graduationYear: userDoc.graduationYear,
    cgpa: profile.cgpa,
    skills: profile.skills || [],
    projects: profile.projects || [],
    certifications: profile.certifications || [],
    targetRole: profile.targetRole || '',
  };

  const completedResumeItemsCount = RESUME_ITEMS.filter((item) => {
    if (item.isDynamic) {
      return !!item.check?.(resumeEvalData);
    }
    return checkedItems.includes(item.id);
  }).length;
  const resumeCompletionPercent = Math.round((completedResumeItemsCount / RESUME_ITEMS.length) * 100);

  // 5. Goals Trends from DB
  const userGoals = await Goal.find({ userId });
  const goalsData = {
    total: userGoals.length,
    completed: userGoals.filter(g => g.status === 'Completed').length,
    inProgress: userGoals.filter(g => g.status === 'In Progress').length,
    pending: userGoals.filter(g => g.status === 'Pending').length,
  };

  // Convert mongoose documents into serializable structures
  const serializedProfile = {
    targetRole: profile.targetRole || '',
    skills: profile.skills || [],
    projects: (profile.projects || []).map((p: any) => ({
      title: p.title || '',
      description: p.description || '',
    })),
    certifications: (profile.certifications || []).map((c: any) => ({
      name: c.name || '',
    })),
    dsaProgress: profile.dsaProgress || 0,
    cgpa: profile.cgpa || 0,
  };

  const serializedGoalsList = userGoals.map((g) => ({
    _id: g._id.toString(),
    title: g.title || '',
    status: g.status || 'Pending',
    priority: g.priority || 'Medium',
    category: g.category || 'General',
  }));

  const serializableData = {
    readinessScore,
    skillCompletionPercent,
    dsaCompletionPercent: dsaProgressVal,
    roadmapProgressPercent,
    resumeCompletionPercent,
    profile: serializedProfile,
    goalsSummary: goalsData,
    goalsList: serializedGoalsList,
    missingSkills,
    requiredSkills,
    acquiredSkills,
  };

  return (
    <AnalyticsDashboardClient data={serializableData} />
  );
}
