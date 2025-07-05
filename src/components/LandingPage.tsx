import React, { useState } from 'react';
import { Zap, ArrowRight, CheckCircle, Bolt, Globe, Shield, BarChart4, RefreshCw, Sparkles, Flame, Stars, Rocket, Cpu } from 'lucide-react';
import AuthForm from './auth/AuthForm';

const LandingPage: React.FC = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  const handleShowLogin = () => {
    setAuthMode('signin');
    setShowAuthForm(true);
  };
  
  const handleShowSignup = () => {
    setAuthMode('signup');
    setShowAuthForm(true);
  };
  
  if (showAuthForm) {
    return <AuthForm initialMode={authMode} onBack={() => setShowAuthForm(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Auth Buttons */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 px-6 fixed w-full z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-indigo-500/20 relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-700 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Bolt className="w-6 h-6 text-white relative z-10" />
              <Bolt className="w-6 h-6 text-white relative z-10" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
              e-Invoice Hub
            </span>
            <span className="text-xs text-slate-500 mt-1">
              by Thinkdigi
            </span>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button 
              onClick={handleShowLogin}
              className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-500/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center relative group"
            >
              <span className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
              <span className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
              <span>Kirjaudu sisään</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
            <button 
              onClick={handleShowSignup}
              className="px-4 py-2 border border-fuchsia-500 text-fuchsia-600 rounded-lg text-sm font-medium hover:bg-gradient-to-r hover:from-fuchsia-50 hover:to-indigo-50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
            >
              <span>Rekisteröidy</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Landing Page Content */}
      <div className="pt-24">
        {/* Hero Section with futuristic design */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-fuchsia-950 to-indigo-950 text-white relative overflow-hidden">
          {/* Abstract background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-fuchsia-500 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '15s'}}></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '20s', animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '25s', animationDelay: '5s'}}></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%22 height=%2760%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-fuchsia-200 mb-6 border border-white/20 shadow-lg shadow-fuchsia-500/10 animate-pulse" style={{animationDuration: '4s'}}>
                  <Star className="w-4 h-4 inline-block mr-2 text-fuchsia-300" /> Tulevaisuuden laskutusratkaisu
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                  <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">e-laskutus</span> Shopify-kaupoille
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Yhdistä Shopify-kauppasi Maventa e-laskutuspalveluun ja automatisoi 
                  laskutusprosessisi. Suomalainen ratkaisu, joka noudattaa kotimaisia 
                  laskutusvaatimuksia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button 
                    onClick={handleShowSignup}
                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-[0_0_35px_rgba(217,70,239,0.6)] hover:-translate-y-1 transition-all duration-200 border border-white/20 backdrop-blur-sm relative group overflow-hidden"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                    <Rocket className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Aloita ilmaiseksi</span>
                  </button>
                  <a 
                    href="#features" 
                    className="flex items-center justify-center px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 group"
                  >
                    Lue lisää
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
                <div className="flex justify-between space-x-4 relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-blue-500/10 blur-xl rounded-xl"></div>
                  <div className="text-center glass rounded-xl p-4 flex-1 border border-white/10 relative z-10 hover:bg-white/10 transition-colors group">
                    <p className="text-3xl font-bold text-white bg-gradient-to-r from-fuchsia-400 to-white bg-clip-text text-transparent group-hover:from-fuchsia-300 group-hover:to-white transition-colors">500+</p>
                    <p className="text-sm text-fuchsia-200 group-hover:text-white transition-colors">Shopify-kauppaa</p>
                  </div>
                  <div className="text-center glass rounded-xl p-4 flex-1 border border-white/10 relative z-10 hover:bg-white/10 transition-colors group">
                    <p className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-white transition-colors">50k+</p>
                    <p className="text-sm text-purple-200 group-hover:text-white transition-colors">Laskua lähetetty</p>
                  </div>
                  <div className="text-center glass rounded-xl p-4 flex-1 border border-white/10 relative z-10 hover:bg-white/10 transition-colors group">
                    <p className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-white transition-colors">99.9%</p>
                    <p className="text-sm text-blue-200 group-hover:text-white transition-colors">Käytettävyys</p>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <div className="absolute -inset-4 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse" style={{animationDuration: '10s'}}></div>
                <img 
                  src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="e-Invoice Hub Dashboard"
                  className="rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm relative z-10 transform hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute -top-5 -left-5 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg animate-float-rotate z-20 border border-indigo-100 hover:shadow-indigo-300/30 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📧</div>
                    <div>
                      <p className="font-semibold">Lasku lähetetty</p>
                      <p className="text-sm text-slate-500">INV-2024-001</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-5 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg animate-float-rotate animation-delay-2000 z-20 border border-indigo-100 hover:shadow-indigo-300/30 hover:scale-105 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💰</div>
                    <div>
                      <p className="font-semibold">Maksu saapunut</p>
                      <p className="text-sm text-slate-500">€1,250.00</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600 p-3 rounded-full shadow-lg z-20 border-2 border-white animate-pulse" style={{animationDuration: '2s'}}>
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-1/3 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-fuchsia-600 p-2 rounded-full shadow-lg z-20 border-2 border-white animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}}>
                  <Hexagon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-gradient-to-br from-black to-slate-950 text-white relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.03%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-fuchsia-900 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '15s'}}></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-900 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '20s', animationDelay: '5s'}}></div>
          
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-fuchsia-900/50 to-blue-900/50 rounded-full text-sm font-medium text-white mb-4 border border-white/20 shadow-sm backdrop-blur-sm">
                Ominaisuudet
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Miksi valita e-Invoice Hub?</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Kehitetty suomalaisille yrityksille, suomalaisten lakien mukaisesti
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-2 group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-fuchsia-500/20 group-hover:shadow-fuchsia-500/40 transition-all duration-300 relative">
                  <Bolt className="w-7 h-7 text-white animate-pulse" style={{animationDuration: '3s'}} />
                  <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent transition-colors duration-300 relative z-10">Automaattinen laskutus</h3>
                <p className="text-gray-400 relative z-10">
                  Laskut luodaan automaattisesti kun asiakas tekee tilauksen. 
                  Säästä aikaa ja vähennä virheitä.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <Globe className="w-7 h-7 text-white animate-pulse" style={{animationDuration: '4s', animationDelay: '0.5s'}} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-colors duration-300">Maventa-integraatio</h3>
                <p className="text-gray-400">
                  Suora yhteys Maventa e-laskutuspalveluun. Laskut toimitetaan 
                  turvallisesti ja nopeasti.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Hexagon className="w-7 h-7 text-white animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent transition-colors duration-300">ALV-käsittely</h3>
                <p className="text-gray-400">
                  Automaattinen ALV-laskenta kaikilla Suomen verokannoilla. 
                  Valmiit raportit viranomaisille.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-fuchsia-500/20 group-hover:shadow-fuchsia-500/40 transition-all duration-300">
                  <Shield className="w-7 h-7 text-white animate-pulse" style={{animationDuration: '3.5s', animationDelay: '1.5s'}} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent transition-colors duration-300">GDPR-yhteensopiva</h3>
                <p className="text-gray-400">
                  Kaikki tiedot käsitellään turvallisesti EU:n alueella. 
                  Täysi GDPR-compliance.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <RefreshCw className="w-7 h-7 text-white animate-pulse" style={{animationDuration: '4.5s', animationDelay: '2s'}} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-colors duration-300">Reaaliaikainen synkronointi</h3>
                <p className="text-gray-400">
                  Tuotteet, asiakkaat ja tilaukset synkronoidaan automaattisesti 
                  Shopifysta.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <BarChart4 className="w-7 h-7 text-white animate-pulse" style={{animationDuration: '4s', animationDelay: '2.5s'}} />
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent transition-colors duration-300">Kattavat raportit</h3>
                <p className="text-gray-400">
                  Seuraa laskutusta, kassavirtaa ja ALV-tietoja. 
                  Vie tiedot kirjanpitoon.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-slate-950 via-fuchsia-950 to-blue-950 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuchsia-900 rounded-full opacity-30 blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-900 rounded-full opacity-30 blur-3xl animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-900 rounded-full opacity-20 blur-2xl animate-pulse" style={{animationDuration: '6s', animationDelay: '1s'}}></div>
          
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-fuchsia-900/50 to-blue-900/50 rounded-full text-sm font-medium text-white mb-4 border border-white/20 shadow-sm backdrop-blur-sm">
                Prosessi
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Näin se toimii</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Kolme yksinkertaista vaihetta automaattiseen laskutukseen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-2 text-center group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative z-10">
                  <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-fuchsia-500/20 group-hover:shadow-fuchsia-500/40 transition-all duration-300 relative">1</div>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent transition-colors duration-300">Asenna ja määritä</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Asenna sovellus Shopify App Storesta ja yhdistä Maventa-tilisi. 
                  Määritä laskutusasetukset.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2 text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">2</div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-colors duration-300">Aktivoi automaatio</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Kytke automaattinen laskutus päälle. Sovellus alkaa luoda 
                  laskuja uusista tilauksista.
                </p>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">3</div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent transition-colors duration-300">Seuraa ja hallitse</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Seuraa laskujen tilaa dashboardista. Saat ilmoitukset 
                  maksuista ja erääntyneistä laskuista.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-black to-slate-950 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-900 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '15s'}}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '20s', animationDelay: '5s'}}></div>
          <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-purple-900 rounded-full opacity-20 blur-2xl animate-pulse" style={{animationDuration: '12s', animationDelay: '2s'}}></div>
          
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-fuchsia-900/50 to-blue-900/50 rounded-full text-sm font-medium text-white mb-4 border border-white/20 shadow-sm backdrop-blur-sm">
                Hinnoittelu
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Valitse sopiva paketti</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Valitse yrityksellesi sopiva paketti. Kaikki paketit sisältävät 7 päivän ilmaisen kokeilun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-2 group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent transition-colors duration-300">Starter</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent group-hover:from-fuchsia-300 group-hover:to-blue-300 transition-colors duration-300">29,90€</span>
                    <span className="text-gray-500">/kk</span>
                  </div>
                  <p className="text-gray-400">Pienille kaupoille</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-fuchsia-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Enintään 10 laskua/kk</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-fuchsia-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Automaattinen laskutus</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-fuchsia-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Maventa-integraatio</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-fuchsia-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">ALV-käsittely</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-fuchsia-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Sähköpostituki</span>
                  </li>
                </ul>
                <button 
                  onClick={handleShowSignup}
                  className="w-full py-3 border border-fuchsia-500/50 text-fuchsia-400 rounded-xl font-semibold hover:bg-fuchsia-500/10 hover:-translate-y-1 transition-all duration-200 relative group"
                >
                  Aloita ilmaiseksi
                </button>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-fuchsia-500/50 shadow-xl relative transform scale-105 z-10 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-xl blur opacity-20"></div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-fuchsia-500/20">
                  Suosituin
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent">Professional</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent">49€</span>
                    <span className="text-gray-500">/kk</span>
                  </div>
                  <p className="text-gray-400">Kasvavat yritykset</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                    <CheckCircle className="w-5 h-5 text-fuchsia-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Enintään 100 laskua/kk</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Kaikki Starter-ominaisuudet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Prioriteettituki</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">API-rajapinta</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Mukautetut raportit</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Webhook-integraatiot</span>
                  </li>
                </ul>
                <button 
                  onClick={handleShowSignup}
                  className="w-full py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-fuchsia-500/20 hover:-translate-y-1 transition-all duration-200 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                  Aloita ilmaiseksi
                </button>
              </div>
              
              <div className="glass-dark p-8 rounded-xl border border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Enterprise</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">99€</span>
                    <span className="text-gray-500">/kk</span>
                  </div>
                  <p className="text-gray-400">Suuret yritykset</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Rajoittamaton määrä laskuja</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Kaikki Professional-ominaisuudet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Oma asiakasvastaava</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">SLA-sopimus</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Mukautetut integraatiot</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Koulutus ja konsultointi</span>
                  </li>
                </ul>
                <button 
                  onClick={handleShowSignup}
                  className="w-full py-3 border border-blue-500/50 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/10 hover:-translate-y-1 transition-all duration-200"
                >
                  Aloita ilmaiseksi
                </button>
              </div>
            </div>
            
            <p className="text-center text-gray-500 mt-8">
              Kaikki hinnat sisältävät ALV:n. Ei sitoutumisaikaa, voit peruuttaa milloin tahansa.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-fuchsia-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.03%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '15s'}}></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDuration: '20s', animationDelay: '5s'}}></div>
          </div>
          
          <div className="container mx-auto px-6 text-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 blur-xl rounded-full opacity-30"></div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 relative">Aloita automaattinen laskutus tänään</h2>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Liity satojen suomalaisten Shopify-kauppiaiden joukkoon. 
              7 päivän ilmainen kokeilu, ei sitoutumisaikaa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={handleShowSignup}
                className="px-8 py-4 bg-white text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-white/25 hover:-translate-y-1 transition-all duration-200 border border-white/50 relative group overflow-hidden"
              >
                <span className="absolute inset-0 bg-white rounded-xl z-0"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 via-purple-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                <span className="relative z-10">Aloita ilmaiseksi</span>
              </button>
              <a 
                href="mailto:support@thinkdigi.fi" 
                className="px-8 py-4 glass border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 hover:-translate-y-1 transition-all duration-200 group"
              >
                <span className="relative inline-flex items-center">
                  Ota yhteyttä
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-8 justify-center text-white mt-8">
              <div className="flex items-center glass px-4 py-2 rounded-full border border-white/10 hover:border-fuchsia-500/30 transition-colors">
                <CheckCircle className="w-5 h-5 mr-2 text-fuchsia-400" />
                <span>7 päivän ilmainen kokeilu</span>
              </div>
              <div className="flex items-center glass px-4 py-2 rounded-full border border-white/10 hover:border-purple-500/30 transition-colors">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-400" />
                <span>Ei sitoutumisaikaa</span>
              </div>
              <div className="flex items-center glass px-4 py-2 rounded-full border border-white/10 hover:border-blue-500/30 transition-colors">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                <span>Tuki suomeksi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 bg-black text-gray-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.02%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-fuchsia-900 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDuration: '15s'}}></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-900 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDuration: '20s', animationDelay: '5s'}}></div>
          
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600 p-2 rounded-lg mr-3 shadow-lg shadow-fuchsia-500/10 animate-pulse" style={{animationDuration: '3s'}}>
                  <Bolt className="w-6 h-6 text-white animate-pulse" style={{animationDuration: '2s'}} />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">e-Invoice Hub</span>
                <span className="ml-2 text-gray-600 text-sm">by Thinkdigi</span>
              </div>
              <div className="text-sm glass px-4 py-2 rounded-full border border-white/5">
                &copy; {new Date().getFullYear()} Thinkdigi Oy. Kaikki oikeudet pidätetään.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;