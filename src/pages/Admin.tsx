import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Search, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  Filter,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Edit2,
  Save,
  X,
  LogOut,
  Mail
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Complaint, TeamMember, GalleryImage, Service } from "../types";
import { cn } from "../lib/utils";
import { auth, handleFirestoreError, OperationType, db } from "../lib/firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocFromServer,
  onSnapshot,
  query, 
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import Logo from "../components/Logo";

type Tab = "dashboard" | "complaints" | "team" | "gallery" | "services";

const ADMIN_EMAIL = "shivakumar8179319464@gmail.com";

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  
  // Data State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editingTeam, setEditingTeam] = useState<Partial<TeamMember> | null>(null);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryImage> | null>(null);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isDbChecking, setIsDbChecking] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: "", password: "" });
    notify("Session terminated", "info");
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === "admin" && loginForm.password === "ihrf123") {
      try {
        const { signInAdminAnonymously } = await import("../lib/firebase");
        await signInAdminAnonymously();
        setIsAuthenticated(true);
        notify("Access Granted", "success");
      } catch (err) {
        setIsAuthenticated(true);
        notify("Local mode active", "info");
      }
    } else {
      notify("Invalid credentials", "error");
    }
  };

  useEffect(() => {
    // Real-time synchronization
    console.log("Initializing real-time data sync...");
    setIsDbChecking(true);

    const unsubComplaints = onSnapshot(collection(db, "complaints"), (snap) => {
      setComplaints(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      setIsDbConnected(true);
    }, (err) => console.error("Complaints sync error:", err));

    const unsubTeam = onSnapshot(query(collection(db, "team"), orderBy("position", "asc")), (snap) => {
      setTeam(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (err) => console.error("Team sync error:", err));

    const unsubGallery = onSnapshot(collection(db, "gallery"), (snap) => {
      setGallery(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    }, (err) => console.error("Gallery sync error:", err));

    const unsubServices = onSnapshot(collection(db, "services"), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      setIsDbChecking(false);
    }, (err) => {
      console.error("Services sync error:", err);
      setIsDbChecking(false);
    });

    checkConnection();

    return () => {
      unsubComplaints();
      unsubTeam();
      unsubGallery();
      unsubServices();
    };
  }, []);

  const checkConnection = async () => {
    setIsDbChecking(true);
    try {
      const testSnap = await getDocs(query(collection(db, "test"), limit(1)));
      setIsDbConnected(true);
    } catch (err: any) {
      if (err.message?.includes("offline") || err.message?.includes("network")) {
        setIsDbConnected(false);
      } else {
        setIsDbConnected(true);
      }
    } finally {
      setIsDbChecking(false);
    }
  };

  const loadData = async () => {
    // No longer strictly needed as we use onSnapshot, but keeping for compatibility if called
    console.log("Data sync is handled via real-time listeners.");
  };


  const handleDeleteComplaintLocal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "complaints", id));
      setComplaints(prev => prev.filter(c => c.id !== id));
      notify("Complaint deleted successfully");
    } catch (err) {
      notify("Error deleting complaint", "error");
      handleFirestoreError(err, OperationType.DELETE, `complaints/${id}`);
    }
  };

  const handleDeleteTeamLocal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "team", id));
      setTeam(prev => prev.filter(m => m.id !== id));
      notify("Team member removed");
    } catch (err) {
      notify("Error deleting team member", "error");
      handleFirestoreError(err, OperationType.DELETE, `team/${id}`);
    }
  };

  const handleDeleteGalleryLocal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "gallery", id));
      setGallery(prev => prev.filter(img => img.id !== id));
      notify("Image removed from gallery");
    } catch (err) {
      notify("Error deleting image", "error");
      handleFirestoreError(err, OperationType.DELETE, `gallery/${id}`);
    }
  };

  const handleDeleteServiceLocal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "services", id));
      setServices(prev => prev.filter(s => s.id !== id));
      notify("Service deleted");
    } catch (err) {
      notify("Error deleting service", "error");
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  const handleSaveTeamLocal = async () => {
    if (!editingTeam) return;
    if (!editingTeam.name || !editingTeam.role) {
      notify("Name and Role are required", "error");
      return;
    }
    const id = editingTeam.id || generateId();
    
    // Sanitize data
    const teamData: any = {
      name: editingTeam.name,
      role: editingTeam.role,
      role2: editingTeam.role2 || "",
      role3: editingTeam.role3 || "",
      designation: editingTeam.designation || "",
      image: editingTeam.image || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
      bio: editingTeam.bio || "",
      position: Number(editingTeam.position) || 99,
      id,
      updatedAt: serverTimestamp()
    };

    if (!editingTeam.id) {
      teamData.createdAt = serverTimestamp();
    }

    console.log("Saving team member:", teamData);
    try {
      await setDoc(doc(db, "team", id), teamData);
      setEditingTeam(null);
      notify("Team member saved successfully");
    } catch (err: any) {
      console.error("Full Save Team Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      notify(`Save failed: ${err.message}`, "error");
      handleFirestoreError(err, OperationType.WRITE, `team/${id}`);
    }
  };

  const handleSaveGalleryLocal = async () => {
    if (!editingGallery) return;
    if (!editingGallery.url) {
      notify("Image URL is required", "error");
      return;
    }
    const id = editingGallery.id || generateId();
    
    const galleryData = {
      url: editingGallery.url,
      caption: editingGallery.caption || "",
      description: editingGallery.description || "",
      id,
      updatedAt: serverTimestamp()
    };

    console.log("Saving gallery item:", galleryData);
    try {
      await setDoc(doc(db, "gallery", id), galleryData);
      setEditingGallery(null);
      notify("Gallery item saved successfully");
    } catch (err: any) {
      console.error("Full Save Gallery Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      notify(`Save failed: ${err.message}`, "error");
      handleFirestoreError(err, OperationType.WRITE, `gallery/${id}`);
    }
  };

  const handleSaveServiceLocal = async () => {
    if (!editingService) return;
    if (!editingService.title || !editingService.description) {
      notify("Title and Description are required", "error");
      return;
    }
    const id = editingService.id || generateId();
    
    const serviceData = {
      title: editingService.title,
      description: editingService.description,
      icon: editingService.icon || "Shield",
      id,
      updatedAt: serverTimestamp()
    };

    console.log("Saving service:", serviceData);
    try {
      await setDoc(doc(db, "services", id), serviceData);
      setEditingService(null);
      notify("Service updated successfully");
    } catch (err: any) {
      console.error("Full Save Service Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      notify(`Save failed: ${err.message}`, "error");
      handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const textToSearch = (c.originalText || "").toLowerCase();
    const categoryToSearch = (c.aiResult?.category || "").toLowerCase();
    const search = (searchTerm || "").toLowerCase();
    
    const matchesSearch = textToSearch.includes(search) || categoryToSearch.includes(search);
    const matchesFilter = filterCategory === "All" || c.aiResult?.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(new Set(complaints.map(c => c.aiResult?.category).filter(Boolean)));
  
  const chartData = categories.length > 0 ? categories.map(cat => ({
    name: cat as string,
    count: complaints.filter(c => c.aiResult?.category === cat).length
  })) : [{ name: "No Complaints", count: 0 }];

  const COLORS = ["#38BDF8", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b"];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#E4E3E0] rounded-[3rem] p-12 shadow-2xl border border-white/10"
        >
          <div className="flex flex-col items-center mb-10">
            <Logo size={64} />
            <h2 className="mt-6 text-3xl font-black uppercase tracking-tighter text-[#141414]">Command Login</h2>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mt-2 text-[#141414]">Access Restricted</p>
          </div>

          <form onSubmit={submitLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-2">Username</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-white border border-[#141414]/5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all text-[#141414]"
                placeholder="Enter Terminal ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-2">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-white border border-[#141414]/5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent transition-all text-[#141414]"
                placeholder="Enter Access Key"
              />
            </div>
            <button
              type="submit"
              className="w-full py-5 rounded-2xl bg-[#141414] text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:brightness-125 transition-all active:scale-[0.98]"
            >
              Initialize Sync
            </button>
          </form>

          <div className="mt-10 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#141414]/30">
            <span>Encrypted Layer v2.4</span>
            <span>Security: Active</span>
          </div>
        </motion.div>
        
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "fixed bottom-10 px-6 py-4 rounded-full shadow-2xl font-black text-[10px] uppercase tracking-widest",
              notification.type === 'error' ? "bg-red-500 text-white" : "bg-accent text-white"
            )}
          >
            {notification.message}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#E4E3E0] font-sans text-[#141414]">
      {/* Sidebar - Technical Grid Style */}
      <aside className="w-72 bg-[#141414] border-r border-[#141414] hidden lg:flex flex-col text-[#E4E3E0] shadow-2xl shrink-0">
        <div className="p-8 border-b border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Logo size={48} variant="light" />
            <div>
              <div className="text-2xl font-black tracking-tighter uppercase leading-none">
                IHRF
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Command & Control</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-2">Navigation</p>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
            { id: "complaints", icon: FileText, label: "Case Audits" },
            { id: "team", icon: Users, label: "Agency Team" },
            { id: "gallery", icon: ImageIcon, label: "Asset Gallery" },
            { id: "services", icon: BarChart3, label: "Service Catalog" }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-[0.2em]",
                activeTab === item.id 
                  ? "bg-[#E4E3E0] text-[#141414] shadow-xl" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-accent" : "text-current opacity-40")} /> 
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center bg-accent/20">
              <Users className="h-4 w-4 text-accent" />
            </div>
            <div className="overflow-hidden text-white">
              <p className="text-[10px] font-black uppercase truncate">System Admin</p>
              <p className="text-[9px] font-bold opacity-40 truncate">IHRF Command Center</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 bg-white border-b border-[#141414]/10 flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-[#141414]">
              {activeTab === "dashboard" && "Ops Overview"}
              {activeTab === "complaints" && "Incident Record System"}
              {activeTab === "team" && "Human Capital"}
              {activeTab === "gallery" && "Visual Assets"}
              {activeTab === "services" && "Programmatic Services"}
            </h1>
            <p className="text-[10px] font-black text-[#141414]/40 uppercase tracking-[0.2em] mt-1">
              Active node: {activeTab}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#141414]/40">Database Link</p>
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", isDbConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                <p className="text-xs font-black text-[#141414]">{isDbConnected ? "SYNCED" : "OFFLINE"}</p>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-[#141414]/10" />
            <div className="bg-[#141414] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Admin Status: Active
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#E4E3E0]/50">
          <div className="max-w-7xl mx-auto space-y-10 pr-4">

          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: "Case Load", value: complaints.length, icon: FileText, color: "blue" },
                  { label: "Active Agents", value: team.length, icon: Users, color: "indigo" },
                  { label: "Service Hooks", value: services.length, icon: BarChart3, color: "rose" },
                  { label: "Media Assets", value: gallery.length, icon: ImageIcon, color: "amber" }
                ].map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={`dash-stat-${stat.label}`}
                    className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "p-3 rounded-2xl transition-colors",
                        stat.color === 'blue' && "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                        stat.color === 'indigo' && "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
                        stat.color === 'rose' && "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
                        stat.color === 'amber' && "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
                      )}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div className="text-[10px] font-black opacity-20 uppercase tracking-widest">Type_0{i+1}</div>
                    </div>
                    <div className="text-4xl font-black tracking-tighter text-[#141414]">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#141414]/40 mt-2">{stat.label}</div>
                    <div className="w-full h-1 bg-[#141414]/5 mt-6 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "60%" }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-10 rounded-3xl border border-border shadow-sm">
                  <h3 className="text-lg font-extrabold mb-8 uppercase tracking-widest text-ink">Category Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                        />
                        <Bar dataKey="count" fill="#0F172A" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-3xl border border-border shadow-sm">
                  <h3 className="text-lg font-extrabold mb-8 uppercase tracking-widest text-ink">Volume by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="count"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "complaints" && (
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="p-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-6">
                <h3 className="text-lg font-extrabold uppercase tracking-widest text-ink">Recent Complaints</h3>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-[#F1F5F9] focus:ring-2 focus:ring-accent outline-none text-sm font-medium"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-border bg-[#F1F5F9] text-sm font-bold outline-none"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] text-[#141414]/40 text-[10px] uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5">Summary</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/5">
                    {filteredComplaints.length > 0 ? filteredComplaints.map((c, i) => (
                      <tr key={`${c.id}-${i}`} className="hover:bg-[#F8FAFC] transition-all group">
                        <td className="px-8 py-5 text-sm font-bold text-[#141414]/60">
                          {new Date(c.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-[#E0F2FE] text-[#0369A1] rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                            {c.aiResult?.category}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-[#141414] max-w-xs truncate">
                          {c.aiResult?.problem_summary}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setSelectedComplaint(c)}
                              className="p-2 text-[#141414]/40 hover:text-accent transition-all"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComplaintLocal(c.id)}
                              className="p-2 text-[#141414]/40 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-muted font-bold">No complaints found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                  onClick={() => setEditingTeam({})}
                  className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:bg-accent transition-all shadow-lg"
                >
                  <Plus className="h-4 w-4" /> Add Member
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {team.map((member, i) => (
                  <div key={`${member.id}-${i}`} className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm flex flex-col sm:flex-row gap-6 relative group overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="h-32 w-32 rounded-2xl object-cover shrink-0"
                    />
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1 gap-2">
                        <div className="flex items-baseline gap-2 overflow-hidden">
                          <h3 className="text-xl font-black tracking-tight uppercase text-[#141414] truncate shrink-0 max-w-[60%]">{member.name}</h3>
                          {member.designation && (
                            <span className="text-accent-gold text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-80">| {member.designation}</span>
                          )}
                        </div>
                        <span className="bg-[#141414]/5 px-2 py-1 rounded text-[9px] font-black uppercase text-[#141414]/40 whitespace-nowrap shrink-0">Pos: {member.position || 0}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                        <p className="text-accent text-[11px] font-black uppercase tracking-[0.1em] leading-tight">{member.role}</p>
                        {member.role2 && (
                          <div className="text-accent text-[11px] font-black uppercase tracking-[0.1em] leading-tight flex items-center gap-1.5">
                            <span className="text-[10px] opacity-30 text-[#141414]">/</span> {member.role2}
                          </div>
                        )}
                        {member.role3 && (
                          <div className="text-accent text-[11px] font-black uppercase tracking-[0.1em] leading-tight flex items-center gap-1.5">
                            <span className="text-[10px] opacity-30 text-[#141414]">/</span> {member.role3}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#141414]/60 font-medium line-clamp-3 mb-6 leading-relaxed">{member.bio || "No profile bio provided."}</p>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setEditingTeam(member)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#141414] rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#E2E8F0] transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit Record
                        </button>
                        <button 
                          onClick={() => handleDeleteTeamLocal(member.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Wipe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {team.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-[#141414]/10 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#141414]/40">No Agency Records Detected</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                  onClick={() => setEditingGallery({})}
                  className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:bg-accent transition-all shadow-lg"
                >
                  <Plus className="h-4 w-4" /> Add Image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gallery.map((img, i) => (
                  <div key={`${img.id}-${i}`} className="bg-white rounded-[2rem] border border-[#141414]/5 shadow-sm overflow-hidden group flex flex-col">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={img.url} 
                        alt={img.caption} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-black uppercase text-[#141414] truncate mb-1">{img.caption}</p>
                        <p className="text-[10px] text-[#141414]/50 font-bold line-clamp-2 mb-6">{img.description || "No description set"}</p>
                      </div>
                      <div className="flex items-center gap-3 pt-6 border-t border-[#141414]/5">
                        <button 
                          onClick={() => setEditingGallery(img)}
                          title="Edit this asset"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F1F5F9] text-[#141414] rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-[#E2E8F0] transition-all"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteGalleryLocal(img.id)}
                          title="Permanently remove from assets"
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {gallery.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-[#141414]/10 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#141414]/40">Visual Database Empty</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                  onClick={() => setEditingService({})}
                  className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:bg-accent transition-all shadow-lg"
                >
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, i) => (
                  <div key={`${service.id}-${i}`} className="bg-white p-6 rounded-3xl border border-[#141414]/5 shadow-sm flex gap-6">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black tracking-tight uppercase text-[#141414] mb-1">{service.title}</h3>
                      <p className="text-xs text-[#141414]/60 font-medium line-clamp-3 mb-6 leading-relaxed">{service.description || "No service description available."}</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setEditingService(service)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#141414] rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#E2E8F0] transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteServiceLocal(service.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-[#141414]/10 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#141414]/40">Service Catalog Unpopulated</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-10 right-10 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm",
              notification.type === 'success' && "bg-[#141414] text-white border border-accent/20",
              notification.type === 'error' && "bg-red-600 text-white shadow-red-500/20",
              notification.type === 'info' && "bg-accent text-white shadow-accent/20"
            )}
          >
            {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 text-accent" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-ink">Complaint Details</h2>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">ID: {selectedComplaint.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="p-3 hover:bg-neutral-100 rounded-2xl transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-8">
                <section>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-3">Original Text</h4>
                  <div className="p-6 bg-bg rounded-2xl text-sm font-medium text-ink leading-relaxed">
                    {selectedComplaint.originalText}
                  </div>
                </section>
                <section className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2">Category</h4>
                    <p className="font-bold text-bg">{selectedComplaint.aiResult?.category || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted mb-2">Rights Violated</h4>
                    <p className="font-bold text-bg">{selectedComplaint.aiResult?.rights_violated || "N/A"}</p>
                  </div>
                </section>
              </div>
              <div className="mt-10 pt-10 border-t border-border flex justify-end">
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="bg-[#141414] text-white px-8 py-3 rounded-xl font-extrabold uppercase tracking-widest hover:bg-accent transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Team Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight mb-8 uppercase text-ink">
                {editingTeam.id ? "Edit Member" : "Add Member"}
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Full Name</label>
                  <input 
                    value={editingTeam.name || ""} 
                    onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Role</label>
                  <input 
                    value={editingTeam.role || ""} 
                    onChange={e => setEditingTeam({...editingTeam, role: e.target.value})}
                    placeholder="Enter professional role"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Role 2 (Optional)</label>
                  <input 
                    value={editingTeam.role2 || ""} 
                    onChange={e => setEditingTeam({...editingTeam, role2: e.target.value})}
                    placeholder="Enter second role"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Role 3 (Optional)</label>
                  <input 
                    value={editingTeam.role3 || ""} 
                    onChange={e => setEditingTeam({...editingTeam, role3: e.target.value})}
                    placeholder="Enter third role"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Designation / Qualifications</label>
                  <input 
                    value={editingTeam.designation || ""} 
                    onChange={e => setEditingTeam({...editingTeam, designation: e.target.value})}
                    placeholder="e.g. MA LLB LLM"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Image URL</label>
                  <input 
                    value={editingTeam.image || ""} 
                    onChange={e => setEditingTeam({...editingTeam, image: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Position Number (Order)</label>
                  <input 
                    type="number"
                    value={editingTeam.position || ""} 
                    onChange={e => setEditingTeam({...editingTeam, position: parseInt(e.target.value)})}
                    placeholder="e.g. 1, 2, 3"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1 text-black">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Bio</label>
                  <textarea 
                    rows={3}
                    value={editingTeam.bio || ""} 
                    onChange={e => setEditingTeam({...editingTeam, bio: e.target.value})}
                    placeholder="Short biography..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-border flex gap-4 bg-slate-50/50">
              <button 
                onClick={() => {
                  setEditingTeam(null);
                  notify("Changes discarded", "info");
                }}
                className="flex-1 border border-border py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:bg-white transition-all text-black"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTeamLocal}
                className="flex-1 bg-accent text-white py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Save className="h-4 w-4" /> Save Member
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gallery Edit Modal */}
      {editingGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight mb-8 uppercase text-ink">
                {editingGallery.id ? "Edit Image" : "Add Image"}
              </h2>
              <div className="space-y-4">
                {editingGallery.url && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-slate-100 mb-4 shadow-inner">
                    <img 
                      src={editingGallery.url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+Image+URL")}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Image URL</label>
                  <input 
                    value={editingGallery.url || ""} 
                    onChange={e => setEditingGallery({...editingGallery, url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Caption (Optional)</label>
                  <input 
                    value={editingGallery.caption || ""} 
                    onChange={e => setEditingGallery({...editingGallery, caption: e.target.value})}
                    placeholder="Brief title for the image"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Description (Optional)</label>
                  <textarea 
                    rows={4}
                    value={editingGallery.description || ""} 
                    onChange={e => setEditingGallery({...editingGallery, description: e.target.value})}
                    placeholder="Detailed information about the event or case..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-border flex gap-4 bg-slate-50/50">
              <button 
                onClick={() => {
                  setEditingGallery(null);
                  notify("Changes discarded", "info");
                }}
                className="flex-1 border border-border py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:bg-white transition-all text-black"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGalleryLocal}
                className="flex-1 bg-accent text-white py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Save className="h-4 w-4" /> Save to Gallery
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Service Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-10 overflow-y-auto custom-scrollbar text-ink flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight mb-8 uppercase text-ink">
                {editingService.id ? "Edit Service" : "Add Service"}
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Title</label>
                  <input 
                    value={editingService.title || ""} 
                    onChange={e => setEditingService({...editingService, title: e.target.value})}
                    placeholder="e.g. Legal Aid Analysis"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Icon Type</label>
                  <select 
                    value={editingService.icon || "Shield"} 
                    onChange={e => setEditingService({...editingService, icon: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black"
                  >
                    <option value="Shield">Shield</option>
                    <option value="FileSearch">Search</option>
                    <option value="ShieldAlert">Alert</option>
                    <option value="Image">Gallery</option>
                    <option value="Scale">Scale</option>
                    <option value="Globe">Globe</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted ml-1">Description</label>
                  <textarea 
                    rows={3}
                    value={editingService.description || ""} 
                    onChange={e => setEditingService({...editingService, description: e.target.value})}
                    placeholder="Brief description of the service..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 focus:ring-2 focus:ring-accent outline-none font-medium text-black resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-border flex gap-4 bg-slate-50/50">
              <button 
                onClick={() => {
                  setEditingService(null);
                  notify("Changes discarded", "info");
                }}
                className="flex-1 border border-border py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:bg-white transition-all text-black"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveServiceLocal}
                className="flex-1 bg-accent text-white py-4 rounded-xl font-extrabold uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
              >
                <Save className="h-4 w-4" /> Save Service
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
