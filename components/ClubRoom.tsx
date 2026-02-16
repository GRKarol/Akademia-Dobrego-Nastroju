import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Send, Image as ImageIcon, BarChart3, Megaphone, 
  Settings, ChevronLeft, Edit2, Save, X, Trash2, Users, 
  ArrowUp, ArrowDown, Archive, ArchiveRestore, Check 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';

interface ClubRoomProps {
  onBack: () => void;
  userCode: string;
  userName: string;
}

interface AccessCode {
  id?: string;
  value: string;
  role: 'member' | 'admin';
}

interface Message {
  id?: string;
  userName: string;
  text: string;
  image?: string | null;
  timestamp: number;
  userCode: string;
  isPoll?: boolean;
  pollOptions?: string[];
  pollVotes?: { [option: string]: string[] };
  isAnnouncement?: boolean;
}

interface AdnEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string | null;
  timestamp: number;
  order: number;
  isArchived?: boolean;
}

interface AdnUser {
  id?: string;
  code: string;
  name: string;
  role: 'member' | 'admin';
  joinedAt: number;
}

const ClubRoom: React.FC<ClubRoomProps> = ({ onBack, userCode, userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [userRole, setUserRole] = useState<'member' | 'admin'>('member');
  const [showManagement, setShowManagement] = useState(false);
  const [managementTab, setManagementTab] = useState<'events' | 'codes' | 'users'>('events');

  const [adnEvents, setAdnEvents] = useState<AdnEvent[]>([]);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImage, setNewEventImage] = useState<string | null>(null);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDesc, setEditEventDesc] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventImage, setEditEventImage] = useState<string | null>(null);

  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [newCodeValue, setNewCodeValue] = useState('');
  const [newCodeRole, setNewCodeRole] = useState<'member' | 'admin'>('member');

  const [adnUsers, setAdnUsers] = useState<AdnUser[]>([]);
  const [allUsers, setAllUsers] = useState<{ code: string; name: string }[]>([]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'message' | 'event' | 'code' | 'user' } | null>(null);

  const [showArchived, setShowArchived] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const codesQuery = query(collection(db, 'access_codes'));
    const unsubscribeCodes = onSnapshot(codesQuery, (snapshot) => {
      const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessCode));
      setAccessCodes(codesData);
      const currentUserCode = codesData.find(c => c.value === userCode.toLowerCase());
      if (currentUserCode) setUserRole(currentUserCode.role);
    });

    const messagesQuery = query(collection(db, 'club_messages'), orderBy('timestamp', 'asc'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messagesData);
    });

    const eventsQuery = query(collection(db, 'adn_events'), orderBy('order', 'asc'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdnEvent));
      setAdnEvents(eventsData);
    });

    const usersQuery = query(collection(db, 'adn_users'), orderBy('joinedAt', 'asc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdnUser));
      setAdnUsers(usersData);
    });

    const allUsersQuery = query(collection(db, 'users'));
    const unsubscribeAllUsers = onSnapshot(allUsersQuery, (snapshot) => {
      const allUsersData = snapshot.docs.map(doc => doc.data() as { code: string; name: string });
      setAllUsers(allUsersData);
    });

    return () => {
      unsubscribeCodes();
      unsubscribeMessages();
      unsubscribeEvents();
      unsubscribeUsers();
      unsubscribeAllUsers();
    };
  }, [userCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64;
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setSelectedImage(compressed);
        setShowImagePreview(true);
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    try {
      await addDoc(collection(db, 'club_messages'), {
        userName,
        userCode,
        text: newMessage,
        image: selectedImage || null,
        timestamp: Date.now(),
        isPoll: false,
        isAnnouncement: false,
      });
      setNewMessage('');
      setSelectedImage(null);
      setShowImagePreview(false);
    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
    }
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) return;
    const validOptions = pollOptions.filter(o => o.trim());
    try {
      const pollVotes: { [option: string]: string[] } = {};
      validOptions.forEach(option => {
        pollVotes[option] = [];
      });
      await addDoc(collection(db, 'club_messages'), {
        userName,
        userCode,
        text: pollQuestion,
        timestamp: Date.now(),
        isPoll: true,
        pollOptions: validOptions,
        pollVotes,
        isAnnouncement: false,
      });
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollCreator(false);
    } catch (error) {
      console.error('Błąd tworzenia ankiety:', error);
    }
  };

  const handleVote = async (messageId: string, option: string, currentVotes: { [option: string]: string[] }) => {
    try {
      const newVotes = { ...currentVotes };
      Object.keys(newVotes).forEach(key => {
        newVotes[key] = newVotes[key].filter(code => code !== userCode);
      });
      if (!newVotes[option].includes(userCode)) {
        newVotes[option].push(userCode);
      }
      const messageRef = doc(db, 'club_messages', messageId);
      await updateDoc(messageRef, { pollVotes: newVotes });
    } catch (error) {
      console.error('Błąd głosowania:', error);
    }
  };

  const createAdnEvent = async () => {
    if (!newEventTitle || !newEventDesc) return;
    try {
      const maxOrder = adnEvents.length > 0 ? Math.max(...adnEvents.map(e => e.order)) : -1;
      await addDoc(collection(db, 'adn_events'), {
        title: newEventTitle,
        description: newEventDesc,
        date: newEventDate || 'Wkrótce w Akademii',
        image: newEventImage || null,
        timestamp: Date.now(),
        order: maxOrder + 1,
        isArchived: false,
      });
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setNewEventImage(null);
      setShowEventCreator(false);
    } catch (error) {
      console.error('Błąd tworzenia wydarzenia:', error);
    }
  };

  const updateAdnEvent = async (eventId: string) => {
    if (!editEventTitle || !editEventDesc) return;
    try {
      const eventRef = doc(db, "adn_events", eventId);
      await updateDoc(eventRef, {
        title: editEventTitle,
        description: editEventDesc,
        date: editEventDate || "Wkrótce w Akademii",
        image: editEventImage || null,
      });
      setEditingEventId(null);
      setEditEventTitle('');
      setEditEventDesc('');
      setEditEventDate('');
      setEditEventImage(null);
    } catch (e) {
      console.error("Błąd aktualizacji:", e);
      alert("Nie udało się zaktualizować wydarzenia.");
    }
  };

  const moveEventUp = async (eventId: string, currentOrder: number) => {
    const targetEvent = adnEvents.find(e => e.order === currentOrder - 1);
    if (!targetEvent) return;
    try {
      await updateDoc(doc(db, 'adn_events', eventId), { order: currentOrder - 1 });
      await updateDoc(doc(db, 'adn_events', targetEvent.id), { order: currentOrder });
    } catch (error) {
      console.error('Błąd zmiany kolejności:', error);
    }
  };

  const moveEventDown = async (eventId: string, currentOrder: number) => {
    const targetEvent = adnEvents.find(e => e.order === currentOrder + 1);
    if (!targetEvent) return;
    try {
      await updateDoc(doc(db, 'adn_events', eventId), { order: currentOrder + 1 });
      await updateDoc(doc(db, 'adn_events', targetEvent.id), { order: currentOrder });
    } catch (error) {
      console.error('Błąd zmiany kolejności:', error);
    }
  };

  const toggleArchiveEvent = async (eventId: string, currentStatus: boolean) => {
    try {
      const eventRef = doc(db, "adn_events", eventId);
      if (currentStatus) {
        // Przywracanie - resetuj timestamp, aby odliczyć 4 tygodnie od nowa
        await updateDoc(eventRef, { 
          isArchived: false, 
          timestamp: Date.now() 
        });
      } else {
        // Archiwizacja - zachowaj obecny timestamp
        await updateDoc(eventRef, { isArchived: true });
      }
    } catch (e) {
      console.error("Błąd archiwizacji:", e);
      alert("Nie udało się zmienić statusu archiwum.");
    }
  };

  const addAccessCode = async () => {
    if (!newCodeValue.trim()) return;
    try {
      await addDoc(collection(db, 'access_codes'), {
        value: newCodeValue.toLowerCase(),
        role: newCodeRole,
      });
      setNewCodeValue('');
      setNewCodeRole('member');
    } catch (error) {
      console.error('Błąd dodawania kodu:', error);
    }
  };

  const updateUserName = async (userId: string) => {
    if (!editUserName.trim()) return;
    try {
      const userRef = doc(db, 'adn_users', userId);
      await updateDoc(userRef, { name: editUserName });
      setEditingUserId(null);
      setEditUserName('');
    } catch (error) {
      console.error('Błąd aktualizacji użytkownika:', error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { id, type } = itemToDelete;
      if (type === 'message') {
        await deleteDoc(doc(db, 'club_messages', id));
      } else if (type === 'event') {
        await deleteDoc(doc(db, 'adn_events', id));
      } else if (type === 'code') {
        await deleteDoc(doc(db, 'access_codes', id));
      } else if (type === 'user') {
        await deleteDoc(doc(db, 'adn_users', id));
      }
      setItemToDelete(null);
    } catch (error) {
      console.error('Błąd usuwania:', error);
    }
  };

  const activeEvents = adnEvents.filter(e => !e.isArchived);
  const archivedEvents = adnEvents.filter(e => e.isArchived);
  const displayedEvents = showArchived ? archivedEvents : activeEvents;

  return (
    <div className="min-h-screen bg-[#1A0F0A] text-[#FAF9F6] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-500 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-600 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors"
            whileHover={{ x: -4 }}
          >
            <ChevronLeft size={24} />
            <span className="font-serif italic text-lg">Powrót</span>
          </motion.button>

          {userRole === 'admin' && (
            <motion.button
              onClick={() => setShowManagement(!showManagement)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600/20 to-amber-500/20 hover:from-amber-600/30 hover:to-amber-500/30 border border-amber-500/30 rounded-sm text-amber-200 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings size={20} />
              <span className="font-medium">Zarządzaj</span>
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!showManagement ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 bg-[#2A1F1A]/50 backdrop-blur-sm border border-amber-500/20 rounded-sm p-6 flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-sm ${
                        msg.isAnnouncement
                          ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/20 border border-amber-400/40'
                          : 'bg-[#1A0F0A]/50 border border-amber-500/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-amber-300">{msg.userName}</span>
                        <span className="text-xs text-amber-200/50">
                          {new Date(msg.timestamp).toLocaleString('pl-PL')}
                        </span>
                      </div>

                      {msg.isPoll ? (
                        <div>
                          <p className="mb-3 text-amber-100">{msg.text}</p>
                          <div className="space-y-2">
                            {msg.pollOptions?.map((option) => {
                              const votes = msg.pollVotes?.[option] || [];
                              const totalVotes = Object.values(msg.pollVotes || {}).reduce(
                                (sum, votes) => sum + votes.length,
                                0
                              );
                              const percentage =
                                totalVotes > 0 ? Math.round((votes.length / totalVotes) * 100) : 0;
                              const hasVoted = votes.includes(userCode);

                              return (
                                <motion.button
                                  key={option}
                                  onClick={() => handleVote(msg.id!, option, msg.pollVotes!)}
                                  className={`w-full text-left p-3 rounded-sm border transition-all ${
                                    hasVoted
                                      ? 'bg-amber-500/30 border-amber-400/50'
                                      : 'bg-[#2A1F1A]/50 border-amber-500/20 hover:border-amber-400/40'
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-amber-100">{option}</span>
                                    <span className="text-xs text-amber-300 font-medium">
                                      {percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#1A0F0A]/50 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.5 }}
                                    />
                                  </div>
                                  <span className="text-xs text-amber-200/70 mt-1 block">
                                    {votes.length} {votes.length === 1 ? 'głos' : 'głosów'}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-amber-100 whitespace-pre-wrap">{msg.text}</p>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Załącznik"
                              className="mt-3 rounded-sm max-w-full h-auto border border-amber-500/20"
                            />
                          )}
                        </>
                      )}

                      {userRole === 'admin' && (
                        <button
                          onClick={() => setItemToDelete({ id: msg.id!, type: 'message' })}
                          className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Usuń wiadomość
                        </button>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {showImagePreview && selectedImage && (
                  <div className="mb-4 relative">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="max-h-32 rounded-sm border border-amber-500/30"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setShowImagePreview(false);
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Napisz wiadomość..."
                    className="flex-1 bg-[#1A0F0A]/50 border border-amber-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30 focus:outline-none focus:border-amber-400/50"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className="px-4 py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-sm text-amber-200 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ImageIcon size={20} />
                  </motion.button>
                  <motion.button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-sm text-white font-medium transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {userRole === 'admin' && (
                  <>
                    <motion.button
                      onClick={() => setShowPollCreator(!showPollCreator)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 border border-blue-500/30 rounded-sm text-blue-200 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BarChart3 size={20} />
                      <span className="font-medium">Utwórz Ankietę</span>
                    </motion.button>

                    <AnimatePresence>
                      {showPollCreator && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#2A1F1A]/50 backdrop-blur-sm border border-blue-500/20 rounded-sm p-6 space-y-4"
                        >
                          <input
                            type="text"
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
                            placeholder="Pytanie ankiety..."
                            className="w-full bg-[#1A0F0A]/50 border border-blue-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30"
                          />
                          {pollOptions.map((option, index) => (
                            <input
                              key={index}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...pollOptions];
                                newOptions[index] = e.target.value;
                                setPollOptions(newOptions);
                              }}
                              placeholder={`Opcja ${index + 1}`}
                              className="w-full bg-[#1A0F0A]/50 border border-blue-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30"
                            />
                          ))}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPollOptions([...pollOptions, ''])}
                              className="flex-1 py-2 bg-blue-600/20 border border-blue-500/30 rounded-sm text-blue-200 text-sm"
                            >
                              + Dodaj opcję
                            </button>
                            <button
                              onClick={handleCreatePoll}
                              className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-sm text-white text-sm font-medium"
                            >
                              Utwórz
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <div className="bg-[#2A1F1A]/50 backdrop-blur-sm border border-amber-500/20 rounded-sm p-6">
                  <h3 className="font-serif italic text-xl text-amber-300 mb-4">
                    Członkowie Klubu
                  </h3>
                  <div className="space-y-2">
                    {adnUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 bg-[#1A0F0A]/30 border border-amber-500/10 rounded-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-amber-100 font-medium">{user.name}</p>
                          <p className="text-xs text-amber-200/50">
                            {user.role === 'admin' ? 'Administrator' : 'Członek'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="management"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#2A1F1A]/50 backdrop-blur-sm border border-amber-500/20 rounded-sm p-8"
            >
              <h2 className="font-serif italic text-3xl text-amber-300 mb-6">Panel Zarządzania</h2>

              <div className="flex gap-4 mb-8 border-b border-amber-500/20">
                {['events', 'codes', 'users'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setManagementTab(tab as any)}
                    className={`px-6 py-3 font-medium transition-all ${
                      managementTab === tab
                        ? 'text-amber-300 border-b-2 border-amber-500'
                        : 'text-amber-200/50 hover:text-amber-200'
                    }`}
                  >
                    {tab === 'events' && 'Wydarzenia'}
                    {tab === 'codes' && 'Kody Dostępu'}
                    {tab === 'users' && 'Użytkownicy'}
                  </button>
                ))}
              </div>

              {managementTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowArchived(false)}
                        className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                          !showArchived
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50'
                            : 'bg-[#1A0F0A]/30 text-amber-200/50 border border-amber-500/20 hover:text-amber-200'
                        }`}
                      >
                        Aktywne ({activeEvents.length})
                      </button>
                      <button
                        onClick={() => setShowArchived(true)}
                        className={`px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                          showArchived
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50'
                            : 'bg-[#1A0F0A]/30 text-amber-200/50 border border-amber-500/20 hover:text-amber-200'
                        }`}
                      >
                        Archiwum ({archivedEvents.length})
                      </button>
                    </div>
                    <motion.button
                      onClick={() => setShowEventCreator(!showEventCreator)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600/20 to-green-500/20 hover:from-green-600/30 hover:to-green-500/30 border border-green-500/30 rounded-sm text-green-200 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Megaphone size={20} />
                      <span className="font-medium">Dodaj Nowe</span>
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showEventCreator && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#1A0F0A]/50 border border-green-500/20 rounded-sm p-6 space-y-4 mb-6"
                      >
                        <input
                          type="text"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="Tytuł wydarzenia..."
                          className="w-full bg-[#2A1F1A]/50 border border-green-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30"
                        />
                        <textarea
                          value={newEventDesc}
                          onChange={(e) => setNewEventDesc(e.target.value)}
                          placeholder="Opis wydarzenia..."
                          rows={4}
                          className="w-full bg-[#2A1F1A]/50 border border-green-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30 resize-none"
                        />
                        <input
                          type="text"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          placeholder="Data (np. '15 czerwca 2024')"
                          className="w-full bg-[#2A1F1A]/50 border border-green-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30"
                        />
                        <div>
                          <label className="block mb-2 text-sm text-amber-200/70">
                            Zdjęcie wydarzenia (opcjonalne)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setIsProcessingImage(true);
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  const compressed = await compressImage(reader.result as string);
                                  setNewEventImage(compressed);
                                  setIsProcessingImage(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-sm text-amber-200/70"
                          />
                          {isProcessingImage && (
                            <p className="text-xs text-amber-300 mt-2">Przetwarzanie obrazu...</p>
                          )}
                          {newEventImage && (
                            <img
                              src={newEventImage}
                              alt="Preview"
                              className="mt-3 max-h-40 rounded-sm border border-green-500/30"
                            />
                          )}
                        </div>
                        <button
                          onClick={createAdnEvent}
                          disabled={isProcessingImage}
                          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-sm text-white font-medium transition-all disabled:opacity-50"
                        >
                          Utwórz Wydarzenie
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {displayedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4 p-4 bg-[#1A0F0A]/30 border border-amber-500/10 rounded-sm"
                      >
                        {event.image && (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-sm border border-amber-500/20"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-serif italic text-lg text-amber-300 mb-1">
                            {event.title}
                          </h4>
                          <p className="text-sm text-amber-200/70 mb-2">{event.date}</p>
                          <p className="text-sm text-amber-100 line-clamp-2">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => moveEventUp(event.id, event.order)}
                            disabled={index === 0}
                            className="p-2 text-[#1A0F0A]/20 hover:text-amber-400 hover:bg-amber-500/10 rounded-sm transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Przenieś wyżej"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => moveEventDown(event.id, event.order)}
                            disabled={index === displayedEvents.length - 1}
                            className="p-2 text-[#1A0F0A]/20 hover:text-amber-400 hover:bg-amber-500/10 rounded-sm transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Przenieś niżej"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            onClick={() => toggleArchiveEvent(event.id, event.isArchived || false)}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all ${
                              event.isArchived
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title={event.isArchived ? 'Przywróć z archiwum' : 'Przenieś do archiwum'}
                          >
                            {event.isArchived ? '↩️ Przywróć' : '📦 Archiwum'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingEventId(event.id);
                              setEditEventTitle(event.title);
                              setEditEventDesc(event.description);
                              setEditEventDate(event.date);
                              setEditEventImage(event.image || null);
                            }}
                            className="p-2 text-[#1A0F0A]/20 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                            title="Edytuj wydarzenie"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setItemToDelete({ id: event.id, type: 'event' })}
                            className="p-2 text-[#1A0F0A]/20 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                            title="Usuń wydarzenie"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {managementTab === 'codes' && (
                <div className="space-y-6">
                  <div className="bg-[#1A0F0A]/50 border border-amber-500/20 rounded-sm p-6 space-y-4">
                    <h3 className="font-serif italic text-xl text-amber-300 mb-4">
                      Dodaj Nowy Kod
                    </h3>
                    <input
                      type="text"
                      value={newCodeValue}
                      onChange={(e) => setNewCodeValue(e.target.value)}
                      placeholder="Wpisz kod..."
                      className="w-full bg-[#2A1F1A]/50 border border-amber-500/30 rounded-sm px-4 py-3 text-amber-100 placeholder-amber-300/30"
                    />
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={newCodeRole === 'member'}
                          onChange={() => setNewCodeRole('member')}
                          className="text-amber-500"
                        />
                        <span className="text-amber-200">Członek</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={newCodeRole === 'admin'}
                          onChange={() => setNewCodeRole('admin')}
                          className="text-amber-500"
                        />
                        <span className="text-amber-200">Administrator</span>
                      </label>
                    </div>
                    <button
                      onClick={addAccessCode}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-sm text-white font-medium transition-all"
                    >
                      Dodaj Kod
                    </button>
                  </div>

                  <div className="space-y-3">
                    {accessCodes.map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between p-4 bg-[#1A0F0A]/30 border border-amber-500/10 rounded-sm"
                      >
                        <div>
                          <p className="text-amber-100 font-mono">{code.value}</p>
                          <p className="text-xs text-amber-200/50">
                            {code.role === 'admin' ? 'Administrator' : 'Członek'}
                          </p>
                        </div>
                        <button
                          onClick={() => setItemToDelete({ id: code.id!, type: 'code' })}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-sm transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {managementTab === 'users' && (
                <div className="space-y-3">
                  {adnUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-[#1A0F0A]/30 border border-amber-500/10 rounded-sm"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-medium text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          {editingUserId === user.id ? (
                            <input
                              type="text"
                              value={editUserName}
                              onChange={(e) => setEditUserName(e.target.value)}
                              className="w-full bg-[#2A1F1A]/50 border border-amber-500/30 rounded-sm px-3 py-2 text-amber-100"
                            />
                          ) : (
                            <>
                              <p className="text-amber-100 font-medium">{user.name}</p>
                              <p className="text-xs text-amber-200/50">
                                {user.role === 'admin' ? 'Administrator' : 'Członek'} • Kod:{' '}
                                {user.code}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingUserId === user.id ? (
                          <>
                            <button
                              onClick={() => updateUserName(user.id!)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-sm transition-colors"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingUserId(null);
                                setEditUserName('');
                              }}
                              className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-sm transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingUserId(user.id!);
                                setEditUserName(user.name);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-sm transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: user.id!, type: 'user' })}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-sm transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {itemToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setItemToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A0F0A] border border-amber-500/30 rounded-sm p-8 max-w-md w-full"
            >
              <h3 className="font-serif italic text-2xl text-amber-300 mb-4">
                Potwierdzenie usunięcia
              </h3>
              <p className="text-amber-200/70 mb-6">
                Czy na pewno chcesz usunąć ten element? Ta operacja jest nieodwracalna.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 bg-[#2A1F1A]/50 border border-amber-500/30 rounded-sm text-amber-200 hover:bg-[#2A1F1A] transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-sm text-white font-medium transition-all"
                >
                  Usuń
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingEventId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditingEventId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl p-8 rounded-sm shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-serif italic text-2xl text-[#1A0F0A]">Edytuj Wydarzenie</h3>
                <button
                  onClick={() => setEditingEventId(null)}
                  className="text-[#1A0F0A]/50 hover:text-[#1A0F0A] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <input
                value={editEventTitle}
                onChange={(e) => setEditEventTitle(e.target.value)}
                placeholder="Tytuł..."
                className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/10 rounded-sm p-4 text-[#1A0F0A]"
              />
              <textarea
                value={editEventDesc}
                onChange={(e) => setEditEventDesc(e.target.value)}
                placeholder="Opis..."
                rows={4}
                className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/10 rounded-sm p-4 text-[#1A0F0A] resize-none"
              />
              <input
                value={editEventDate}
                onChange={(e) => setEditEventDate(e.target.value)}
                placeholder="Data"
                className="w-full bg-[#FAF9F6] border border-[#1A0F0A]/10 rounded-sm p-3 text-[#1A0F0A]"
              />
              <div>
                <label className="block mb-2 text-sm text-[#1A0F0A]/70">
                  Zdjęcie wydarzenia (opcjonalne)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsProcessingImage(true);
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const compressed = await compressImage(reader.result as string);
                        setEditEventImage(compressed);
                        setIsProcessingImage(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm text-[#1A0F0A]/70"
                />
                {isProcessingImage && (
                  <p className="text-xs text-amber-600 mt-2">Przetwarzanie obrazu...</p>
                )}
                {editEventImage && (
                  <img
                    src={editEventImage}
                    alt="Preview"
                    className="mt-3 max-h-40 rounded-sm border border-[#1A0F0A]/20"
                  />
                )}
              </div>
              <button
                onClick={() => updateAdnEvent(editingEventId)}
                disabled={isProcessingImage}
                className="w-full py-4 bg-[#1A0F0A] hover:bg-[#2A1F1A] text-white font-medium rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={24} />
                Zapisz Zmiany
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubRoom;
