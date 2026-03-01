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
    ChevronRight
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
        { name: "About", href: "#how-it-works" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Contact", href: "#footer" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 scroll-smooth">
            {/* 1. Navbar */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-md py-2 sm:py-3" : "bg-transparent py-3 sm:py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="font-bold text-2xl text-blue-600">SkillBridge</span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex items-center space-x-3 ml-2 lg:ml-4">
                                {user ? (
                                    <Link
                                        to={user.role === 'NGO' || user.role === 'ngo' ? '/ngo-dashboard' : '/volunteer-dashboard'}
                                        className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all whitespace-nowrap"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all whitespace-nowrap"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all whitespace-nowrap"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed inset-0 top-0 left-0 z-40 md:hidden bg-white w-full overflow-y-auto"
                        >
                            <div className="flex justify-end p-4">
                                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                                    <X size={28} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="flex flex-col space-y-6 px-6 pb-8">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-xl font-semibold text-gray-800 py-2 border-b border-gray-100"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="flex flex-col space-y-4 pt-6 mt-4 border-t border-gray-200">
                                    {user ? (
                                        <Link
                                            to={user.role === 'NGO' || user.role === 'ngo' ? '/ngo-dashboard' : '/volunteer-dashboard'}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full py-3 text-center text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="w-full py-3 text-center text-lg font-bold text-blue-600 border border-blue-600 rounded-xl"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="w-full py-3 text-center text-lg font-bold text-white bg-blue-600 rounded-xl shadow-lg"
                                            >
                                                Get Started
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
            <section className="relative pt-24 sm:pt-32 lg:pt-48 pb-16 sm:pb-20 lg:pb-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left"
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-6">
                                Bridging Skills with <span className="text-blue-600">Purpose</span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Connect volunteers with NGOs and create real-world impact. Unlock your potential and contribute to projects that matter.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                                <Link to="/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-bold rounded-xl text-base sm:text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
                                    Get Started <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-800 font-bold border border-gray-200 rounded-xl text-base sm:text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Login to Account <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative mt-8 lg:mt-0 max-w-md mx-auto lg:max-w-none"
                        >
                            <div className="w-full aspect-square bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                    <Users size={120} className="sm:w-[150px] sm:h-[150px] lg:w-[200px] lg:h-[200px] text-blue-600" />
                                </div>
                                {/* Visual elements representing volunteering */}
                                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6 animate-float">
                                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base">SB</div>
                                        <div className="flex-1">
                                            <div className="h-1.5 sm:h-2 w-16 sm:w-20 lg:w-24 bg-gray-200 rounded animate-pulse mb-1 sm:mb-2"></div>
                                            <div className="h-1.5 sm:h-2 w-12 sm:w-14 lg:w-16 bg-gray-100 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                                        <div className="h-1.5 sm:h-2 w-full bg-gray-100 rounded"></div>
                                        <div className="h-1.5 sm:h-2 w-full bg-gray-100 rounded"></div>
                                        <div className="h-1.5 sm:h-2 w-2/3 bg-gray-50 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-600/10 blur-3xl rounded-full"></div>
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-indigo-600/10 blur-3xl rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. How It Works Section */}
            <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-12 lg:mb-16">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">How It Works</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">Three simple steps to start making an impact in your community.</p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                    {[
                        {
                            icon: <Layout className="text-blue-600" size={32} />,
                            title: "Create Profile",
                            desc: "Sign up and build your profile. Share your skills, interests, and availability."
                        },
                        {
                            icon: <Users className="text-blue-600" size={32} />,
                            title: "Find Opportunities",
                            desc: "Browse through hundreds of volunteering opportunities posted by NGOs worldwide."
                        },
                        {
                            icon: <CheckCircle className="text-blue-600" size={32} />,
                            title: "Make Impact",
                            desc: "Connect with organizations, contribute your expertise, and see your impact Grow!"
                        },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-100 transition-all text-center group"
                        >
                            <div className="mb-4 sm:mb-5 lg:mb-6 flex justify-center transform group-hover:scale-110 transition-transform">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center">
                                    {React.cloneElement(item.icon, {
                                        size: window.innerWidth < 640 ? 28 : window.innerWidth < 1024 ? 32 : 40
                                    })}
                                </div>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">{item.title}</h3>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 4. Features Section */}
            <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 lg:mb-16">
                    <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Platform Features</h2>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600">Everything you need to manage volunteering and social impact projects efficiently.</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {[
                        {
                            icon: <Zap size={20} />,
                            title: "Smart Skill Matching",
                            desc: "Our algorithm connects you with projects that perfectly match your expertise."
                        },
                        {
                            icon: <ShieldCheck size={20} />,
                            title: "Secure Registration",
                            desc: "Verified profiles for both volunteers and NGOs to ensure a safe community."
                        },
                        {
                            icon: <BarChart3 size={20} />,
                            title: "Real-time Updates",
                            desc: "Stay informed with instant notifications about project applications and milestones."
                        },
                        {
                            icon: <Layout size={20} />,
                            title: "NGO Dashboard",
                            desc: "Powerful tools for organizations to manage volunteers and track project progress."
                        },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-lg group">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {feature.icon}
                            </div>
                            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Impact Section (Stats) */}
            <section className="py-16 sm:py-20 lg:py-24 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12 text-center">
                        {[
                            { label: "Volunteers", value: "500+" },
                            { label: "NGOs Joined", value: "100+" },
                            { label: "Projects Completed", value: "1000+" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-black text-blue-600 mb-2 sm:mb-3 lg:mb-4">{stat.value}</div>
                                <div className="text-xs sm:text-sm lg:text-base font-semibold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Call To Action Section */}
            <section className="py-16 sm:py-20 lg:py-24 xl:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-r from-blue-700 to-indigo-800 p-6 sm:p-8 lg:p-12 xl:p-24 overflow-hidden text-center text-white shadow-2xl">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 opacity-10">
                            <Globe size={200} className="sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px]" />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 text-white leading-tight">Ready to Make a Difference?</h2>
                            <p className="text-sm sm:text-base lg:text-xl text-blue-50 mb-6 sm:mb-8 lg:mb-12 italic opacity-90 px-4">
                                "Join SkillBridge today and start your journey towards creating social impact with your unique skills."
                            </p>
                            <Link to="/register" className="inline-block px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-white text-blue-700 font-black rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-xl hover:bg-gray-50 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                Join SkillBridge Today
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Footer */}
            <footer id="footer" className="bg-white pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-10 lg:pb-12 overflow-hidden border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
                    <div className="text-center sm:text-left">
                        <Link to="/" className="mb-4 sm:mb-6 lg:mb-8 block">
                            <span className="font-bold text-2xl text-blue-600">SkillBridge</span>
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                            Bridging the gap between talented volunteers and NGOs to foster meaningful change in our communities.
                        </p>
                    </div>

                    <div className="text-center sm:text-left">
                        <h5 className="font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 uppercase tracking-widest text-xs">Quick Links</h5>
                        <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                            <li><a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors">Home</a></li>
                            <li><a href="#how-it-works" className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors">Services</a></li>
                            <li><a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors">Testimonials</a></li>
                        </ul>
                    </div>

                    <div className="text-center sm:text-left">
                        <h5 className="font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 uppercase tracking-widest text-xs">Contact Info</h5>
                        <ul className="space-y-2 sm:space-y-3 lg:space-y-4 text-gray-500">
                            <li className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-sm">
                                <Mail size={14} className="sm:w-4 sm:h-4" /> contact@skillbridge.org
                            </li>
                            <li className="flex items-start gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-sm">
                                <Globe size={14} className="mt-0.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span>123 Impact Way, Social Hub, Tech City</span>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center sm:text-left">
                        <h5 className="font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 uppercase tracking-widest text-xs">Follow Us</h5>
                        <div className="flex space-x-3 sm:space-x-4 justify-center sm:justify-start">
                            {[1, 2, 3, 4].map(i => (
                                <a key={i} href="#" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <span className="sr-only">Social Link {i}</span>
                                    <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 bg-current rounded-sm"></div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-7 lg:pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-gray-400 text-xs sm:text-sm gap-3 sm:gap-4 text-center">
                    <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
                    <div className="flex space-x-4 sm:space-x-6">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                    </div>
                </div>
            </footer>

            {/* Global Animations for components */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (min-width: 768px) {
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}} />
        </div>
    );
};

export default LandingPage;
