// Project interface for type safety
import { Project } from "@/interfaces/project.interface";

// Extended Project interface for mock data (with uid instead of id)
export interface MockProject {
  uid: string; // Unique identifier (alphanumeric, like tasks)
  name: string;
  description: string;
  status?: "active" | "archived" | "on-hold";
  progress?: number;
  startDate?: Date;
  endDate?: Date;
}

// Centralized project data to ensure consistency across the application
// Using fixed uids for consistency across mock data
export const PROJECTS: MockProject[] = [
  {
    uid: "prjweb001",
    name: "Web Development",
    description: "Main website project with modern design and full functionality",
    status: "active",
    progress: 65,
  },
  {
    uid: "prjmob002",
    name: "Mobile App",
    description: "iOS and Android app development with React Native",
    status: "active",
    progress: 45,
  },
  {
    uid: "prjeco003",
    name: "E-commerce Platform",
    description: "Online store platform with payment integration and inventory management",
    status: "active",
    progress: 30,
  },
  {
    uid: "prjmar004",
    name: "Marketing Campaign",
    description: "Q1 marketing initiatives and brand awareness campaigns",
    status: "active",
    progress: 80,
  },
  {
    uid: "prjinf005",
    name: "Infrastructure Upgrade",
    description: "Server and cloud migration to improve scalability",
    status: "active",
    progress: 55,
  },
];

// Create a map from project UID to project name for quick lookups
export const PROJECT_MAP: Record<string, string> = PROJECTS.reduce(
  (acc, project) => {
    acc[project.uid] = project.name;
    return acc;
  },
  {} as Record<string, string>
);

// Create a map from project UID to full project object
export const PROJECT_BY_UID: Record<string, MockProject> = PROJECTS.reduce(
  (acc, project) => {
    acc[project.uid] = project;
    return acc;
  },
  {} as Record<string, MockProject>
);

// Helper function to get project name by UID
export function getProjectName(projectId: string | undefined): string | undefined {
  if (!projectId) return undefined;
  return PROJECT_MAP[projectId];
}

// Helper function to get full project by UID
export function getProjectById(projectId: string | undefined): MockProject | undefined {
  if (!projectId) return undefined;
  return PROJECT_BY_UID[projectId];
}

// Helper function to check if project UID exists
export function isValidProjectId(projectId: string | undefined): boolean {
  if (!projectId) return false;
  return projectId in PROJECT_BY_UID;
}

