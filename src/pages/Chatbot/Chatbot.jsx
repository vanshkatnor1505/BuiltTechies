import React, { useEffect, useRef, useState } from "react";

import {
  Activity,
  ArrowUp,
  Bot,
  CheckCircle2,
  FileText,
  HeartPulse,
  Hospital,
  Languages,
  LoaderCircle,
  MapPin,
  Mic,
  MoreHorizontal,
  Paperclip,
  Plus,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";

import styles from "./Chatbot.module.css";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   LANGUAGES
========================================================= */

const LANGUAGES = [
  {
    code: "en",
    label: "English",
    short: "EN",
    speech: "en-IN",
  },
  {
    code: "hi",
    label: "हिन्दी",
    short: "HI",
    speech: "hi-IN",
  },
  {
    code: "pa",
    label: "ਪੰਜਾਬੀ",
    short: "PA",
    speech: "pa-IN",
  },
];

/* =========================================================
   QUICK ACTIONS
========================================================= */

const QUICK_ACTIONS = [
  {
    id: "hospital",
    icon: Hospital,
    title: "Find a hospital",
    description: "Based on my health requirement",
  },
  {
    id: "compare",
    icon: Activity,
    title: "Compare hospitals",
    description: "Compare cost, distance & facilities",
  },
  {
    id: "report",
    icon: FileText,
    title: "Understand my report",
    description: "Upload a PDF report for analysis",
  },
  {
    id: "emergency",
    icon: Siren,
    title: "Emergency help",
    description: "Find nearby emergency care",
    emergency: true,
  },
];

/* =========================================================
   INITIAL CHAT
========================================================= */

const INITIAL_MESSAGES = [
  {
    id: 1,
    type: "assistant",
    time: "Now",
    content:
      "Hello! I'm your healthcare navigation assistant. I can help you find suitable hospitals, understand healthcare information and navigate your options.",
  },
];

/* =========================================================
   DEMO MATCHES
========================================================= */

const SAMPLE_MATCHES = [
  {
    id: 1,
    name: "CityCare Multispeciality Hospital",
    specialty: "Multispeciality • Nephrology",
    distance: "4.2 km",
    time: "14 min",
    match: 94,
    cost: "₹1.8L – ₹2.7L",
    insurance: "Insurance accepted",
  },
  {
    id: 2,
    name: "LifePoint Medical Centre",
    specialty: "Nephrology • Kidney Care",
    distance: "7.8 km",
    time: "22 min",
    match: 89,
    cost: "₹1.5L – ₹2.9L",
    insurance: "Scheme verified",
  },
];

/* =========================================================
   CHATBOT
========================================================= */

function Chatbot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const [input, setInput] = useState("");

  const [showSidebar, setShowSidebar] = useState(false);

  const [isTyping, setIsTyping] = useState(false);

  const [showMatches, setShowMatches] = useState(false);

  const [language, setLanguage] = useState("en");

  const [showLanguages, setShowLanguages] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const [isTranscribing, setIsTranscribing] = useState(false);

  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  const fileInputRef = useRef(null);

  /* =======================================================
     CURRENT LANGUAGE
  ======================================================= */

  const currentLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  /* =======================================================
     SPEECH OUTPUT
  ======================================================= */

  const speak = (text) => {
    if (!("speechSynthesis" in window) || !text) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = currentLanguage.speech;

    utterance.rate = 0.95;

    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  /* =======================================================
     SEND TO GROQ
  ======================================================= */

  const sendToAI = async (conversationMessages) => {
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          language,

          messages: conversationMessages.map((message) => ({
            role: message.type === "user" ? "user" : "assistant",

            content: message.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI request failed.");
      }

      return data.message;
    } catch (error) {
      console.error("AI ERROR:", error);

      throw error;
    }
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const handleSend = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isTyping) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      time: "Now",
      content: trimmedInput,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    setInput("");

    setIsTyping(true);

    try {
      const response = await sendToAI(updatedMessages);

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        time: "Now",
        content: response,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);

      speak(response);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          type: "assistant",
          time: "Now",
          content:
            "I'm having trouble connecting to the healthcare assistant right now. Please check that the Vital backend is running and try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* =======================================================
     VOICE RECORDING
  ======================================================= */

  const startRecording = async () => {
    if (isRecording) {
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone access.");

        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      setIsRecording(true);
    } catch (error) {
      console.error("MIC ERROR:", error);

      alert("Microphone permission is required for voice input.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /* =======================================================
     TRANSCRIBE AUDIO
  ======================================================= */

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();

      formData.append("audio", audioBlob, "voice.webm");

      formData.append("language", language);

      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Transcription failed.");
      }

      if (data.text?.trim()) {
        setInput((current) =>
          current ? `${current} ${data.text}` : data.text,
        );
      }
    } catch (error) {
      console.error("TRANSCRIPTION ERROR:", error);

      alert("Unable to understand the voice input. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  /* =======================================================
     PDF UPLOAD
  ======================================================= */

  const openPdfPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePdfSelected = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Only PDF medical reports are supported.");

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("The PDF must be smaller than 10 MB.");

      return;
    }

    await analyzeReport(file);
  };

  /* =======================================================
     ANALYZE REPORT
  ======================================================= */

  const analyzeReport = async (file) => {
    setIsAnalyzingReport(true);

    const userMessage = {
      id: Date.now(),
      type: "user",
      time: "Now",
      content: `I uploaded a medical report: ${file.name}`,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const formData = new FormData();

      formData.append("report", file);

      formData.append("language", language);

      const response = await fetch(`${API_URL}/api/analyze-report`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Report analysis failed.");
      }

      const reportMessage = {
        id: Date.now() + 1,
        type: "assistant",
        time: "Now",
        content: data.analysis,
        isReport: true,
        filename: data.filename,
      };

      setMessages((currentMessages) => [...currentMessages, reportMessage]);

      speak(data.analysis);
    } catch (error) {
      console.error("REPORT ERROR:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          type: "assistant",
          time: "Now",
          content:
            error.message || "I couldn't analyze this PDF. Please try again.",
        },
      ]);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  /* =======================================================
     LANGUAGE CHANGE
  ======================================================= */

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);

    setShowLanguages(false);

    stopSpeaking();

    const selected = LANGUAGES.find((item) => item.code === nextLanguage);

    if (selected) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          type: "assistant",
          time: "Now",
          content:
            nextLanguage === "hi"
              ? "अब मैं आपकी सहायता हिन्दी में कर सकता हूँ। आप अपनी स्वास्थ्य संबंधी आवश्यकता बता सकते हैं।"
              : nextLanguage === "pa"
                ? "ਹੁਣ ਮੈਂ ਤੁਹਾਡੀ ਪੰਜਾਬੀ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਆਪਣੀ ਸਿਹਤ ਸੰਬੰਧੀ ਲੋੜ ਦੱਸ ਸਕਦੇ ਹੋ।"
                : "I can now continue our conversation in English.",
        },
      ]);
    }
  };

  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  const handleQuickAction = async (action) => {
    if (action.id === "emergency") {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          type: "user",
          time: "Now",
          content: "I need emergency medical help.",
        },
        {
          id: Date.now() + 1,
          type: "assistant",
          time: "Now",
          content:
            "If this may be a medical emergency, please contact local emergency services or go to the nearest emergency department. I can also help you locate nearby emergency hospitals.",
        },
      ]);

      return;
    }

    if (action.id === "hospital") {
      setInput("Help me find a suitable hospital for ");

      return;
    }

    if (action.id === "compare") {
      setShowMatches(true);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          type: "user",
          time: "Now",
          content: "I want to compare hospitals.",
        },
        {
          id: Date.now() + 1,
          type: "assistant",
          time: "Now",
          content:
            "Sure. Once we identify suitable hospitals, I can compare their match score, cost, distance, facilities, insurance compatibility and other available information.",
        },
      ]);

      return;
    }

    if (action.id === "report") {
      openPdfPicker();
    }
  };

  /* =======================================================
     NEW CHAT
  ======================================================= */

  const handleNewChat = () => {
    stopSpeaking();

    setMessages(INITIAL_MESSAGES);

    setInput("");

    setIsTyping(false);

    setShowMatches(false);
  };

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      stopSpeaking();

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className={styles.page}>
      <div className={styles.ambient} />

      <SiteNavbar />

      {showSidebar && (
        <button
          className={styles.overlay}
          onClick={() => setShowSidebar(false)}
          aria-label="Close sidebar"
        />
      )}

      <section className={styles.appShell}>
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`${styles.sidebar} ${
            showSidebar ? styles.sidebarOpen : ""
          }`}
        >
          <div className={styles.sidebarTop}>
            <div className={styles.brand}>
              <div className={styles.brandMark}>
                <HeartPulse size={20} />
              </div>

              <div>
                <span className={styles.brandName}>Vital</span>

                <span className={styles.brandLabel}>Healthcare AI</span>
              </div>
            </div>

            <button
              className={styles.closeSidebar}
              onClick={() => setShowSidebar(false)}
              aria-label="Close menu"
            >
              <X size={19} />
            </button>
          </div>

          <button className={styles.newChatButton} onClick={handleNewChat}>
            <Plus size={18} />

            <span>New conversation</span>
          </button>

          <div className={styles.sidebarSection}>
            <span className={styles.sidebarHeading}>Healthcare tools</span>

            <button
              className={styles.sidebarItem}
              onClick={() => setInput("Help me find a suitable hospital for ")}
            >
              <Hospital size={17} />
              <span>Find hospitals</span>
            </button>

            <button
              className={styles.sidebarItem}
              onClick={() => setShowMatches(true)}
            >
              <Activity size={17} />
              <span>Compare hospitals</span>
            </button>

            <button className={styles.sidebarItem} onClick={openPdfPicker}>
              <FileText size={17} />
              <span>Medical reports</span>
            </button>

            <button className={styles.sidebarItem}>
              <MapPin size={17} />
              <span>Nearby care</span>
            </button>
          </div>

          <div className={styles.sidebarSection}>
            <span className={styles.sidebarHeading}>Recent</span>

            <button className={styles.historyItem}>
              <span>Finding kidney care</span>

              <span>Today</span>
            </button>

            <button className={styles.historyItem}>
              <span>Hospital comparison</span>

              <span>Yesterday</span>
            </button>
          </div>

          <div className={styles.sidebarBottom}>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <ShieldCheck size={17} />
              </div>

              <div>
                <strong>Healthcare guidance</strong>

                <span>Information is designed to help you navigate care.</span>
              </div>
            </div>
          </div>
        </aside>

        {/* =================================================
            CHAT
        ================================================= */}

        <div className={styles.chatArea}>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <button
                className={styles.menuButton}
                onClick={() => setShowSidebar(true)}
                aria-label="Open menu"
              >
                <MoreHorizontal size={20} />
              </button>

              <div className={styles.assistantAvatar}>
                <Bot size={21} />

                <span className={styles.onlineDot} />
              </div>

              <div className={styles.assistantInfo}>
                <div className={styles.assistantNameRow}>
                  <h1>Vital Assistant</h1>

                  <span className={styles.verified}>
                    <CheckCircle2 size={13} />
                    Healthcare AI
                  </span>
                </div>

                <span className={styles.status}>
                  <span />
                  Ready to help
                </span>
              </div>
            </div>

            <div className={styles.headerActions}>
              {/* LANGUAGE */}

              <div className={styles.languageWrapper}>
                <button
                  className={styles.languageButton}
                  onClick={() => setShowLanguages((value) => !value)}
                >
                  <Languages size={17} />

                  <span>{currentLanguage.short}</span>
                </button>

                {showLanguages && (
                  <div className={styles.languageMenu}>
                    {LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        className={
                          language === item.code ? styles.languageActive : ""
                        }
                        onClick={() => changeLanguage(item.code)}
                      >
                        <span>{item.label}</span>

                        <small>{item.short}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SPEAKING */}

              <button
                className={styles.headerIconButton}
                onClick={
                  isSpeaking
                    ? stopSpeaking
                    : () => speak(messages[messages.length - 1]?.content)
                }
                aria-label={
                  isSpeaking ? "Stop speaking" : "Read response aloud"
                }
              >
                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </header>

          {/* =================================================
              CONVERSATION
          ================================================= */}

          <div className={styles.conversation}>
            <div className={styles.conversationInner}>
              <div className={styles.welcome}>
                <div className={styles.welcomeOrb}>
                  <div className={styles.orbGlow} />

                  <HeartPulse size={30} />
                </div>

                <div className={styles.welcomeContent}>
                  <span className={styles.eyebrow}>
                    YOUR HEALTHCARE NAVIGATOR
                  </span>

                  <h2>
                    How can I help you
                    <span> today?</span>
                  </h2>

                  <p>
                    Tell me about your healthcare requirement. I can help you
                    find suitable hospitals, understand reports and navigate
                    your options.
                  </p>
                </div>
              </div>

              {/* QUICK ACTIONS */}

              <div className={styles.quickActions}>
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.id}
                      className={`${styles.quickAction} ${
                        action.emergency ? styles.emergencyAction : ""
                      }`}
                      onClick={() => handleQuickAction(action)}
                    >
                      <div className={styles.quickIcon}>
                        <Icon size={18} />
                      </div>

                      <div className={styles.quickText}>
                        <strong>{action.title}</strong>

                        <span>{action.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* REPORT LOADING */}

              {isAnalyzingReport && (
                <div className={styles.processingCard}>
                  <LoaderCircle size={18} className={styles.spinner} />

                  <div>
                    <strong>Analyzing your PDF</strong>

                    <span>
                      Extracting the report and preparing a simple
                      explanation...
                    </span>
                  </div>
                </div>
              )}

              {/* TRANSCRIBING */}

              {isTranscribing && (
                <div className={styles.processingCard}>
                  <LoaderCircle size={18} className={styles.spinner} />

                  <div>
                    <strong>Understanding your voice</strong>

                    <span>Converting your speech into text...</span>
                  </div>
                </div>
              )}

              {/* MESSAGES */}

              <div className={styles.messages}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.type === "user"
                        ? styles.userMessageRow
                        : styles.assistantMessageRow
                    }
                  >
                    {message.type === "assistant" && (
                      <div className={styles.messageAvatar}>
                        {message.isReport ? (
                          <FileText size={17} />
                        ) : (
                          <Bot size={17} />
                        )}
                      </div>
                    )}

                    <div
                      className={
                        message.type === "user"
                          ? styles.userBubble
                          : styles.assistantBubble
                      }
                    >
                      <p
                        className={message.isReport ? styles.reportContent : ""}
                      >
                        {message.content}
                      </p>

                      <span>{message.time}</span>
                    </div>

                    {message.type === "user" && (
                      <div className={styles.userAvatar}>
                        <UserRound size={16} />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className={styles.assistantMessageRow}>
                    <div className={styles.messageAvatar}>
                      <Bot size={17} />
                    </div>

                    <div className={styles.typingBubble}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>

              {/* MATCHES */}

              {showMatches && (
                <div className={styles.matchesSection}>
                  <div className={styles.matchesHeader}>
                    <div>
                      <span className={styles.sectionEyebrow}>
                        MATCHED FOR YOU
                      </span>

                      <h3>Suitable hospitals</h3>
                    </div>

                    <button>
                      View all
                      <ArrowUp size={14} />
                    </button>
                  </div>

                  <div className={styles.matchCards}>
                    {SAMPLE_MATCHES.map((hospital) => (
                      <article key={hospital.id} className={styles.matchCard}>
                        <div className={styles.matchTop}>
                          <div className={styles.hospitalIcon}>
                            <Hospital size={19} />
                          </div>

                          <div className={styles.matchScore}>
                            <strong>{hospital.match}%</strong>

                            <span>match</span>
                          </div>
                        </div>

                        <div className={styles.hospitalInfo}>
                          <h4>{hospital.name}</h4>

                          <p>{hospital.specialty}</p>
                        </div>

                        <div className={styles.hospitalMeta}>
                          <span>
                            <MapPin size={14} />
                            {hospital.distance}
                          </span>

                          <span>
                            <Activity size={14} />
                            {hospital.time}
                          </span>
                        </div>

                        <div className={styles.matchFooter}>
                          <span>{hospital.cost}</span>

                          <span className={styles.insurance}>
                            <CheckCircle2 size={13} />
                            {hospital.insurance}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              COMPOSER
          ================================================= */}

          <div className={styles.composerArea}>
            <div className={styles.composerInner}>
              <div className={styles.composer}>
                {/* PDF */}

                <button
                  className={styles.composerIcon}
                  onClick={openPdfPicker}
                  aria-label="Upload PDF medical report"
                  title="Upload PDF report"
                >
                  <Paperclip size={19} />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSend();
                    }
                  }}
                  placeholder={
                    isTranscribing
                      ? "Understanding your voice..."
                      : "Describe your healthcare requirement..."
                  }
                  aria-label="Message Vital Assistant"
                />

                {/* VOICE */}

                <button
                  className={`${styles.composerIcon} ${
                    isRecording ? styles.recordingButton : ""
                  }`}
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  aria-label={
                    isRecording ? "Stop recording" : "Start voice input"
                  }
                  title={isRecording ? "Stop recording" : "Voice input"}
                >
                  {isTranscribing ? (
                    <LoaderCircle size={19} className={styles.spinner} />
                  ) : (
                    <Mic size={19} />
                  )}
                </button>

                {/* SEND */}

                <button
                  className={`${styles.sendButton} ${
                    input.trim() ? styles.sendButtonActive : ""
                  }`}
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                >
                  <ArrowUp size={19} />
                </button>
              </div>

              <div className={styles.composerFooter}>
                <span>
                  <Sparkles size={12} />
                  Vital provides informational healthcare guidance and does not
                  replace a qualified healthcare professional.
                </span>

                <button>
                  <Stethoscope size={13} />

                  {currentLanguage.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer
        logo="Vital"
        description="AI-powered healthcare discovery that helps you find and compare hospitals based on your needs."
        email="hello@vitalhealthcare.dev"
        columns={[
          {
            title: "Explore",
            links: [
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Find Hospitals",
                href: "/hospitals",
              },
              {
                label: "Compare Hospitals",
                href: "/compare",
              },
              {
                label: "AI Assistant",
                href: "/chat",
              },
            ],
          },
          {
            title: "Healthcare",
            links: [
              {
                label: "How It Works",
                href: "/#how-it-works",
              },
              {
                label: "Medical Reports",
                href: "/reports",
              },
              {
                label: "Emergency Help",
                href: "/emergency",
              },
              {
                label: "Ambulance",
                href: "/ambulance",
              },
            ],
          },
          {
            title: "About",
            links: [
              {
                label: "Our Mission",
                href: "/#about",
              },
              {
                label: "Team",
                href: "/team",
              },
              {
                label: "Contact",
                href: "/contact",
              },
            ],
          },
        ]}
      />
    </main>
  );
}

export default Chatbot;
