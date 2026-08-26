import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Layers, 
  Code, 
  Zap, 
  Sparkles,
  Share2,
  BookmarkPlus
} from 'lucide-react';

interface AndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidModal: React.FC<AndroidModalProps> = ({ isOpen, onClose }) => {
  const { isBangla } = useLanguage();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'pwa' | 'apk' | 'compose'>('pwa');

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const bubblewrapCommand = `# 1. Install Google Bubblewrap CLI (Google Chrome TWA generator)
npm install -g @bubblewrap/cli

# 2. Initialize Android APK from your PhysiStep Web App URL
bubblewrap init --manifest="${window.location.origin}/manifest.json"

# 3. Build signed Android APK and AAB for Google Play Store
bubblewrap build`;

  const composeSampleCode = `// MainActivity.kt - Native Jetpack Compose Physics Solver Architecture
package com.physistep.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PhysiStepTheme {
                MainPhysicsScreen()
            }
        }
    }
}

@Composable
fun MainPhysicsScreen() {
    var activeTab by remember { mutableStateOf("ai_solver") }
    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = activeTab == "ai_solver",
                    onClick = { activeTab = "ai_solver" },
                    label = { Text("AI Solver") },
                    icon = { Icon(Icons.Default.AutoAwesome, "Solver") }
                )
                NavigationBarItem(
                    selected = activeTab == "quiz",
                    onClick = { activeTab = "quiz" },
                    label = { Text("Quiz") },
                    icon = { Icon(Icons.Default.Quiz, "Quiz") }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (activeTab) {
                "ai_solver" -> AiSolverView()
                "quiz" -> PhysicsQuizView()
            }
        }
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isBangla ? 'অ্যান্ড্রয়েড সংস্করণ ও ইনস্টলেশন' : 'PhysiStep for Android'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  v1.2 PWA & APK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isBangla 
                  ? 'আপনার অ্যান্ড্রয়েড ডিভাইসে সরাসরি ইনস্টল করুন বা নেটিভ এপিকে (APK) তৈরি করুন।'
                  : 'Install directly on any Android device with 1-tap or package as a standalone APK.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/30 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('pwa')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              activeSubTab === 'pwa'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBangla ? '১-ট্যাপ ইনস্টল (PWA)' : '1-Tap Install (PWA)'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('apk')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              activeSubTab === 'apk'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isBangla ? 'অ্যান্ড্রয়েড APK বিল্ড' : 'Package Android APK'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('compose')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
              activeSubTab === 'compose'
                ? 'bg-slate-800 text-blue-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isBangla ? 'Jetpack Compose কোড' : 'Native Kotlin Code'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
          {activeSubTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">
                    {isBangla ? 'অ্যান্ড্রয়েড ইনস্টলেশন সম্পূর্ণ প্রস্তুত' : 'Android PWA Ready & Configured'}
                  </h4>
                  <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                    {isBangla
                      ? 'অ্যাপটিতে Web App Manifest, Service Worker ক্যাশিং এবং হোমস্ক্রিন আইকন যুক্ত করা হয়েছে। এটি প্লে-স্টোর অ্যাপের মতোই ফুল-স্ক্রিনে চলবে।'
                      : 'The app includes an Android Web Manifest with standalone display mode, offline service worker, responsive touch UI, and high-res launcher icons.'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  {isBangla ? 'অ্যান্ড্রয়েড ফোনে ইনস্টল করার সহজ ৩ ধাপ:' : 'How to install on your Android Phone (3 Easy Steps):'}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div className="font-bold text-white text-xs">{isBangla ? 'ক্রোম ব্রাউজারে খুলুন' : 'Open in Chrome'}</div>
                    <div className="text-[11px] text-slate-400">
                      {isBangla ? 'অ্যান্ড্রয়েডের Chrome ব্রাউজারে এই লিংকটি ওপেন করুন।' : 'Open this Web URL in Google Chrome on your Android phone.'}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div className="font-bold text-white text-xs">{isBangla ? 'মেন্যুতে ট্যাপ করুন (⋮)' : 'Tap Menu (⋮)'}</div>
                    <div className="text-[11px] text-slate-400">
                      {isBangla ? 'উপরে ডানদিকের ৩টি ডটে ট্যাপ করুন।' : 'Tap the three-dots menu icon at the top right of Chrome.'}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div className="font-bold text-white text-xs">{isBangla ? 'ইনস্টল অ্যাপ নির্বাচন করুন' : 'Tap "Install App"'}</div>
                    <div className="text-[11px] text-slate-400">
                      {isBangla ? '"Install app" বা "Add to Home screen" চাপুন।' : 'Select "Install app" or "Add to Home screen" to add PhysiStep icon.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Copy */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="truncate font-mono text-xs text-slate-300">
                  {window.location.href}
                </div>
                <button
                  onClick={() => handleCopy(window.location.href, 'url')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-cyan-400 transition cursor-pointer"
                >
                  {copiedSection === 'url' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'url' ? (isBangla ? 'কপি হয়েছে' : 'Copied!') : (isBangla ? 'লিংক কপি' : 'Copy URL')}</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'apk' && (
            <div className="space-y-4">
              {/* 1-Click Online APK Generator via PWABuilder */}
              <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                        {isBangla ? 'পদ্ধতি ১: সবচেয়ে সহজ (১-ক্লিক অনলাইন)' : 'Method 1: Fastest (1-Click Online)'}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">
                      {isBangla ? 'PWABuilder দিয়ে সরাসরি APK ডাউনলোড করুন' : 'Generate & Download APK with PWABuilder'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isBangla
                        ? 'কোন কোডিং বা অ্যান্ড্রয়েড স্টুডিও ছাড়া অনলাইনে এই অ্যাপের লাইভ লিংক দিয়ে সঙ্গে সঙ্গে ইনস্টলেবল .APK ও গুগল প্লে-স্টোর প্যাকেজ তৈরি করুন।'
                        : 'Generate a downloadable, signed Android APK or Google Play Store package (.aab) online with zero coding or Android Studio setup required.'}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isBangla ? 'PWABuilder এ APK তৈরি করুন (বিনামূল্যে)' : 'Generate Android APK on PWABuilder (Free)'}</span>
                </a>
              </div>

              {/* Method 2: Command Line via Google Bubblewrap CLI */}
              <div className="space-y-2.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-700">
                  {isBangla ? 'পদ্ধতি ২: গুগল বাবলর‌্যাপ সিএলআই (Google Bubblewrap CLI)' : 'Method 2: Google Bubblewrap CLI (Local / Terminal)'}
                </span>
                <p className="text-xs text-slate-300">
                  {isBangla
                    ? 'গুগলের অফিসিয়াল Bubblewrap CLI ব্যবহার করে টার্মিনালে ইনস্টলেবল .apk এবং প্লে-স্টোরের জন্য .aab ফাইল তৈরি করতে নিচের কমান্ডগুলো চালান:'
                    : 'Run these commands in your computer terminal (Node.js & JDK) to build a standalone Android APK and Google Play bundle:'}
                </p>

                <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-cyan-300 overflow-x-auto">
                  <pre>{bubblewrapCommand}</pre>
                  <button
                    onClick={() => handleCopy(bubblewrapCommand, 'bubblewrap')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Copy Commands"
                  >
                    {copiedSection === 'bubblewrap' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBangla ? 'অ্যান্ড্রয়েড ইনস্টলেশন টিপস:' : 'Android Installation Notes:'}</span>
                </div>
                <p className="leading-relaxed">
                  {isBangla
                    ? '• উৎপন্ন APK ফাইলটি ফোনে পাঠিয়ে সরাসরি ইনস্টল করতে পারবেন (Unknown Sources Allow করুন)।'
                    : '• You can transfer the generated .apk file to any Android phone via USB/WhatsApp/Drive and tap to install (enable "Install from Unknown Sources").'}
                </p>
                <p className="leading-relaxed">
                  {isBangla
                    ? '• অথবা ব্রাউজারের "১-ট্যাপ ইনস্টল (PWA)" অপশন ব্যবহার করলে ক্রোম নিজে থেকেই অ্যান্ড্রয়েড সিস্টেম এপিকে (WebAPK) তৈরি করে হোমস্ক্রিনে যুক্ত করে।'
                    : '• Alternatively, the "1-Tap Install (PWA)" tab allows Chrome to generate an automated native WebAPK directly onto your device app drawer without any file transfers.'}
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'compose' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                {isBangla
                  ? 'আপনি যদি সম্পূর্ণ নেটিভ Kotlin ও Jetpack Compose দিয়ে নতুন অ্যান্ড্রয়েড অ্যাপ প্রজেক্ট বানাতে চান, তবে নিচের আর্কিটেকচারটি ব্যবহার করতে পারেন:'
                  : 'If you wish to create a 100% native Android Kotlin application in Android Studio, here is the reference Jetpack Compose architecture:'}
              </p>

              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-blue-300 overflow-x-auto max-h-56">
                <pre>{composeSampleCode}</pre>
                <button
                  onClick={() => handleCopy(composeSampleCode, 'compose')}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Kotlin Code"
                >
                  {copiedSection === 'compose' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isBangla ? 'অ্যান্ড্রয়েড ৮.০+ সকল ফোনে সমর্থিত' : 'Compatible with all Android 8.0+ smartphones & tablets'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            {isBangla ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
