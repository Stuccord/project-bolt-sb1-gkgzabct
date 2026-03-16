import React, { useState, useEffect } from 'react';
import { Shield, Heart, TrendingUp, Users, FileCheck, Phone, Mail, MapPin, CheckCircle, ArrowRight, Menu, X, Clock, Award, Headphones, Star, DollarSign, Briefcase, Activity, Calendar } from 'lucide-react';
import AppointmentModal from '../components/AppointmentModal';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { user, agent } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const stats = [
    { icon: Users, value: '200+', label: 'Clients Helped', color: 'from-purple-500 to-indigo-500' },
    { icon: DollarSign, value: 'GHC 2M+', label: 'Claims Secured', color: 'from-green-500 to-emerald-500' },
    { icon: Clock, value: '90 Days', label: 'Avg. Processing', color: 'from-blue-500 to-cyan-500' },
    { icon: Star, value: '4.9/5', label: 'Client Rating', color: 'from-yellow-500 to-purple-500' },
  ];

  const testimonials = [
    {
      name: 'Yovi',
      location: 'Accident Victim, Accra',
      text: "I didn't even know insurance could pay for my treatment. A doctor at the hospital referred me to BearGuard, and they handled everything. I'm so grateful!",
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'Abraham',
      location: 'Recovered Patient, Kumasi',
      text: "I had no money for surgery after my accident. Within weeks, BearGuard secured my compensation and I got the treatment I needed. They saved my life.",
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Jonathan',
      location: 'Satisfied Client, Takoradi',
      text: "The insurance company delayed me for over a year. BearGuard stepped in with their expertise, and within a week, I was paid. Incredible service!",
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Seraphine',
      location: 'Grateful Client, Tamale',
      text: "The police stressed me for a report, and I couldn't afford a medical report. BearGuard handled all of that and more. God bless them!",
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-slate-950 shadow-lg transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center cursor-pointer group" onClick={() => scrollToSection('home')}>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight transition-all duration-300 group-hover:text-purple-500">
                  Bear<span className="text-purple-500 group-hover:text-white">Guard</span>
                </span>
                <span className="text-xs sm:text-sm text-gray-400 tracking-wider uppercase font-medium">Support Services</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-purple-500 transition-colors duration-200 font-semibold text-base relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-purple-500 transition-colors duration-200 font-semibold text-base relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-300 hover:text-purple-500 transition-colors duration-200 font-semibold text-base relative group">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('why-us')} className="text-gray-300 hover:text-purple-500 transition-colors duration-200 font-semibold text-base relative group">
                Why Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-purple-500 transition-colors duration-200 font-semibold text-base relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              {user && agent ? (
                <button onClick={() => onNavigate(agent.role === 'admin' ? 'admin-dashboard' : agent.role === 'manager' ? 'manager-dashboard' : 'referral-dashboard')} className="ml-4 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold text-base">
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => onNavigate('login')} className="ml-4 px-5 py-2 text-gray-300 hover:text-white font-semibold transition-colors duration-200 text-base border border-gray-600 hover:border-gray-500 rounded-lg">
                    Login
                  </button>
                  <button onClick={() => onNavigate('signup')} className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-semibold text-base">
                    Join Network
                  </button>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2.5 hover:bg-slate-800 rounded-lg transition-colors duration-200">
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-300" /> : <Menu className="w-6 h-6 text-gray-300" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 shadow-xl">
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-purple-500 rounded-lg text-base transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-purple-500 rounded-lg text-base transition-colors">About</button>
              <button onClick={() => scrollToSection('services')} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-purple-500 rounded-lg text-base transition-colors">Services</button>
              <button onClick={() => scrollToSection('why-us')} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-purple-500 rounded-lg text-base transition-colors">Why Us</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-purple-500 rounded-lg text-base transition-colors">Contact</button>
              {user && agent ? (
                <button onClick={() => onNavigate(agent.role === 'admin' ? 'admin-dashboard' : agent.role === 'manager' ? 'manager-dashboard' : 'referral-dashboard')} className="block w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-base transition-colors">Go to Dashboard</button>
              ) : (
                <>
                  <button onClick={() => onNavigate('login')} className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg font-semibold text-base transition-colors border border-gray-700">Login</button>
                  <button onClick={() => onNavigate('signup')} className="block w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold text-base transition-colors">Join Network</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/20"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                <Shield className="w-4 h-4" />
                <span>Trusted Claims Partner Since 2020</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                <span className="block text-gray-900">Had an Accident?</span>
                <span className="block mt-4 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
                  We Fight For You
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-light">
                Get the insurance compensation you deserve—fast, stress-free, and hassle-free. We handle everything.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setAppointmentModalOpen(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 font-bold text-lg flex items-center justify-center space-x-2 transform hover:scale-105"
                >
                  <Calendar className="w-6 h-6" />
                  <span>Book Free Consultation</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-500 rounded-xl hover:bg-purple-50 transition-all duration-300 shadow-lg font-bold text-lg transform hover:scale-105"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="/WhatsApp Image 2025-11-21 at 14.53.38_237cc202.jpg"
                  alt="Professional consultation and support"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-xl`}>
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-orange-100 text-lg font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-6 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">No Upfront Costs</h3>
                <p className="text-gray-600">Pay only after receiving compensation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Expert Team</h3>
                <p className="text-gray-600">Trained professionals nationwide</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">24/7 Support</h3>
                <p className="text-gray-600">Always here when you need us</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-6">
              WHO WE ARE
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">About BearGuard</h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
              Ghana's leading accident claims facilitation and advocacy agency
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <img
                src="/WhatsApp Image 2025-11-21 at 14.53.39_4041563b.jpg"
                alt="Professional ready to assist with insurance claims"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-gray-900">Who We Are</h3>
              <p className="text-xl text-gray-700 leading-relaxed">
                BearGuard Support Services is Ghana's premier accident claims facilitation and advocacy agency. We're dedicated to helping road accident victims secure fair and timely insurance compensation.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                With a growing network of hospital partners, legal experts, and field representatives across Ghana, we step in as your shield—protecting your rights and ensuring no victim struggles alone.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  'Founded on integrity, care, and results',
                  'Nationwide hospital and legal network',
                  'Proven track record of successful claims',
                  'Compassionate and professional service'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <CheckCircle className="w-7 h-7 text-orange-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    <p className="text-lg text-gray-700 group-hover:text-orange-600 transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="relative group overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 p-10 rounded-3xl text-white shadow-2xl hover:shadow-orange-300 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <Shield className="w-12 h-12 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
                <p className="text-xl text-orange-50 leading-relaxed">
                  To deliver fast, reliable, and compassionate support to accident victims by simplifying insurance claims, promoting fairness, and guiding clients back to stability.
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 p-10 rounded-3xl text-white shadow-2xl hover:shadow-blue-300 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <Heart className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
                <p className="text-xl text-blue-50 leading-relaxed">
                  A Ghana where every accident victim receives the compensation and support they deserve—without stress, delay, or intimidation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6">
              OUR SERVICES
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">What We Do</h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
              Comprehensive end-to-end accident claims support tailored to Ghana's insurance landscape
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { icon: FileCheck, title: 'Insurance Claims Processing', desc: 'Complete assistance with all paperwork, documentation, and submissions', color: 'orange' },
              { icon: Shield, title: 'Police Reports Coordination', desc: 'We handle all communication and follow-ups with law enforcement', color: 'blue' },
              { icon: Heart, title: 'Medical Reports Facilitation', desc: 'Fast-track your medical documentation through our hospital network', color: 'green' },
              { icon: TrendingUp, title: 'Claim Calculations', desc: 'Expert guidance to maximize your rightful compensation amount', color: 'purple' },
              { icon: Users, title: 'Insurance Follow-ups', desc: 'Persistent advocacy until you receive what you deserve', color: 'yellow' },
              { icon: Activity, title: 'Recovery Support', desc: 'Emotional, financial, and physical recovery guidance', color: 'red' }
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-orange-200 transform hover:-translate-y-2">
                  <div className={`w-20 h-20 bg-${service.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-10 h-10 text-${service.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">{service.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{service.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-700 to-orange-600 p-12 rounded-3xl shadow-2xl text-center text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <p className="text-3xl font-bold relative">
              Whether you're a pedestrian, passenger, driver, or motor rider—BearGuard fights for you
            </p>
          </div>
        </div>
      </section>

      <section id="why-us" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6">
              WHY CHOOSE US
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Why Choose BearGuard</h2>
            <p className="text-2xl text-gray-600">The trusted choice for accident victims across Ghana</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-blue-600 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <img
                src="/WhatsApp Image 2025-11-21 at 14.53.39_d63d639e.jpg"
                alt="Client receiving support and guidance"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="space-y-6">
              {[
                { title: 'Fast & Stress-Free Claims', desc: 'We expedite the entire process so you can focus on recovery' },
                { title: 'No Upfront Costs', desc: 'For qualifying victims—you only pay after receiving compensation' },
                { title: 'Trusted Hospital Network', desc: 'Strategic partnerships with hospitals across Ghana' },
                { title: 'Transparent Process', desc: 'No hidden charges or surprises—complete clarity' },
                { title: 'Compassionate Support', desc: 'Every client is treated like family throughout the journey' }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4 bg-gradient-to-r from-orange-50 to-white p-6 rounded-2xl border-2 border-orange-100 hover:border-orange-300 transition-all group">
                  <CheckCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-2xl group-hover:text-orange-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 text-lg">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 p-12 rounded-3xl text-center border-2 border-orange-200 shadow-xl">
            <Heart className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <p className="text-4xl font-bold text-gray-900">
              At BearGuard, every client is treated like family
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-lg font-bold mb-8 shadow-xl">
                <DollarSign className="w-6 h-6 mr-2" />
                Referral Partner Program
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">Earn While Helping Others</h2>
              <p className="text-2xl mb-10 text-orange-50 leading-relaxed">
                Doctors, nurses, hospital staff, and community leaders can now earn monthly commissions for referring accident victims who need our help.
              </p>

              <div className="bg-white/15 backdrop-blur-sm p-10 rounded-3xl mb-10 border-2 border-white/30 shadow-2xl hover:bg-white/20 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <DollarSign className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-4xl font-bold">Earn Commissions</h3>
                </div>
                <p className="text-xl text-orange-100">
                  Per successful referral—paid monthly through our secure system. Make a difference while earning steady income.
                </p>
              </div>

              <button
                onClick={() => onNavigate('signup')}
                className="group px-12 py-5 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all shadow-2xl hover:shadow-white/50 font-bold text-2xl inline-flex items-center space-x-3 transform hover:scale-105"
              >
                <Briefcase className="w-7 h-7" />
                <span>Join Our Network Today</span>
                <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-white to-orange-200 rounded-3xl transform rotate-3 opacity-30 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="/WhatsApp Image 2025-11-21 at 14.53.38_5172faac.jpg"
                alt="Professional healthcare partner"
                className="relative rounded-3xl shadow-2xl w-full h-[550px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-6">
              TESTIMONIALS
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Real Stories from Ghana</h2>
            <p className="text-2xl text-gray-600">Hear from accident victims we've helped recover their rightful compensation</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                  activeTestimonial === index ? 'ring-4 ring-orange-300' : ''
                }`}
              >
                <div className="flex items-center gap-6 mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-2xl">{testimonial.name}</p>
                    <p className="text-lg text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-xl leading-relaxed italic">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeTestimonial === index ? 'bg-orange-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6">
              CONTACT US
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-2xl text-gray-600">We're here to help you 24/7—reach out anytime</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {[
              { icon: Phone, title: 'Call / WhatsApp', value: '050 282 9901', subtitle: 'Available 24/7', color: 'from-orange-500 to-orange-600' },
              { icon: Mail, title: 'Email Us', value: 'bearguard25@gmail.com', subtitle: 'Quick response guaranteed', color: 'from-blue-500 to-blue-600' },
              { icon: MapPin, title: 'Location', value: 'Ghana', subtitle: 'Nationwide coverage', color: 'from-green-500 to-green-600' }
            ].map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className={`bg-gradient-to-br ${contact.color} p-10 rounded-3xl text-center text-white shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2 group`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-10 h-10 text-gray-700" />
                  </div>
                  <h3 className="font-bold mb-4 text-2xl">{contact.title}</h3>
                  <p className="text-2xl font-bold mb-2 break-all">{contact.value}</p>
                  <p className="text-lg opacity-90">{contact.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 p-12 rounded-3xl text-center border-2 border-orange-200 shadow-xl">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 to-orange-400 rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <img
                src="/WhatsApp Image 2025-11-21 at 14.53.39_fca7de1a.jpg"
                alt="Patient receiving compassionate guidance from healthcare professional"
                className="relative w-full max-w-3xl mx-auto rounded-2xl shadow-2xl mb-8 h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-2xl text-gray-700 mb-8">Let us fight for the compensation you deserve</p>
            <button
              onClick={() => scrollToSection('home')}
              className="group px-12 py-5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-2xl font-bold text-2xl inline-flex items-center space-x-3 transform hover:scale-105"
            >
              <Phone className="w-7 h-7" />
              <span>Contact Us Now</span>
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img
                src="/Untitled-2 (12).png"
                alt="BearGuard Support Services"
                className="h-40 w-auto mb-6"
              />
              <p className="text-gray-400 text-xl leading-relaxed mb-4">We fight for what you deserve</p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-xl">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-xl">𝕏</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-xl">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-2xl">Quick Links</h3>
              <div className="space-y-3">
                <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">Home</button>
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">About Us</button>
                <button onClick={() => scrollToSection('services')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">Services</button>
                <button onClick={() => scrollToSection('why-us')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">Why Choose Us</button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-2xl">For Partners</h3>
              <div className="space-y-3">
                <button onClick={() => onNavigate('signup')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">Referral Portal</button>
                <button onClick={() => onNavigate('signup')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">Become a Partner</button>
                <button onClick={() => onNavigate('login')} className="block text-gray-400 hover:text-orange-500 transition-colors text-lg">Partner Login</button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-2xl">Contact</h3>
              <div className="space-y-3 text-gray-400 text-lg">
                <p className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  050 282 9901
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  bearguard25@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Ghana (Nationwide)
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-lg text-gray-400">
              &copy; 2025 BearGuard Support Services. All rights reserved.
              <span className="text-orange-500 font-semibold"> We fight for what you deserve.</span>
            </p>
          </div>
        </div>
      </footer>

      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
      />
    </div>
  );
}
