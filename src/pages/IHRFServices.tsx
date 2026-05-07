import { motion } from "motion/react";
import { 
  Scale, 
  Globe, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  GraduationCap, 
  UserPlus, 
  Baby, 
  Award, 
  ArrowRight,
  Target,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Human Rights Protection",
    description: "Monitoring, documenting, and reporting human rights violations to international bodies to ensure accountability and justice for the marginalized.",
    icon: ShieldCheck,
    color: "bg-blue-600"
  },
  {
    title: "Legal Aid & Awareness",
    description: "Providing free legal consultation and assistance to victims who cannot afford representation, while educating communities on their constitutional rights.",
    icon: Scale,
    color: "bg-blue-700"
  },
  {
    title: "Women Empowerment",
    description: "Programs focused on gender equality, financial independence, and protecting women against systemic violence and discrimination.",
    icon: Award,
    color: "bg-amber-600"
  },
  {
    title: "Child Welfare & Protection",
    description: "Dedicated initiatives to combat child labor, ensure access to quality education, and provide safe environments for at-risk youth.",
    icon: Baby,
    color: "bg-blue-800"
  },
  {
    title: "Humanitarian Relief",
    description: "Immediate social welfare and emergency response during natural disasters, conflicts, and socio-economic crises.",
    icon: HeartHandshake,
    color: "bg-amber-500"
  },
  {
    title: "Education Campaigns",
    description: "Strategic awareness programs in schools and rural areas to foster a culture of human rights and civic responsibility.",
    icon: GraduationCap,
    color: "bg-blue-500"
  },
  {
    title: "Youth Leadership",
    description: "Training the next generation of global leaders through volunteer programs, mentorship, and advocacy workshops.",
    icon: UserPlus,
    color: "bg-blue-900"
  },
  {
    title: "International Advocacy",
    description: "Collaborating with global NGOs and the United Nations to influence policy changes and promote cross-border humanitarian justice.",
    icon: Globe,
    color: "bg-amber-700"
  },
  {
    title: "Community Development",
    description: "Grassroots projects aimed at sustainable infrastructure, clean water access, and healthcare in underserved regions.",
    icon: Users,
    color: "bg-indigo-600"
  },
  {
    title: "Anti-Corruption Advocacy",
    description: "Promoting transparency and accountability within legal and governmental structures to protect citizen interests.",
    icon: Target,
    color: "bg-red-600"
  },
  {
    title: "Environmental Justice",
    description: "Defending the right to a healthy environment and advocating for sustainable policies that protect vulnerable ecosystems.",
    icon: Globe,
    color: "bg-green-600"
  }
];

const stats = [
  { label: "Cases Resolved", value: "12k+" },
  { label: "Lives Impacted", value: "500k+" },
  { label: "Countries Active", value: "45+" },
  { label: "Volunteers", value: "85k+" }
];

export default function IHRFServices() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" 
            alt="Humanitarian action" 
            className="w-full h-full object-cover grayscale brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
              Global Humanitarian Mission
            </span>
            <h1 className="text-5xl md:text-8xl font-bold text-white leading-[0.9] tracking-tighter mb-8 uppercase">
              Our Services for <br />
              <span className="text-amber-500">Humanity.</span>
            </h1>
            <p className="text-xl text-blue-100/80 font-medium mb-10 leading-relaxed">
              We stand as a global pillar for justice, providing specialized support and protection for those whose voices are often unheard.
            </p>
            <div className="flex gap-4">
              <Link to="/contact" className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-amber-500 hover:text-white transition-all shadow-xl">
                Partner With Us
              </Link>
              <Link to="/analysis" className="bg-blue-600/30 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">
                Use AI Case Analysis
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-blue-900 mb-8 tracking-tighter uppercase leading-[1.1]">
                A Comprehensive Approach to <br />
                <span className="text-amber-600">Global Justice.</span>
              </h2>
              <p className="text-lg text-neutral-600 font-medium leading-relaxed mb-6">
                IHRF – International Human Rights Federation operates at the intersection of legal expertise, humanitarian relief, and grassroots advocacy. Our services are designed to address both the immediate symptoms and the systemic causes of human rights abuses.
              </p>
              <p className="text-neutral-500 font-medium italic">
                "Our mission is not just to observe, but to intervene. Every program we launch is a direct response to the needs of the communities we serve."
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-blue-50 rounded-[3rem] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop" 
                  alt="Humanitarian hand shake" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-amber-500 p-10 rounded-[2.5rem] shadow-2xl text-white hidden md:block">
                <p className="text-4xl font-bold mb-1 tracking-tighter">45+</p>
                <p className="text-xs uppercase font-extrabold tracking-widest opacity-80">Nations Reached</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-24">
            <span className="text-blue-600 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Our Pillars</span>
            <h2 className="text-5xl md:text-7xl font-bold text-blue-900 tracking-tighter uppercase">Professional Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white p-10 rounded-[2.5rem] border border-neutral-200 hover:border-amber-500 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4 uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-neutral-500 font-medium leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-8 pt-8 border-t border-neutral-100">
                  <Link to="/contact" className="text-blue-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    Inquire More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-800/50 p-12 rounded-[3rem] border border-white/10"
            >
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-8">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold mb-6 tracking-tighter uppercase">Our Mission</h3>
              <p className="text-blue-100/70 text-lg leading-relaxed font-medium">
                To protect and preserve the fundamental human rights of every individual through legal, social, and direct humanitarian action, creating a world where dignity is universal.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-blue-800/50 p-12 rounded-[3rem] border border-white/10"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-8">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold mb-6 tracking-tighter uppercase">Our Vision</h3>
              <p className="text-blue-100/70 text-lg leading-relaxed font-medium">
                A global landscape where human rights are not just legal concepts, but a lived reality for all, regardless of race, gender, or social standing.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-blue-900 tracking-tighter mb-2">{stat.value}</div>
                <div className="text-xs uppercase font-extrabold tracking-[0.2em] text-amber-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -ml-48 -mb-48" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter uppercase">
                Stand With Us for <br className="hidden md:block" />
                <span className="text-amber-500">Human Rights.</span>
              </h2>
              <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-12 font-medium">
                Whether you need assistance, want to volunteer, or wish to contribute to our mission, your involvement makes a difference.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link to="/contact" className="bg-amber-500 text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-amber-500/20">
                  Contact Our Team
                </Link>
                <Link to="/contact" className="bg-white text-blue-900 px-10 py-5 rounded-full font-bold hover:bg-neutral-100 transition-all">
                  Join As Volunteer
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
