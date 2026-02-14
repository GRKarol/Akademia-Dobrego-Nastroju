import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Send, Image as ImageIcon, BarChart3, Megaphone, User, 
  ShieldCheck, Users, Edit2, Check, X, Plus, MessageSquare, 
  Upload, Loader2, Calendar, MapPin, ArrowUp, ArrowDown, 
  Sparkles, Trash2, Key, Shield, ArrowLeft, Save, ArrowRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, query, onSnapshot, orderBy, addDoc, updateDoc, 
  doc, deleteDoc, setDoc, getDoc, getDocs, limit, arrayUnion 
} from 'firebase/firestore';

interface ClubRoomProps {
  code: string;
  onExit: () => void;
}

interface AccessCode {
  id?: string;
  value: string;
  role: 'member' | 'admin';
}

interface Message {
  id: string;
  sender: string;
  senderCode: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
  type: 'text' | 'image' | 'poll';
  pollOptions?: { label: string; votes: number }[];
  pollVotes?: { userCode: string; userName: string; optionIndex: number }[];
  image?: string;
  isAnnouncement?: boolean;
  isEdited?: boolean;
}

interface AdnEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  timestamp: number;
  order: number;
}

interface AdnUser {
  firstName: string;
  lastName: string;
  code: string;
  isAdmin: boolean;
}

const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const formatText = (input: string) => {
    return input
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)__/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code class="bg-black/5 px-1 rounded text-[#1A0F0A] font-mono text-xs">$1</code>');
  };

  return (
    <div 
      className="text-[#1A0F0A] leading-relaxed text-sm md:text-base break-words whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};

const ClubRoom: React.FC<ClubRoomProps> = ({ code, onExit }) => {
  const [user, setUser] = useState<AdnUser | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [adnEvents, setAdnEvents] = useState<AdnEvent[]>([]);
  const [allUsers, setAllUsers] = useState<AdnUser[]>([]);
  const [validCodes, setValidCodes] = useState<AccessCode[]>([]);
  
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements' | 'management'>('chat');
  const [managementSubTab, setManagementSubTab] = useState<'events' | 'codes' | 'users'>('events');
  
  const [inputText, setInputText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');

  // Confirmation States (replacing window.confirm which is sandboxed)
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'message' | 'event'} | null>(null);

  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showImageCreator, setShowImageCreator] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');
  const [newCodeRole, setNewCodeRole] = useState<'member' | 'admin'>('member');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserFirstName, setEditUserFirstName] = useState('');
  const [editUserLastName, setEditUserLastName] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const userRef = doc(db, "adn_users", code);
  
  // DODAJ ERROR HANDLER!
  const unsubUser = onSnapshot(
    userRef, 
    (snap) => {
      if (snap.exists()) {
        setUser(snap.data() as AdnUser);
      }
    },
    (error) => {
      console.error("❌ Firebase User Error:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      alert(`Błąd Firebase: ${error.message}`);
    }
  );

  const qMessages = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  const unsubMessages = onSnapshot(
    qMessages, 
    (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
      setMessages(msgs);
    },
    (error) => {
      console.error("❌ Firebase Messages Error:", error);
    }
  );

  const qEvents = query(collection(db, "adn_events"), orderBy("order", "asc"));
  const unsubEvents = onSnapshot(
    qEvents, 
    (snap) => {
      const evs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AdnEvent[];
      setAdnEvents(evs);
    },
    (error) => {
      console.error("❌ Firebase Events Error:", error);
    }
  );

  const qCodes = collection(db, "access_codes");
  const unsubCodes = onSnapshot(
    qCodes, 
    (snap) => {
      setValidCodes(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AccessCode[]);
    },
    (error) => {
      console.error("❌ Firebase Codes Error:", error);
    }
  );

  const qAllUsers = collection(db, "adn_users");
  const unsubAllUsers = onSnapshot(
    qAllUsers, 
    (snap) => {
      setAllUsers(snap.docs.map(d => d.data() as AdnUser));
    },
    (error) => {
      console.error("❌ Firebase All Users Error:", error);
    }
  );

  return () => {
    unsubUser();
    unsubMessages();
    unsubEvents();
    unsubCodes();
    unsubAllUsers();
  };
}, [code]);

    const qMessages = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubMessages = onSnapshot(qMessages, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
      setMessages(msgs);
    });

    const qEvents = query(collection(db, "adn_events"), orderBy("order", "asc"));
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      const evs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AdnEvent[];
      setAdnEvents(evs);
    });

    const qCodes = collection(db, "access_codes");
    const unsubCodes = onSnapshot(qCodes, (snap) => {
      setValidCodes(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AccessCode[]);
    });

    const qAllUsers = collection(db, "adn_users");
    const unsubAllUsers = onSnapshot(qAllUsers, (snap) => {
      setAllUsers(snap.docs.map(d => d.data() as AdnUser));
    });

    return () => {
      unsubUser();
      unsubMessages();
      unsubEvents();
      unsubCodes();
      unsubAllUsers();
    };
  }, [code]);
);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
        else if (h > MAX) { w *= MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setSelectedImageBase64(compressed);
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'poll' = 'text', extra?: any) => {
    if (!user) return;
    if (type === 'text' && !inputText.trim()) return;
    
    const messageData = {
      sender: `${user.firstName} ${user.lastName}`,
      senderCode: user.code,
      text: type === 'poll' ? pollQuestion : (type === 'image' ? imageCaption : inputText),
      timestamp: Date.now(),
      isAdmin: user.isAdmin,
      type,
      ...extra
    };

    await addDoc(collection(db, "messages"), messageData);
    
    setInputText(''); setShowPollCreator(false); setShowImageCreator(false); 
    setSelectedImageBase64(null); setImageCaption(''); setPollQuestion(''); setPollOptions(['', '']);
  };

  const handleEditMessage = async (id: string) => {
    const msgRef = doc(db, "messages", id);
    await updateDoc(msgRef, { text: editInput, isEdited: true });
    setEditingMessageId(null);
  };

  const performDeletion = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    
    try {
      if (type === 'message') {
        await deleteDoc(doc(db, "messages", id));
      } else if (type === 'event') {
        await deleteDoc(doc(db, "adn_events", id));
      }
      setItemToDelete(null);
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Wystąpił błąd podczas usuwania.");
    }
  };

  const handleVote = async (msgId: string, optIdx: number) => {
    if (!user) return;
    const msg = messages.find(m => m.id === msgId);
    if (!msg || msg.pollVotes?.some(v => v.userCode === user.code)) return;

    const newOptions = [...(msg.pollOptions || [])];
    newOptions[optIdx].votes++;
    
    const newVotes = [...(msg.pollVotes || []), { 
      userCode: user.code, 
      userName: `${user.firstName} ${user.lastName}`, 
      optionIndex: optIdx 
    }];

    await updateDoc(doc(db, "messages", msgId), {
      pollOptions: newOptions,
      pollVotes: newVotes
    });
  };

  const createAdnEvent = async () => {
    if (!eventTitle || !eventDesc || isCreatingEvent) return;
    setIsCreatingEvent(true);
    try {
      const eventData = {
        title: eventTitle,
        description: eventDesc,
        date: eventDate || "Wkrótce w Akademii",
        location: "Kręta 23, Kłobuck",
        image: selectedImageBase64 || null,
        timestamp: Date.now(),
        order: adnEvents.length
      };
      await addDoc(collection(db, "adn_events"), eventData);
      setEventTitle(''); setEventDesc(''); setEventDate(''); setSelectedImageBase64(null);
      setShowEventCreator(false);
    } catch (e) {
      console.error("Błąd tworzenia wydarzenia:", e);
      alert("Nie udało się utworzyć wydarzenia.");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleUpdateUserName = async (targetCode: string) => {
    if (!editUserFirstName.trim() || !editUserLastName.trim()) return;
    const userRef = doc(db, "adn_users", targetCode);
    await updateDoc(userRef, {
      firstName: editUserFirstName.trim(),
      lastName: editUserLastName.trim()
    });
    setEditingUserId(null);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#FDFBF7] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white border border-[#966F33]/20 p-10 rounded-sm shadow-xl space-y-8">
          <h2 className="font-serif text-3xl text-[#966F33] italic">Przedstaw się.</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const snap = await getDocs(collection(db, "access_codes"));
            const codes = snap.docs.map(d => d.data() as AccessCode);
            const found = codes.find(c => c.value === code);
            const isAdmin = found?.role === 'admin';
            const newUser = { firstName, lastName, code, isAdmin };
            await setDoc(doc(db, "adn_users", code), newUser);
            setUser(newUser);
          }} className="space-y-6">
            <input type="text" placeholder="Imię" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-transparent border-b border-[#2C1810]/20 py-3 text-[#2C1810] outline-none focus:border-[#966F33]" required />
            <input type="text" placeholder="Nazwisko" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-transparent border-b border-[#2C1810]/20 py-3 text-[#2C1810] outline-none focus:border-[#966F33]" required />
            <button className="w-full py-4 bg-[#966F33] text-white font-serif italic text-lg rounded-sm hover:bg-[#8B4513] transition-all shadow-md">Wejdź do Klubu Nuty</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#EADDCA] flex flex-col md:flex-row overflow-hidden w-full h-full text-[#1A0F0A]">
      
      {/* CUSTOM CONFIRMATION MODAL (Bypassing Sandboxed window.confirm) */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 max-w-sm w-full rounded-sm shadow-2xl space-y-6 border border-[#1A0F0A]/10 text-center"
            >
              <Trash2 size={48} className="mx-auto text-red-500 mb-2" />
              <h3 className="font-serif text-2xl italic text-[#1A0F0A]">Potwierdź usunięcie</h3>
              <p className="text-sm text-[#1A0F0A]/60 leading-relaxed">Czy na pewno chcesz trwale usunąć ten element? Tej akcji nie można cofnąć.</p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 border border-[#1A0F0A]/10 text-[10px] uppercase font-bold tracking-widest hover:bg-black/5 rounded-sm">Anuluj</button>
                <button onClick={performDeletion} className="flex-1 py-3 bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-red-700 rounded-sm shadow-lg">Usuń trwale</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-[#F5F2EB] border-b md:border-b-0 md:border-r border-[#1A0F0A]/10 flex md:flex-col justify-between shrink-0 shadow-sm">
        <div className="flex md:flex-col items-center md:items-stretch w-full">
          <div className="hidden md:block p-6 text-center border-b border-[#1A0F0A]/5">
            <h1 className="font-serif text-2xl text-[#1A0F0A]">Klub Nuty</h1>
          </div>
          <nav className="flex md:flex-col flex-1 px-2 md:px-4 py-2 md:py-4 md:space-y-2 w-full overflow-x-auto no-scrollbar md:overflow-visible">
            <button 
              onClick={onExit}
              className="flex-1 md:w-full flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-3 rounded-sm text-[#1A0F0A]/60 hover:text-[#1A0F0A] hover:bg-white/50 transition-all border border-transparent md:mb-4 shrink-0"
            >
              <ArrowLeft size={18} className="text-[#1A0F0A]" />
              <span className="font-serif italic text-[10px] md:text-sm mt-1 md:mt-0 uppercase tracking-widest text-[#1A0F0A]">Powrót</span>
            </button>

            <button onClick={() => setActiveTab('chat')} className={`flex-1 md:w-full flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-3 rounded-sm ${activeTab === 'chat' ? 'text-[#1A0F0A] bg-white shadow-sm font-bold' : 'text-[#1A0F0A]/40 hover:text-[#1A0F0A]'}`}>
              <MessageSquare size={18} className={activeTab === 'chat' ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40'} /><span className="font-serif italic text-[10px] md:text-sm mt-1 md:mt-0">Czat</span>
            </button>
            <button onClick={() => setActiveTab('announcements')} className={`flex-1 md:w-full flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-3 rounded-sm ${activeTab === 'announcements' ? 'text-[#1A0F0A] bg-white shadow-sm font-bold' : 'text-[#1A0F0A]/40 hover:text-[#1A0F0A]'}`}>
              <Megaphone size={18} className={activeTab === 'announcements' ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40'} /><span className="font-serif italic text-[10px] md:text-sm mt-1 md:mt-0">Ogłoszenia</span>
            </button>
            {user.isAdmin && (
              <button onClick={() => setActiveTab('management')} className={`flex-1 md:w-full flex flex-col md:flex-row items-center md:space-x-4 p-2 md:p-3 rounded-sm ${activeTab === 'management' ? 'text-[#1A0F0A] bg-white shadow-sm font-bold' : 'text-[#1A0F0A]/40 hover:text-[#1A0F0A]'}`}>
                <Shield size={18} className={activeTab === 'management' ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40'} /><span className="font-serif italic text-[10px] md:text-sm mt-1 md:mt-0 whitespace-nowrap">Zarządzaj</span>
              </button>
            )}
          </nav>
        </div>
        <div className="p-4 border-t border-[#1A0F0A]/5 flex flex-col space-y-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.isAdmin ? 'bg-[#1A0F0A]/10 text-[#1A0F0A]' : 'bg-black/5 text-[#1A0F0A]/60'}`}>
              {user.isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-serif italic text-xs text-[#1A0F0A] truncate font-bold">{user.firstName} {user.lastName}</p>
              <p className="text-[8px] text-[#1A0F0A]/30 uppercase tracking-widest">{user.isAdmin ? 'Założyciel' : 'Klubowicz'}</p>
            </div>
          </div>
          <button onClick={onExit} className="w-full py-2 border border-[#1A0F0A]/10 text-[#1A0F0A]/60 text-[10px] uppercase tracking-widest hover:text-red-600 transition-all rounded-sm font-bold">Wyloguj</button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative bg-[#FDFBF7] overflow-hidden">
        {activeTab === 'management' && user.isAdmin ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-[#1A0F0A]/5 bg-[#F5F2EB] px-2 md:px-6 overflow-x-auto no-scrollbar">
               <button onClick={()=>setManagementSubTab('events')} className={`py-4 px-4 md:px-6 font-serif italic text-xs md:text-sm border-b-2 transition-all whitespace-nowrap ${managementSubTab === 'events' ? 'border-[#1A0F0A] text-[#1A0F0A] font-bold' : 'border-transparent text-[#1A0F0A]/40'}`}>Wydarzenia</button>
               <button onClick={()=>setManagementSubTab('codes')} className={`py-4 px-4 md:px-6 font-serif italic text-xs md:text-sm border-b-2 transition-all whitespace-nowrap ${managementSubTab === 'codes' ? 'border-[#1A0F0A] text-[#1A0F0A] font-bold' : 'border-transparent text-[#1A0F0A]/40'}`}>Klucze</button>
               <button onClick={()=>setManagementSubTab('users')} className={`py-4 px-4 md:px-6 font-serif italic text-xs md:text-sm border-b-2 transition-all whitespace-nowrap ${managementSubTab === 'users' ? 'border-[#1A0F0A] text-[#1A0F0A] font-bold' : 'border-transparent text-[#1A0F0A]/40'}`}>Użytkownicy</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar relative bg-[#FDFBF7]">
               {/* MODAL KREATORA WYDARZEŃ */}
               <AnimatePresence>
                 {showEventCreator && (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-white w-full max-w-2xl p-8 rounded-sm shadow-2xl space-y-6">
                       <div className="flex justify-between items-center border-b border-[#1A0F0A]/5 pb-4">
                         <h3 className="font-serif italic text-2xl text-[#1A0F0A]">Nowe Wydarzenie</h3>
                         <button onClick={()=>setShowEventCreator(false)} className="text-[#1A0F0A]/40 hover:text-[#1A0F0A] transition-colors"><X size={24}/></button>
                       </div>
                       <div className="grid gap-6">
                         <input value={eventTitle} onChange={e=>setEventTitle(e.target.value)} placeholder="Tytuł wydarzenia..." className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/10 p-4 font-serif italic text-lg outline-none focus:border-[#1A0F0A]/30 rounded-sm text-[#1A0F0A]" />
                         <textarea value={eventDesc} onChange={e=>setEventDesc(e.target.value)} placeholder="Opis wydarzenia..." className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/10 p-4 text-sm outline-none focus:border-[#1A0F0A]/30 rounded-sm min-h-[150px] text-[#1A0F0A]" />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] uppercase tracking-widest text-[#1A0F0A]/40 font-bold ml-1">Data</label>
                               <input value={eventDate} onChange={e=>setEventDate(e.target.value)} placeholder="np. 12 marca, 19:00" className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/10 p-3 text-sm rounded-sm outline-none text-[#1A0F0A]" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] uppercase tracking-widest text-[#1A0F0A]/40 font-bold ml-1">Zdjęcie (opcjonalnie)</label>
                               <label className="w-full h-[46px] border border-[#1A0F0A]/10 flex items-center justify-center cursor-pointer hover:bg-black/5 transition-all rounded-sm text-[10px] uppercase font-bold text-[#1A0F0A]">
                                  {selectedImageBase64 ? "Zdjęcie wybrane ✓" : "Wybierz plik"}
                                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                               </label>
                            </div>
                         </div>
                       </div>
                       <button 
                        onClick={createAdnEvent} 
                        disabled={isCreatingEvent}
                        className="w-full py-4 bg-[#1A0F0A] text-white font-serif italic text-xl rounded-sm hover:bg-[#331c12] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
                       >
                        {isCreatingEvent ? <Loader2 size={24} className="animate-spin" /> : <span>Opublikuj Wydarzenie</span>}
                       </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="max-w-4xl mx-auto space-y-8">
                  {managementSubTab === 'events' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl md:text-2xl font-serif italic text-[#1A0F0A]">Wydarzenia Premium</h3>
                        <button onClick={()=>setShowEventCreator(true)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest bg-[#1A0F0A] text-white px-6 py-3 font-bold w-full sm:w-auto justify-center rounded-sm shadow-md transition-all hover:bg-[#331c12]">
                          <Plus size={16}/> Dodaj Nowe
                        </button>
                      </div>
                      <div className="grid gap-4">
                        {adnEvents.map((ev, i) => (
                          <div key={ev.id} className="bg-white border border-[#1A0F0A]/5 p-4 flex items-center justify-between group rounded-sm shadow-sm">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <span className="text-[#1A0F0A] font-serif italic w-6 shrink-0 font-bold">{i+1}.</span>
                              <div className="overflow-hidden">
                                <h4 className="text-[#1A0F0A] font-serif italic truncate text-sm md:text-base font-bold">{ev.title}</h4>
                                <p className="text-[10px] text-[#1A0F0A]/40 uppercase tracking-widest">{ev.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={async ()=>{ if(i > 0) { const prev = adnEvents[i-1]; await updateDoc(doc(db, "adn_events", ev.id), { order: i - 1 }); await updateDoc(doc(db, "adn_events", prev.id), { order: i }); } }} className="p-2 text-[#1A0F0A]/20 hover:text-[#1A0F0A] transition-colors"><ArrowUp size={16}/></button>
                              <button 
                                onClick={() => setItemToDelete({id: ev.id, type: 'event'})} 
                                className="p-2 text-[#1A0F0A]/20 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                title="Usuń wydarzenie"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {managementSubTab === 'codes' && (
                    <div className="space-y-6">
                      <h3 className="text-xl md:text-2xl font-serif italic text-[#1A0F0A]">Klucze Dostępu</h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input value={newCodeInput} onChange={e=>setNewCodeInput(e.target.value)} placeholder="Nowy kod..." className="flex-1 bg-white border border-[#1A0F0A]/10 p-3 text-[#1A0F0A] outline-none focus:border-[#1A0F0A] text-sm rounded-sm shadow-inner"/>
                        <select value={newCodeRole} onChange={e=>setNewCodeRole(e.target.value as any)} className="bg-white border border-[#1A0F0A]/10 p-3 text-[#1A0F0A] outline-none text-sm rounded-sm">
                          <option value="member">Klubowicz</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={async ()=>{ if(!newCodeInput) return; await addDoc(collection(db, "access_codes"), { value: newCodeInput.toLowerCase().trim(), role: newCodeRole }); setNewCodeInput(''); }} className="bg-[#1A0F0A] text-white px-8 py-3 sm:py-0 font-bold uppercase text-[10px] tracking-widest shrink-0 rounded-sm shadow-md transition-all hover:bg-[#331c12]">Dodaj</button>
                      </div>
                      <div className="grid gap-3">
                        {validCodes.map(c => (
                          <div key={c.id} className="bg-white p-4 flex justify-between items-center border border-[#1A0F0A]/10 rounded-sm shadow-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Key size={14} className="text-[#1A0F0A] shrink-0"/> 
                              <span className="text-[#1A0F0A] font-mono text-sm truncate font-bold">{c.value}</span> 
                              <span className="text-[10px] uppercase text-[#1A0F0A]/40 shrink-0 font-bold">({c.role})</span>
                            </div>
                            <button onClick={async ()=>{ if(c.id) await deleteDoc(doc(db, "access_codes", c.id)); }} className="text-[#1A0F0A]/20 hover:text-red-500 p-1 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {managementSubTab === 'users' && (
                    <div className="space-y-6">
                       <h3 className="text-xl md:text-2xl font-serif italic text-[#1A0F0A]">Zarejestrowane Dusze</h3>
                       <div className="grid gap-3">
                         {allUsers.map((u: AdnUser) => (
                           <div key={u.code} className="bg-white p-4 flex justify-between items-center border border-[#1A0F0A]/10 rounded-sm shadow-sm">
                              {editingUserId === u.code ? (
                                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                  <input value={editUserFirstName} onChange={e=>setEditUserFirstName(e.target.value)} placeholder="Imię" className="flex-1 bg-[#FDFBF7] border border-[#1A0F0A]/30 p-2 text-[#1A0F0A] text-sm rounded-sm" />
                                  <input value={editUserLastName} onChange={e=>setEditUserLastName(e.target.value)} placeholder="Nazwisko" className="flex-1 bg-[#FDFBF7] border border-[#1A0F0A]/30 p-2 text-[#1A0F0A] text-sm rounded-sm" />
                                  <div className="flex gap-2">
                                    <button onClick={()=>handleUpdateUserName(u.code)} className="bg-[#1A0F0A] text-white p-2 rounded-sm shadow-sm transition-all hover:bg-[#331c12]"><Save size={16}/></button>
                                    <button onClick={()=>setEditingUserId(null)} className="text-[#1A0F0A]/40 p-2 hover:text-[#1A0F0A] transition-colors"><X size={16}/></button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="overflow-hidden">
                                    <p className="text-[#1A0F0A] font-serif italic truncate font-bold">{u.firstName} {u.lastName}</p>
                                    <p className="text-[10px] text-[#1A0F0A]/40 uppercase tracking-widest truncate">Kod: {u.code} • {u.isAdmin ? 'Admin' : 'Klubowicz'}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={()=>{ setEditingUserId(u.code); setEditUserFirstName(u.firstName); setEditUserLastName(u.lastName); }} className="text-[#1A0F0A]/20 hover:text-[#1A0F0A] p-1 transition-colors"><Edit2 size={16}/></button>
                                    <button onClick={async ()=>{ await deleteDoc(doc(db, "adn_users", u.code)); }} className="text-[#1A0F0A]/20 hover:text-red-500 p-1 transition-colors"><X size={16}/></button>
                                  </div>
                                </>
                              )}
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        ) : (
          /* VIEW: CHAT & ANNOUNCEMENTS */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F2EB]">
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 no-scrollbar overflow-x-hidden relative bg-[#FAF0E6]">
              <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="font-serif text-xl md:text-3xl text-[#1A0F0A] italic mb-6 font-bold">
                  {activeTab === 'announcements' ? "Ogłoszenia Akademii" : (activeTab === 'chat' ? "Czat Klubu Nuty" : "Akademia Dobrego Nastroju")}
                </h2>
                
                {(activeTab === 'announcements' ? messages.filter(m => m.isAnnouncement) : messages).map((m) => {
                  const isMine = m.senderCode === user.code;
                  const canEdit = isMine && (Date.now() - m.timestamp < 300000) && m.type === 'text';
                  const totalVotes = m.pollOptions?.reduce((a,c)=>a+c.votes, 0) || 0;

                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex flex-col w-full ${isMine ? 'items-end' : 'items-start'} group`}>
                      <div className={`w-full max-w-[95%] md:max-w-[80%] p-5 rounded-sm bg-white border ${m.isAnnouncement ? 'border-l-4 border-[#1A0F0A] shadow-md' : 'border-[#1A0F0A]/5 shadow-sm'} overflow-hidden relative`}>
                        <div className="flex justify-between items-center mb-4">
                           <span className={`text-[9px] uppercase tracking-widest font-bold ${isMine ? 'text-[#1A0F0A]' : (m.isAdmin ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40')}`}>
                             {m.sender} {m.isAdmin && '• ADN'}
                           </span>
                           <span className="text-[8px] text-[#1A0F0A]/20 font-bold">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        
                        {editingMessageId === m.id ? (
                          <div className="space-y-4">
                            <textarea value={editInput} onChange={e=>setEditInput(e.target.value)} className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/20 p-3 text-[#1A0F0A] outline-none rounded-sm min-h-[100px] text-sm" autoFocus />
                            <div className="flex gap-4">
                              <button onClick={()=>setEditingMessageId(null)} className="text-[10px] uppercase text-[#1A0F0A]/40 font-bold hover:text-[#1A0F0A] transition-colors">Anuluj</button>
                              <button onClick={()=>handleEditMessage(m.id)} className="bg-[#1A0F0A] text-white px-4 py-1.5 text-[10px] font-bold uppercase shadow-md rounded-sm transition-all hover:bg-[#331c12]">Zapisz</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {m.type === 'image' && m.image && <img src={m.image} className="w-full rounded-sm border border-[#1A0F0A]/5 shadow-sm" />}
                            {m.type === 'poll' && m.pollOptions && (
                              <div className="space-y-3">
                                <p className="font-serif italic text-base md:text-lg text-[#1A0F0A] mb-2 font-bold">{m.text}</p>
                                {m.pollOptions.map((opt, i) => {
                                  const perc = totalVotes === 0 ? 0 : Math.round((opt.votes/totalVotes)*100);
                                  const hasVoted = m.pollVotes?.some(v => v.userCode === user.code);
                                  return (
                                    <button key={i} onClick={()=>handleVote(m.id, i)} disabled={hasVoted} className="w-full relative h-12 bg-[#FAF9F6] border border-[#1A0F0A]/5 rounded-sm overflow-hidden flex items-center justify-between px-4 group/poll transition-all shadow-sm">
                                       <div className="absolute inset-y-0 left-0 bg-[#1A0F0A]/5 transition-all duration-1000" style={{width:`${perc}%`}}/>
                                       <span className="relative text-xs text-[#1A0F0A]/80 font-bold">{opt.label}</span>
                                       <span className="relative text-[10px] font-bold text-[#1A0F0A]">{perc}%</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                            {m.type !== 'poll' && <MarkdownText text={m.text} />}
                          </div>
                        )}

                        <div className={`mt-4 pt-3 border-t border-[#1A0F0A]/5 flex flex-wrap items-center gap-6 transition-opacity ${user.isAdmin ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {user.isAdmin && (
                            <button onClick={async ()=>{ await updateDoc(doc(db, "messages", m.id), { isAnnouncement: !m.isAnnouncement }); }} className={`flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold ${m.isAnnouncement ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/20 hover:text-[#1A0F0A]'} transition-all`}>
                              <Megaphone size={12} className="text-[#1A0F0A]" /> <span>{m.isAnnouncement ? 'Odepnij' : 'Przypnij'}</span>
                            </button>
                          )}
                          {canEdit && editingMessageId !== m.id && (
                            <button onClick={()=>{setEditingMessageId(m.id); setEditInput(m.text);}} className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold text-[#1A0F0A]/60 hover:text-[#1A0F0A] transition-all">
                              <Edit2 size={12} className="text-[#1A0F0A]" /> <span>Edytuj</span>
                            </button>
                          )}
                          {user.isAdmin && (
                            <button 
                              onClick={() => setItemToDelete({id: m.id, type: 'message'})} 
                              className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-all"
                              title="Usuń wiadomość"
                            >
                              <Trash2 size={12} className="text-red-500" /> <span>Usuń</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* MESSAGE INPUT AREA */}
            {activeTab === 'chat' && (
              <div className="p-4 md:p-8 bg-white border-t border-[#1A0F0A]/10 relative shadow-2xl">
                <AnimatePresence>
                  {showPollCreator && user.isAdmin && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 right-0 m-4 p-6 bg-white border border-[#1A0F0A]/20 shadow-2xl z-50 rounded-sm">
                       <div className="flex justify-between mb-4"><h3 className="font-serif italic text-[#1A0F0A] text-lg font-bold">Nowa Ankieta</h3><button onClick={()=>setShowPollCreator(false)} className="text-[#1A0F0A]/20 hover:text-[#1A0F0A] transition-colors"><X size={18}/></button></div>
                       <input value={pollQuestion} onChange={e=>setPollQuestion(e.target.value)} placeholder="Pytanie..." className="w-full bg-transparent border-b border-[#1A0F0A]/10 py-2 mb-4 text-[#1A0F0A] outline-none text-sm font-bold"/>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{pollOptions.map((opt, i)=>(<input key={i} value={opt} onChange={e=>{let c=[...pollOptions]; c[i]=e.target.value; setPollOptions(c);}} placeholder={`Opcja ${i+1}`} className="bg-[#FAF9F6] p-2 text-xs text-[#1A0F0A] border border-[#1A0F0A]/5 outline-none focus:border-[#1A0F0A]/30 transition-all rounded-sm shadow-inner font-bold"/>))}</div>
                       <div className="flex justify-between items-center">
                          <button onClick={()=>setPollOptions([...pollOptions, ''])} className="text-[9px] uppercase tracking-widest text-[#1A0F0A]/40 hover:text-[#1A0F0A] transition-colors font-bold">+ Dodaj opcję</button>
                          <button onClick={()=>{ const valid = pollOptions.filter(o => o.trim()); if(pollQuestion && valid.length >= 2) sendMessage('poll', { pollOptions: valid.map(l => ({label:l, votes:0})) }); }} className="bg-[#1A0F0A] text-white px-6 py-2 font-bold text-xs uppercase shadow-lg rounded-sm hover:bg-[#331c12] transition-all">Opublikuj</button>
                       </div>
                    </motion.div>
                  )}
                  {showImageCreator && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 right-0 m-4 p-6 bg-white border border-[#1A0F0A]/5 shadow-2xl z-50 rounded-sm">
                       <div className="flex justify-between mb-4"><h3 className="font-serif italic text-[#1A0F0A] text-lg font-bold">Dodaj zdjęcie</h3><button onClick={()=>setShowImageCreator(false)} className="text-[#1A0F0A]/20 hover:text-[#1A0F0A] transition-colors"><X size={18}/></button></div>
                       <label className="w-full h-32 border border-dashed border-[#1A0F0A]/10 flex flex-col items-center justify-center cursor-pointer mb-4 hover:border-[#1A0F0A]/30 transition-all rounded-sm group overflow-hidden bg-[#FAF9F6]">
                          {selectedImageBase64 ? <img src={selectedImageBase64} className="h-full object-contain"/> : (isProcessingImage ? <Loader2 className="animate-spin text-[#1A0F0A]"/> : <div className="flex flex-col items-center"><Upload size={24} className="text-[#1A0F0A]/40 mb-2 group-hover:text-[#1A0F0A] transition-colors"/><span className="text-[10px] uppercase tracking-widest text-[#1A0F0A]/40 group-hover:text-[#1A0F0A] font-bold transition-colors">Wybierz zdjęcie</span></div>)}
                          <input type="file" onChange={handleFileChange} className="hidden" accept="image/*"/>
                       </label>
                       <input value={imageCaption} onChange={e=>setImageCaption(e.target.value)} placeholder="Opis..." className="w-full bg-[#FAF9F6] p-3 text-[#1A0F0A] outline-none mb-4 text-sm border border-[#1A0F0A]/5 focus:border-[#1A0F0A]/30 rounded-sm shadow-inner font-bold" />
                       <button onClick={()=>sendMessage('image', { image: selectedImageBase64 })} disabled={!selectedImageBase64 || isProcessingImage} className="w-full py-3 bg-[#1A0F0A] text-white font-bold uppercase text-xs disabled:opacity-50 shadow-xl rounded-sm hover:bg-[#331c12] transition-all">Wyślij</button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="max-w-4xl mx-auto flex items-end space-x-2 md:space-x-3 bg-[#FDFBF7] border border-[#1A0F0A]/10 p-2 rounded-sm focus-within:border-[#1A0F0A]/30 transition-all shadow-inner">
                  <textarea value={inputText} onChange={e=>setInputText(e.target.value)} placeholder="Napisz do wspólnoty..." className="flex-1 bg-transparent border-none focus:ring-0 text-[#1A0F0A] p-2 text-sm md:text-base resize-none min-h-[38px] max-h-[120px] outline-none no-scrollbar placeholder:text-[#1A0F0A]/30 font-bold" onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault(); sendMessage();}}} />
                  <div className="flex items-center space-x-1 pb-1">
                    <button onClick={()=>{setShowImageCreator(!showImageCreator); setShowPollCreator(false); setShowEventCreator(false);}} className={`p-2 transition-colors ${showImageCreator ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40 hover:text-[#1A0F0A]'}`} title="Zdjęcie"><ImageIcon size={20} className="text-[#1A0F0A]" /></button>
                    {user.isAdmin && <button onClick={()=>{setShowPollCreator(!showPollCreator); setShowImageCreator(false); setShowEventCreator(false);}} className={`p-2 transition-colors ${showPollCreator ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40 hover:text-[#1A0F0A]'}`} title="Ankieta"><BarChart3 size={20} className="text-[#1A0F0A]" /></button>}
                    {user.isAdmin && <button onClick={()=>{setShowEventCreator(!showEventCreator); setShowPollCreator(false); setShowImageCreator(false);}} className={`p-2 transition-colors ${showEventCreator ? 'text-[#1A0F0A]' : 'text-[#1A0F0A]/40 hover:text-[#1A0F0A]'}`} title="Wydarzenie"><Sparkles size={20} className="text-[#1A0F0A]" /></button>}
                    <button onClick={()=>sendMessage()} className="p-2 md:p-2.5 bg-[#1A0F0A] text-white rounded-sm shadow-lg ml-1 md:ml-2 hover:bg-[#331c12] active:scale-95 transition-all"><Send size={20}/></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubRoom;
