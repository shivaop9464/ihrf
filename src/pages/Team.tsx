import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { TeamMember } from "../types";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "team"), orderBy("position", "asc")), (snap) => {
      setTeam(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
      setLoading(false);
    }, (err) => {
      console.error("Team Snapshot Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-10">
        <div className="text-center mb-20 text-ink">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter mb-6 uppercase text-ink">Patrons & Leadership</h1>
          <p className="text-muted max-w-2xl mx-auto font-medium">
            Guided by the wisdom of legal luminaries and the passion of human rights defenders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {team.map((member, i) => (
            <motion.div
              key={`${member.id || 'new'}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-3xl mb-6 bg-surface/50 border border-border">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-baseline gap-2 mb-1 w-full overflow-hidden">
                <h3 className="text-lg font-extrabold tracking-tight uppercase text-ink truncate shrink-0 max-w-[70%]">{member.name}</h3>
                {member.designation && (
                  <div className="text-[11px] font-bold uppercase tracking-wider text-accent-gold truncate opacity-90">| {member.designation}</div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <div className="text-[11px] font-black uppercase tracking-[0.1em] text-accent">{member.role}</div>
                {member.role2 && (
                  <div className="text-[11px] font-black uppercase tracking-[0.1em] text-[#141414]/30 flex items-center gap-1.5">
                    <span className="text-[10px] opacity-50">/</span> {member.role2}
                  </div>
                )}
                {member.role3 && (
                  <div className="text-[11px] font-black uppercase tracking-[0.1em] text-[#141414]/30 flex items-center gap-1.5">
                    <span className="text-[10px] opacity-50">/</span> {member.role3}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted leading-relaxed font-medium">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


