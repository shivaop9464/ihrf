import { Complaint, TeamMember, GalleryImage, Service } from "../types";

const KEYS = {
  COMPLAINTS: "civis_complaints",
  TEAM: "civis_team",
  GALLERY: "civis_gallery",
  SERVICES: "civis_services",
};

// Seed data
const defaultTeam: TeamMember[] = [
  {
    id: "1",
    name: "Hon'ble Chief Justice (Retd)",
    role: "Chief Patron",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
    bio: "Guiding our legal strategy with decades of experience in the highest courts.",
    position: 1
  },
  {
    id: "2",
    name: "Hon'ble Justice (Retd)",
    role: "Chairman",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
    bio: "Leading our mission to protect and preserve human rights across the nation.",
    position: 2
  }
];

const defaultGallery: GalleryImage[] = [];

const defaultServices: Service[] = [
  {
    id: "1",
    title: "Legal Advocacy",
    description: "Providing legal assistance and advocacy for victims of human rights violations.",
    icon: "Scale"
  },
  {
    id: "2",
    title: "Public Awareness",
    description: "Conducting campaigns and rallies to educate the public about their fundamental rights.",
    icon: "Globe"
  },
  {
    id: "3",
    title: "Research & Reporting",
    description: "Documenting violations and publishing comprehensive reports to demand accountability.",
    icon: "FileSearch"
  },
  {
    id: "4",
    title: "Community Support",
    description: "Grassroots mobilization and direct support for vulnerable communities in need.",
    icon: "Users"
  },
  {
    id: "5",
    title: "Human Rights Education",
    description: "Workshops and training programs for students and professionals on human rights law.",
    icon: "Shield"
  }
];

// Helper to get from localstorage
const getLocal = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Helper to save to localstorage
const saveLocal = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const dataService = {
  // Complaints
  getComplaints: (): Complaint[] => getLocal(KEYS.COMPLAINTS, []),
  saveComplaint: (complaint: Complaint) => {
    const list = dataService.getComplaints();
    saveLocal(KEYS.COMPLAINTS, [complaint, ...list]);
  },
  deleteComplaint: (id: string) => {
    const list = dataService.getComplaints().filter(c => c.id !== id);
    saveLocal(KEYS.COMPLAINTS, list);
  },

  // Team
  getTeam: (): TeamMember[] => getLocal(KEYS.TEAM, defaultTeam),
  saveTeamMember: (member: TeamMember) => {
    const list = dataService.getTeam();
    const index = list.findIndex(m => m.id === member.id);
    if (index > -1) {
      list[index] = member;
      saveLocal(KEYS.TEAM, list);
    } else {
      saveLocal(KEYS.TEAM, [...list, member]);
    }
  },
  deleteTeamMember: (id: string) => {
    const list = dataService.getTeam().filter(m => m.id !== id);
    saveLocal(KEYS.TEAM, list);
  },

  // Gallery
  getGallery: (): GalleryImage[] => getLocal(KEYS.GALLERY, defaultGallery),
  saveGalleryImage: (image: GalleryImage) => {
    const list = dataService.getGallery();
    const index = list.findIndex(img => img.id === image.id);
    if (index > -1) {
      list[index] = image;
      saveLocal(KEYS.GALLERY, list);
    } else {
      saveLocal(KEYS.GALLERY, [...list, image]);
    }
  },
  deleteGalleryImage: (id: string) => {
    const list = dataService.getGallery().filter(img => img.id !== id);
    saveLocal(KEYS.GALLERY, list);
  },

  // Services
  getServices: (): Service[] => getLocal(KEYS.SERVICES, defaultServices),
  saveService: (service: Service) => {
    const list = dataService.getServices();
    const index = list.findIndex(s => s.id === service.id);
    if (index > -1) {
      list[index] = service;
      saveLocal(KEYS.SERVICES, list);
    } else {
      saveLocal(KEYS.SERVICES, [...list, service]);
    }
  },
  deleteService: (id: string) => {
    const list = dataService.getServices().filter(s => s.id !== id);
    saveLocal(KEYS.SERVICES, list);
  }
};
