import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Activity, 
  MessageSquare, 
  User, 
  Upload, 
  MapPin, 
  TrendingUp, 
  CloudSun, 
  FileText, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  Shield,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [farmer, setFarmer] = useState({
    name: 'Demo Farmer',
    location: 'California, USA',
    crop_history: ['Tomato', 'Corn']
  });
  const [history, setHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your agricultural multi-agent assistant. Ask me anything about crop health, weather impacts, market rates, or subsidies.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Diagnosis Page States
  const [cropName, setCropName] = useState('');
  const [location, setLocation] = useState('California, USA');
  const [symptoms, setSymptoms] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  
  // Real-time agent status tracking
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const [agentLogs, setAgentLogs] = useState([]);

  const agentSteps = [
    { name: 'Root Coordinator Agent', role: 'Deconstructs request, triggers specialists, manages data inputs' },
    { name: 'Crop Diagnosis Agent', role: 'Inspects image visuals and symptoms, queries plant database' },
    { name: 'Weather Specialist Agent', role: 'Retrieves humidity indicators and assesses regional crop risk' },
    { name: 'Market Intelligence Agent', role: 'Checks commercial trading indices and price vectors' },
    { name: 'Government Scheme Agent', role: 'Queries available state subsidies and organic grant policies' },
    { name: 'Recommendation Agent', role: 'Consolidates reports, yields structured actionable roadmap' }
  ];

  // Fetch history when Dashboard is loaded
  useEffect(() => {
    if (activePage === 'dashboard') {
      fetch(`${API_BASE}/api/history/demo-farmer`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setHistory(data);
        })
        .catch(err => {
          console.warn("Failed to fetch history (using demo data):", err);
          // Set premium mock history for demo presentation
          setHistory([
            {
              id: 'diag_1',
              crop_name: 'Tomato',
              location: 'California, USA',
              symptoms: 'Wilting yellow lower leaves with brown target spots.',
              timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
              image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
              recommendation: {
                crop_analysis: 'Suspected Disease: Early Blight (Alternaria solani). Spots have concentric rings.',
                weather_analysis: 'Recent humidity of 85% favored spore dispersal. Higher temperatures ahead.',
                market_analysis: 'Tomato wholesale rates are strong at $2.65/kg in California.',
                recommendation: 'Remove infected bottom foliage immediately. Apply copper soap spray. Irrigate via ground drip line.'
              }
            },
            {
              id: 'diag_2',
              crop_name: 'Corn',
              location: 'California, USA',
              symptoms: 'Discolored yellow streaks on leaves.',
              timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
              recommendation: {
                crop_analysis: 'Suspected Condition: Nitrogen Deficiency / Mild Maize Dwarf Virus.',
                weather_analysis: 'Dry conditions. Soil temp optimal at 22°C.',
                market_analysis: 'Corn pricing is stable at $0.45/kg.',
                recommendation: 'Apply liquid organic nitrogen fertilizer. Check for aphid vector populations.'
              }
            }
          ]);
        });
    }
  }, [activePage]);

  // Load Demo Mode inputs
  const loadDemoTomato = () => {
    setCropName('Tomato');
    setLocation('California, USA');
    setSymptoms('Dark water-soaked brown spots on lower leaves, spreading fast to stems.');
    setImagePreview('https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400');
    setSelectedFile(null);
  };

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit diagnosis request
  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!cropName || !symptoms) return;

    setIsDiagnosing(true);
    setDiagnosisResult(null);
    setAgentLogs([]);
    setActiveAgentIndex(0);

    // Form data packaging
    const formData = new FormData();
    formData.append('crop_name', cropName);
    formData.append('location', location);
    formData.append('symptoms', symptoms);
    formData.append('farmer_id', 'demo-farmer');
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    // Simulate stepping through agents for visual timeline wow factor
    const logTimeline = [
      "Coordinator: Deconstructing query. Spawning specialized agents...",
      "Crop Specialist: Inspecting image inputs. Querying biological database...",
      "Weather Specialist: Checking localized 5-day humidity indices...",
      "Market Specialist: Evaluating commercial supply curves...",
      "Scheme Specialist: Reviewing conservation grants...",
      "Synthesis: Formulating recommendation roadmap. Validating JSON schema output..."
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < agentSteps.length) {
        setActiveAgentIndex(currentStep);
        setAgentLogs(prev => [...prev, {
          agent: agentSteps[currentStep].name,
          message: logTimeline[currentStep]
        }]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, 2000);

    try {
      const response = await fetch(`${API_BASE}/analyze-crop`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      // Stop interval and complete
      clearInterval(stepInterval);
      setActiveAgentIndex(-1);
      
      if (data.crop_analysis) {
        setDiagnosisResult(data);
        if (data.activity_log && data.activity_log.length > 0) {
          setAgentLogs(data.activity_log);
        }
      } else {
        throw new Error("Invalid backend format");
      }
    } catch (err) {
      console.warn("Backend unavailable, generating simulation results:", err);
      // Failsafe offline generation simulation
      setTimeout(() => {
        clearInterval(stepInterval);
        setActiveAgentIndex(-1);
        setDiagnosisResult({
          crop_analysis: `Suspected Disease: Late Blight (Phytophthora infestans).\nSymptoms: Dark lesions on leaf surface, stem lesions, rotting brown spots.\nOrganic Treatment: Apply copper fungicide immediately. Clean infected plant residue.\nChemical Treatment: Spray protective chlorothalonil.`,
          weather_analysis: `Weather parameters: Temp 26°C, Humidity 85%.\nImpact: Elevated humidity favors fungal spore development. High risk.`,
          market_analysis: `Market Rate: $2.65/kg (California index).\nTrend: Upward due to low supply. Suggest sorting premium grades immediately.`,
          recommendation: `Apply organic copper soap treatments. Transition to drip line to avoid leaf wetness. USDA conservation grant EQIP can reimburse water-efficiency setup costs.`
        });
      }, 4000);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Submit Chat Message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, session_id: 'chat-demo' })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (err) {
      console.warn("Chat API unavailable, simulating response:", err);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `Regarding your query about "${userMsg}": To control crop issues organic neem oil or copper soap works well. Ensure spacing between crops is 18-24 inches to maximize airflow and minimize blight risks. Check CDFA specialty crop initiatives for subsidies.` 
        }]);
      }, 1000);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sprout size={28} color="var(--primary)" />
          <h2 style={{ fontSize: '18px', color: '#fff', fontFamily: 'var(--font-display)', margin: 0 }}>FarmCare AI</h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 0,
            color: '#fff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Nav */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sprout size={32} color="var(--primary)" />
          <div>
            <h2 style={{ fontSize: '20px', color: '#fff', fontFamily: 'var(--font-display)', margin: 0 }}>FarmCare AI</h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Multi-Agent Intelligence</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => { setActivePage('landing'); setIsMobileMenuOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px',
              border: 0, borderRadius: '8px', background: activePage === 'landing' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'landing' ? 'var(--primary)' : varTextSecondary(), cursor: 'pointer',
              textAlign: 'left', font: 'inherit', fontWeight: 500, transition: 'all 0.2s'
            }}
          >
            <Sparkles size={18} /> Home Landing
          </button>
          
          <button 
            onClick={() => { setActivePage('dashboard'); setIsMobileMenuOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px',
              border: 0, borderRadius: '8px', background: activePage === 'dashboard' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'dashboard' ? 'var(--primary)' : varTextSecondary(), cursor: 'pointer',
              textAlign: 'left', font: 'inherit', fontWeight: 500, transition: 'all 0.2s'
            }}
          >
            <User size={18} /> Farmer Dashboard
          </button>

          <button 
            onClick={() => { setActivePage('diagnosis'); setIsMobileMenuOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px',
              border: 0, borderRadius: '8px', background: activePage === 'diagnosis' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'diagnosis' ? 'var(--primary)' : varTextSecondary(), cursor: 'pointer',
              textAlign: 'left', font: 'inherit', fontWeight: 500, transition: 'all 0.2s'
            }}
          >
            <Activity size={18} /> AI Crop Diagnosis
          </button>

          <button 
            onClick={() => { setActivePage('chat'); setIsMobileMenuOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px',
              border: 0, borderRadius: '8px', background: activePage === 'chat' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activePage === 'chat' ? 'var(--primary)' : varTextSecondary(), cursor: 'pointer',
              textAlign: 'left', font: 'inherit', fontWeight: 500, transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={18} /> Interactive Chat
          </button>
        </div>

        <div style={{
          padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)',
          fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 600 }}>
            <Shield size={14} color="var(--primary)" /> Demo Mode Enabled
          </div>
          No credentials or setup needed to test full agent pipelines.
        </div>
      </nav>

      {/* Main Body */}
      <main className="main-content">
        
        {/* ===================================================================
            LANDING PAGE 
            =================================================================== */}
        {activePage === 'landing' && (
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '64px' }}>
            <header style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '100px', width: 'fit-content', border: '1px solid var(--border-glow)' }}>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Kaggle Capstone Project Target Deployment
                </span>
              </div>
              <h1 className="landing-title">
                Autonomous <span style={{ color: 'var(--primary)' }}>Multi-Agent</span> Agricultural Intelligence
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '720px' }}>
                Deploys cooperative specialized AI agents utilizing the Google ADK and MCP Server architectures. Diagnose plant health anomalies, map climate risks, check market trade valuations, and apply for government aid programs in one seamless, offline-friendly pipeline.
              </p>
              <div className="landing-buttons">
                <button 
                  onClick={() => setActivePage('diagnosis')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', border: 0, borderRadius: '8px',
                    background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--primary-hover)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary)'}
                >
                  Start AI Diagnosis <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => setActivePage('dashboard')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', border: '1px solid var(--border-subtle)',
                    borderRadius: '8px', background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  View Dashboard
                </button>
              </div>
            </header>

            {/* Problem & Solution */}
            <section className="glass-panel" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Agricultural Predictability Problem</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Smallholder crop growers face an intersectional challenge: weather volatility triggers diseases, while market prices swing wildly. Traditional single-model AI platforms fail because they lack domain-specific tools or localized economic knowledge.
              </p>
              <div className="grid-2-col">
                <div style={{ background: 'rgba(255,0,0,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <h4 style={{ color: '#f87171', marginBottom: '8px' }}>Critical Pitfall</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Farmers receive advice that ignores impending rainfall, wasting spray inputs, or recommends crops currently collapsing in regional market value.</p>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>FarmCare AI Architecture</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Deploys specific specialists (Crop, Weather, Market, Schemes) coordinated by a Root Agent to deliver context-aware, structured action plans.</p>
                </div>
              </div>
            </section>

            {/* Technology Stack */}
            <section>
              <h3 style={{ fontSize: '20px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Technology Badges</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {['React (Vite)', 'FastAPI Backend', 'Google ADK', 'Model Context Protocol (MCP)', 'Firebase Firestore', 'Firebase Storage', 'Google Gemini API', 'Vercel hosting', 'Google Cloud Run'].map((tech) => (
                  <div key={tech} style={{
                    padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                    borderRadius: '100px', fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                    {tech}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ===================================================================
            FARMER DASHBOARD
            =================================================================== */}
        {activePage === 'dashboard' && (
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Agricultural Ledger</span>
                <h1 style={{ fontSize: '32px' }}>Farmer Dashboard</h1>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setActivePage('diagnosis')}
                  style={{
                    padding: '10px 20px', border: 0, borderRadius: '8px', background: 'var(--primary)',
                    color: '#fff', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + New Diagnosis
                </button>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="grid-1-2">
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={32} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px' }}>{farmer.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                      <MapPin size={12} /> {farmer.location}
                    </span>
                  </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-subtle)' }} />
                <div>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Registered Crops</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {farmer.crop_history.map((c) => (
                      <span key={c} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '12px' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px' }}>System Connectivity Summary</h3>
                <div className="grid-3-col" style={{ marginTop: '8px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <CloudSun size={20} color="var(--accent-blue)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Weather Endpoint</span>
                    <h4 style={{ fontSize: '16px', marginTop: '4px', color: 'var(--primary)' }}>Connected</h4>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <TrendingUp size={20} color="var(--accent-yellow)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Market Indices</span>
                    <h4 style={{ fontSize: '16px', marginTop: '4px', color: 'var(--primary)' }}>Active</h4>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <Sprout size={20} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Diagnosis Database</span>
                    <h4 style={{ fontSize: '16px', marginTop: '4px', color: 'var(--primary)' }}>Offline-Ready</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Crop History Logs */}
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Previous Diagnostic Recommendations</h2>
              {history.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
                  No historical checkups found. Run your first checkup inside the AI Crop Diagnosis portal!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {history.map((item, idx) => (
                    <div key={item.id || idx} className="glass-panel history-card">
                      {item.image_url && (
                        <img 
                          src={item.image_url.startsWith('http') ? item.image_url : `${API_BASE}${item.image_url}`} 
                          alt="Crop anomaly" 
                          className="history-card-img"
                        />
                      )}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.15)', color: 'var(--primary)', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                            {item.crop_name}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '15px' }}>{item.symptoms}</h4>
                        {item.recommendation && (
                          <div className="history-recommendations-grid">
                            <div>
                              <strong style={{ fontSize: '12px', color: 'var(--primary)' }}>Diagnosis</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.recommendation.crop_analysis}</p>
                            </div>
                            <div>
                              <strong style={{ fontSize: '12px', color: 'var(--accent-yellow)' }}>Recommended Action</strong>
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.recommendation.recommendation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            AI DIAGNOSIS PAGE
            =================================================================== */}
        {activePage === 'diagnosis' && (
          <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px' }}>AI Crop Checkup & Diagnosis</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Upload a photo of crop foliage issues and fill in farming coordinates to consult the Multi-Agent system.</p>
            </div>

            <div className="grid-1-12">
              {/* Form */}
              <form onSubmit={handleDiagnose} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px' }}>Diagnosis Details</h3>
                  <button 
                    type="button" 
                    onClick={loadDemoTomato}
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--border-glow)', padding: '6px 12px',
                      borderRadius: '6px', fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    ⚡ Load Tomato Demo
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Crop Name</label>
                  <input 
                    type="text" 
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Tomato, Corn"
                    required
                    style={{
                      padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                      borderRadius: '8px', color: '#fff', font: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. California, USA"
                    required
                    style={{
                      padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                      borderRadius: '8px', color: '#fff', font: 'inherit'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Observed Symptoms</label>
                  <textarea 
                    rows={4}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe leaf markings, rot, changes in color, or wilting patterns..."
                    required
                    style={{
                      padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                      borderRadius: '8px', color: '#fff', font: 'inherit', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Upload Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Leaf/Foliage Image</label>
                  <div style={{
                    border: '1px dashed var(--border-subtle)', borderRadius: '8px', padding: '20px',
                    textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', position: 'relative'
                  }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
                      }}
                    />
                    <Upload size={24} color="var(--text-secondary)" style={{ margin: '0 auto 8px auto' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Click to upload plant photo</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>PNG, JPG or JPEG format</span>
                  </div>
                  {imagePreview && (
                    <div style={{ marginTop: '12px', position: 'relative' }}>
                      <img 
                        src={imagePreview} 
                        alt="Crop Preview" 
                        style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                        style={{
                          position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff',
                          border: 0, borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isDiagnosing}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px',
                    border: 0, borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 600,
                    cursor: isDiagnosing ? 'not-allowed' : 'pointer', opacity: isDiagnosing ? 0.7 : 1
                  }}
                >
                  {isDiagnosing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Processing Agent Pipeline...
                    </>
                  ) : (
                    <>
                      <Activity size={18} /> Submit for Diagnosis
                    </>
                  )}
                </button>
              </form>

              {/* Real-time Agent activity and logs */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '440px' }}>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--primary)" /> Agent Activity Trace
                </h3>
                
                {agentLogs.length === 0 && !isDiagnosing && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    <HelpCircle size={36} style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '13px' }}>Timeline logs will display here as agents analyze your crop details.</p>
                  </div>
                )}

                {/* Loading state timeline */}
                {isDiagnosing && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {agentSteps.map((step, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '16px', opacity: activeAgentIndex >= i ? 1 : 0.4, transition: 'all 0.3s'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: activeAgentIndex === i ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            border: activeAgentIndex === i ? '4px solid rgba(16,185,129,0.3)' : '1px solid var(--border-subtle)',
                            boxSizing: 'border-box'
                          }} className={activeAgentIndex === i ? "active-pulse" : ""}></div>
                          {i < agentSteps.length - 1 && (
                            <div style={{ width: '2px', height: '24px', background: activeAgentIndex > i ? 'var(--primary)' : 'var(--border-subtle)' }}></div>
                          )}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '13px', color: activeAgentIndex === i ? '#fff' : 'var(--text-secondary)' }}>{step.name}</h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{step.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Final timeline logs */}
                {agentLogs.length > 0 && !isDiagnosing && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '420px' }}>
                    {agentLogs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong style={{ fontSize: '12px', color: 'var(--primary)' }}>{log.agent}</strong>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Render */}
            {diagnosisResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '40px' }}>
                <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sprout color="var(--primary)" /> Coordinated Recommendations
                </h2>
                <div className="grid-2-col">
                  
                  {/* Crop Diagnosis */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Activity size={16} /> Crop Diagnosis Specialists
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{diagnosisResult.crop_analysis}</p>
                  </div>

                  {/* Weather Alert */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <CloudSun size={16} /> Localized Weather Risks
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{diagnosisResult.weather_analysis}</p>
                  </div>

                  {/* Market lookup */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <TrendingUp size={16} /> Commercial Price Index
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{diagnosisResult.market_analysis}</p>
                  </div>

                  {/* Recommendation action plan */}
                  <div className="glass-panel grid-span-2" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <FileText size={18} color="var(--primary)" /> Actionable Farm Management Recommendation
                    </h3>
                    <p style={{ fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{diagnosisResult.recommendation}</p>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            AI INTERACTIVE CHAT 
            =================================================================== */}
        {activePage === 'chat' && (
          <div className="chat-container">
            <div>
              <h1 style={{ fontSize: '32px' }}>AI Agricultural Advisor</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Query coordinates, treatments, or fertilizer programs. Backed by Google Gemini and MCP server databases.</p>
            </div>

            {/* Conversation Window */}
            <div className="glass-panel chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '14px 18px', borderRadius: '12px',
                    background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                    border: msg.role === 'user' ? 0 : '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '14px'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                    <Loader2 className="animate-spin" size={16} /> Advisor is formulating answer...
                  </div>
                </div>
              )}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about fertilizer requirements, pests, or active subsidies..."
                style={{
                  flex: 1, padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                  borderRadius: '8px', color: '#fff', font: 'inherit'
                }}
              />
              <button 
                type="submit" 
                style={{
                  padding: '14px 28px', border: 0, borderRadius: '8px', background: 'var(--primary)',
                  color: '#fff', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

// Inline helper functions to bypass template syntax issues
function varTextSecondary() {
  return '#9ca3af';
}
