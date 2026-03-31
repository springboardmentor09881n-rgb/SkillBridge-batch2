import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
    Menu,
    X,
    CheckCircle,
    Users,
    ShieldCheck,
    Zap,
    Layout,
    BarChart3,
    Mail,
    Globe,
    ArrowRight,
    ChevronRight,
    Heart,
    Star
} from "lucide-react";

const LandingPage = () => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "#" },
        { name: "About", href: "#about" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Contact", href: "#footer" },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-[#1e293b] scroll-smooth selection:bg-blue-100 selection:text-blue-700">
            {/* 1. Navbar */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-3" : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                                <Zap size={22} className="text-white fill-current" />
                            </div>
                            <span className="font-black text-2xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">SkillBridge</span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center space-x-10">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-[15px] font-semibold text-slate-600 hover:text-blue-600 transition-all relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            ))}
                            <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
                                {user ? (
                                    <Link
                                        to={user.role === 'NGO' ? '/ngo-dashboard' : '/volunteer-dashboard'}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        Dashboard <ArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="px-5 py-2.5 text-[15px] font-bold text-slate-700 hover:text-blue-600 transition-all"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="px-6 py-2.5 text-[15px] font-bold text-white bg-slate-900 rounded-xl hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all active:scale-95"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="p-2.5 bg-slate-100 rounded-xl text-slate-600 active:scale-90 transition-all"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Overly Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 md:hidden shadow-2xl"
                        >
                            <div className="flex flex-col space-y-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-bold text-slate-800 p-2 hover:bg-slate-50 rounded-lg transition-all"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                                    {user ? (
                                        <Link
                                            to={user.role === 'NGO' ? '/ngo-dashboard' : '/volunteer-dashboard'}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="col-span-2 py-4 text-center text-lg font-bold text-white bg-blue-600 rounded-2xl shadow-xl shadow-blue-100"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="py-4 text-center text-lg font-bold text-slate-700 bg-slate-50 rounded-2xl"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="py-4 text-center text-lg font-bold text-white bg-blue-600 rounded-2xl shadow-xl shadow-blue-100"
                                            >
                                                Register
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* 2. Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-blue-50/50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-indigo-50/50 rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8"
                            >
                                <Star size={16} className="fill-current" />
                                <span>The #1 Platform for Social Impact</span>
                            </motion.div>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight"
                            >
                                Bridging Skills with <span className="text-blue-600 relative inline-block">Purpose <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-100 -z-10 rounded-full"></div></span>
                            </motion.h1>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
                            >
                                Connect with inspiring NGOs and contribute your professional expertise to projects that truly matter. Transform communities while growing your own potential.
                            </motion.p>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <Link to="/register" className="group px-8 py-5 bg-blue-600 text-white font-black rounded-2xl text-lg hover:bg-blue-700 shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95">
                                    Join as Volunteer <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-5 bg-white text-slate-900 font-bold border-2 border-slate-100 rounded-2xl text-lg hover:border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    Login to Account
                                </Link>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-12 flex items-center justify-center lg:justify-start gap-3 sm:gap-6"
                            >
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-bold text-slate-500">
                                    <span className="text-slate-900">500+ professionals</span> already joined
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="flex-1 relative w-full max-w-2xl"
                        >
                            <div className="relative group perspective-1000">
                                <div className="relative z-10 w-full aspect-[4/3] bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[2.5rem] shadow-[0_50px_100px_rgba(15,23,42,0.3)] overflow-hidden border border-slate-700/50">
                                    <div className="absolute top-0 left-0 w-full h-full opacity-30 flex items-center justify-center">
                                        <Users size={120} className="text-blue-500" />
                                    </div>
                                    
                                    {/* Abstract Interface elements */}
                                    <div className="absolute top-10 left-10 right-10 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-float">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">SB</div>
                                            <div className="flex-1">
                                                <div className="h-2 w-32 bg-slate-500/50 rounded-full mb-2"></div>
                                                <div className="h-2 w-20 bg-slate-600/30 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-2.5 w-full bg-slate-600/40 rounded-full"></div>
                                            <div className="h-2.5 w-full bg-slate-600/40 rounded-full"></div>
                                            <div className="h-2.5 w-2/3 bg-slate-700/20 rounded-full"></div>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <div className="px-6 py-2 bg-blue-600 rounded-lg text-xs font-bold text-white shadow-xl">Apply Now</div>
                                        </div>
                                    </div>

                                    {/* floating element 2 */}
                                    <div className="absolute bottom-10 -right-4 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex items-center gap-3 animate-float animation-delay-2000">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Heart size={20} className="text-green-600 fill-current" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Impact Score</div>
                                            <div className="text-lg font-black text-slate-800">98.5%</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Background glow elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. How It Works - Reimagined */}
            <section id="how-it-works" className="py-24 sm:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">Ecosystem of Impact</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">We've built a seamless cycle where professional growth drives community development.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
                        {[
                            {
                                num: "01",
                                icon: <Layout className="text-blue-600" size={32} />,
                                title: "Create Your ID",
                                desc: "Share your professional expertise and social interests to build your impact identity."
                            },
                            {
                                num: "02",
                                icon: <Users className="text-blue-600" size={32} />,
                                title: "Smart Matching",
                                desc: "Our platform highlights the perfect NGOs needing precisely your type of expertise."
                            },
                            {
                                num: "03",
                                icon: <CheckCircle className="text-blue-600" size={32} />,
                                title: "Direct Impact",
                                desc: "Collaborate directly with NGO leaders and witness the real-world results of your work."
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute -top-8 -left-2 text-7xl font-black text-slate-200/50 group-hover:text-blue-100 transition-colors duration-500">{item.num}</div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 mb-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Features Section - Premium Grid */}
            <section id="about" className="py-24 sm:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-8 leading-tight">Empowering both sides of the <span className="text-blue-600">bridge</span></h2>
                            <p className="text-lg text-slate-600 mb-12 font-medium leading-relaxed">Whether you are an NGO looking for specialized help or a professional looking to give back, our platform provides the high-end tools you need.</p>
                            
                            <div className="space-y-6">
                                {[
                                    { t: "Verified NGO Community", d: "Every organization is vetted for authentic local impact." },
                                    { t: "Specialized Skill Matching", d: "No more generic volunteering. Do what you do best." },
                                    { t: "Project Milestones", d: "Track progress and transparency from start to finish." }
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                                            <CheckCircle size={14} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{f.t}</h4>
                                            <p className="text-sm text-slate-600 font-medium">{f.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {[
                                { icon: <Zap />, title: "Smart Matches" },
                                { icon: <ShieldCheck />, title: "Verified NGOs" },
                                { icon: <BarChart3 />, title: "Analytics" },
                                { icon: <Mail />, title: "Messenger" }
                            ].map((box, i) => (
                                <div key={i} className={`p-8 rounded-3xl border-2 transition-all duration-300 ${i === 1 ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-slate-50 border-slate-50 hover:border-blue-200'} ${i % 2 !== 0 ? 'translate-y-8' : ''}`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${i === 1 ? 'bg-blue-600' : 'bg-blue-100 text-blue-600'}`}>{box.icon}</div>
                                    <h5 className="font-black text-lg mb-2">{box.title}</h5>
                                    <p className={`text-xs opacity-70 font-bold uppercase tracking-widest`}>Feature {i+1}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. High Energy CTA */}
            <section className="py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-[3rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 sm:p-16 lg:p-32 overflow-hidden text-center group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                            <Globe size={300} />
                        </div>
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-10 leading-[1.1] tracking-tight">Ready to impact lives through <span className="text-blue-300">your skills?</span></h2>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Link to="/register" className="px-12 py-6 bg-white text-blue-700 font-black rounded-2xl text-xl hover:bg-slate-50 shadow-2xl transition-all active:scale-95">
                                    Join SkillBridge Now
                                </Link>
                                <div className="text-white/80 font-bold flex items-center gap-2">
                                    <CheckCircle size={20} className="text-blue-300" />
                                    100% Free for Volunteers
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Footer - Modern & Clean */}
            <footer id="footer" className="bg-slate-900 pt-24 pb-12 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 pb-20 border-b border-white/5">
                        <div className="space-y-8">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Zap size={16} className="text-white fill-current" />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-white">SkillBridge</span>
                            </Link>
                            <p className="text-sm font-medium leading-relaxed max-w-xs">Connecting specialized talent with nonprofit missions to accelerate global social progress.</p>
                        </div>

                        <div>
                            <h5 className="font-black text-white text-xs uppercase tracking-widest mb-8">Platform</h5>
                            <ul className="space-y-4 text-sm font-bold">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">For Volunteers</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">For NGOs</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">How it Works</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-black text-white text-xs uppercase tracking-widest mb-8">Resources</h5>
                            <ul className="space-y-4 text-sm font-bold">
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Impact Stories</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-black text-white text-xs uppercase tracking-widest mb-8">Updates</h5>
                            <p className="text-xs font-bold mb-6">Get notified about new high-impact roles.</p>
                            <form className="flex gap-2">
                                <input type="email" placeholder="Your Email" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:border-blue-500 transition-colors" />
                                <button type="submit" className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><ChevronRight /></button>
                            </form>
                        </div>
                    </div>

                    <div className="pt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#475569]">© {new Date().getFullYear()} SKILLBRIDGE PLATFORM. CRAFTED FOR IMPACT.</p>
                        <div className="flex space-x-8 text-[11px] font-black uppercase tracking-widest">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}} />
        </div>
    );
};

export default LandingPage;
