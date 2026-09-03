import { useState, useEffect, useRef, useMemo } from 'react';

const HELP_CATEGORIES = [
    {
        id: 'milk',
        name: 'Milk Production',
        icon: '🥛',
        color: '#38bdf8',
        shortDesc: 'Help related to recording milk production, morning/evening shifts, and yields.',
        tags: ['milk', 'production', 'morning', 'evening', 'yield', 'litres', 'cows', 'buffaloes'],
        faqs: [
            {
                q: "How do I add today's milk production?",
                a: "Navigate to Milk Production from the sidebar and click 'Record Milk'. Select whether you are recording a bulk farm batch or individual animal, choose the shift (Morning or Evening), enter the volume in litres, and submit. The record will appear in today's log."
            },
            {
                q: "How do I edit a production record?",
                a: "If a record contains an error and is still in 'PENDING' status, you can edit the entry from the Milk Production page. Once an entry is verified by the Administrator, adjustments must be requested via a support ticket or directly from the Admin."
            },
            {
                q: "Why is my total production calculation incorrect?",
                a: "The dashboard displays verified entries for the current calendar date (Morning + Evening). Ensure both shifts have been saved and that your device local time and timezone match the farm system."
            },
            {
                q: "Can I track morning and evening milk separately?",
                a: "Yes! Every milk entry requires a shift designation ('MORNING' or 'EVENING'). The Farm Insights card on your dashboard breaks down the exact morning vs evening split automatically."
            }
        ]
    },
    {
        id: 'sales',
        name: 'Milk Sales',
        icon: '💰',
        color: '#34d399',
        shortDesc: 'Sales entry issues, customer billing, rates, and transaction logging.',
        tags: ['sales', 'milk sale', 'rate', 'price', 'billing', 'invoice', 'litres', 'amount'],
        faqs: [
            {
                q: "How do I record a new milk sale?",
                a: "Go to Milk Sales > Record Sale. Choose the registered customer, enter the quantity in litres, and input the price per litre (₹). The system calculates the total amount server-side to guarantee accurate billing."
            },
            {
                q: "How do I handle credit sales vs instant payment?",
                a: "When entering a sale, you can mark the payment status as 'PENDING' for credit customers or 'PAID' if settled immediately in cash or UPI. The amount automatically updates the customer's ledger."
            },
            {
                q: "How do I generate an invoice or receipt?",
                a: "In the Milk Sales list, click on any sale row to view full transaction details, receipt summary, and download or print a formatted billing slip."
            },
            {
                q: "Why can't I delete or modify a past sale?",
                a: "To prevent ledger discrepancies and preserve audit integrity, verified sales are locked. If a cancellation is required, contact the Administrator or submit an issue ticket below."
            }
        ]
    },
    {
        id: 'customers',
        name: 'Customers',
        icon: '👥',
        color: '#818cf8',
        shortDesc: 'Adding or editing customers, delivery history, and pending balances.',
        tags: ['customer', 'client', 'balance', 'profile', 'phone', 'address', 'ledger'],
        faqs: [
            {
                q: "How do I add a new customer?",
                a: "Navigate to Customers from the sidebar and click 'Add Customer'. Fill in their full name, phone number, delivery address, and preferred delivery schedule. An account will be created instantly."
            },
            {
                q: "How can customers log in to view their purchases?",
                a: "Customers registered with a valid email and phone can log in at the login portal to access their personal Customer Dashboard, review daily milk receipts, and check payment status."
            },
            {
                q: "How do I check a customer's outstanding balance?",
                a: "Open the Customers page to view total litres purchased and total outstanding amounts across all customers. Click on any customer to view their complete transaction history."
            },
            {
                q: "How do I update customer contact details or address?",
                a: "Click the edit icon next to the customer in the Customers list, update the phone number or delivery location, and click 'Save Changes'."
            }
        ]
    },
    {
        id: 'payments',
        name: 'Payments',
        icon: '💳',
        color: '#fbbf24',
        shortDesc: 'Payment status, payment methods (Cash/UPI/Bank), and receipt logs.',
        tags: ['payment', 'upi', 'cash', 'bank', 'receipt', 'pending', 'verified', 'transaction'],
        faqs: [
            {
                q: "How do I record a payment?",
                a: "Go to Payments > Record Payment. Select the customer from the dropdown, choose the payment method (Cash, UPI, or Bank Transfer), enter the amount in ₹, and save."
            },
            {
                q: "Why is a payment showing as pending?",
                a: "Payments logged by staff undergo verification by the Administrator to confirm bank reconciliation. Once approved, the status turns to 'VERIFIED' and reflects in financial reports."
            },
            {
                q: "How do I check complete payment history?",
                a: "The Payments page lists all historical payments with filter options by date, customer, payment mode, and verification status. You can export or print reports from the Reports tab."
            },
            {
                q: "What should I do if a duplicate payment was logged?",
                a: "If the payment is pending, the Admin can reject it under 'Verifications'. If already verified, submit an issue report in the 'Report an Issue' tab so our team can reconcile the ledger."
            }
        ]
    },
    {
        id: 'inventory',
        name: 'Inventory',
        icon: '📦',
        color: '#f472b6',
        shortDesc: 'Stock management, low stock alerts, feed, fodder, and medicine tracking.',
        tags: ['inventory', 'stock', 'feed', 'fodder', 'medicine', 'low stock', 'items', 'usage'],
        faqs: [
            {
                q: "How do I add new inventory items?",
                a: "Navigate to Inventory > Add Item. Input the item name, category (Feed, Fodder, Medicine, Equipment, Other), unit of measure (kg, bags, litres), initial quantity, and minimum threshold."
            },
            {
                q: "How do low stock alerts work?",
                a: "When remaining stock falls below the minimum threshold you configured, a badge highlights on the Dashboard and an automatic notification is dispatched to Farm Managers."
            },
            {
                q: "How do I record daily feed consumption or usage?",
                a: "In Inventory, click 'Log Stock Usage'. Select the item, enter the amount used today, and add optional notes. Available stock decreases immediately."
            },
            {
                q: "Can I track medication expiry dates?",
                a: "Yes. When logging medical inventory, you can enter expiry dates and batch numbers to ensure safe herd treatment."
            }
        ]
    },
    {
        id: 'users',
        name: 'Users & Staff',
        icon: '👨‍💼',
        color: '#a78bfa',
        shortDesc: 'User accounts, role permissions (Admin, Manager, Customer), and attendance.',
        tags: ['users', 'staff', 'manager', 'roles', 'permissions', 'attendance', 'timesheet'],
        faqs: [
            {
                q: "How do I add a new farm manager or staff member?",
                a: "Administrators can open 'Users & Staff' and click 'New User'. Enter their name, email, phone, secure password, and assign the 'FARM_MANAGER' role."
            },
            {
                q: "How does manager attendance and timesheet logging work?",
                a: "Managers check in when starting their shift. The Admin can inspect attendance logs, working hours, and daily timesheets under 'Manager Attendance'."
            },
            {
                q: "What permissions does each user role possess?",
                a: "ADMIN has full operational, verification, financial, and user authority. FARM_MANAGER manages livestock, daily milk, sales, and stock usage. CUSTOMER accesses their personal purchase and payment history."
            },
            {
                q: "How do I deactivate or suspend a user?",
                a: "In Users & Staff, locate the user and toggle their status switch between ACTIVE and INACTIVE to revoke system access instantly."
            }
        ]
    },
    {
        id: 'tech',
        name: 'Technical Support',
        icon: '⚙️',
        color: '#38bdf8',
        shortDesc: 'Login problems, dashboard issues, theme toggling, and system errors.',
        tags: ['technical', 'bug', 'error', 'login', 'password', 'theme', 'dark', 'light', 'offline'],
        faqs: [
            {
                q: "I forgot my login password. How can I reset it?",
                a: "Contact Administrator Mani Chandu directly using the 'Contact Admin' tab or submit a ticket under 'Report an Issue' with your registered email for an immediate reset."
            },
            {
                q: "How do I toggle between Dark mode and Light mode?",
                a: "Click the Sun/Moon toggle (☀️/🌙) in the top navbar at any time. The application preserves your preferred theme across browser sessions."
            },
            {
                q: "Why is the dashboard data or weather not updating?",
                a: "Check your internet connection. Live metrics and alerts update through Socket.IO. You can also refresh the browser tab (Ctrl+R / F5) to fetch fresh state."
            },
            {
                q: "How do I report a software bug or unexpected error?",
                a: "Use the 'Report an Issue' tab in this Support Center to submit error details and priority. Our technical team responds within 24 hours."
            }
        ]
    }
];

const INITIAL_MESSAGES = [
    {
        id: 'm1',
        sender: 'support',
        text: "Hello! 👋 Welcome to Kurra Dairy Farm Support.\nPlease describe your issue and we'll help you find the right solution.",
        time: 'Just now'
    }
];

const QUICK_PROMPTS = [
    "How do I log today's milk production?",
    "Why is a customer payment pending?",
    "How do low stock alerts work?",
    "I need help contacting the Administrator"
];

const SupportCenterModal = ({ isOpen, onClose, defaultCategory = null }) => {
    const [activeTab, setActiveTab] = useState('browse');
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaqId, setExpandedFaqId] = useState(null);

    // Chat state
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    // Report Issue Form state
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketCategory, setTicketCategory] = useState('Milk Production');
    const [ticketPriority, setTicketPriority] = useState('Medium');
    const [ticketDescription, setTicketDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Persisted tickets in localStorage
    const [myTickets, setMyTickets] = useState(() => {
        try {
            const saved = localStorage.getItem('kurra_support_tickets');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (defaultCategory) {
            setSelectedCategory(defaultCategory);
            setActiveTab('browse');
        }
    }, [defaultCategory]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, activeTab]);

    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return null;

        const results = [];
        HELP_CATEGORIES.forEach((cat) => {
            cat.faqs.forEach((faq, idx) => {
                const matchQ = faq.q.toLowerCase().includes(query);
                const matchA = faq.a.toLowerCase().includes(query);
                const matchTag = cat.tags.some(t => t.includes(query));
                const matchCat = cat.name.toLowerCase().includes(query);

                if (matchQ || matchA || matchTag || matchCat) {
                    results.push({
                        categoryName: cat.name,
                        categoryIcon: cat.icon,
                        categoryId: cat.id,
                        faqId: `${cat.id}-${idx}`,
                        q: faq.q,
                        a: faq.a
                    });
                }
            });
        });
        return results;
    }, [searchQuery]);

    const handleSendMessage = (textToSend) => {
        const text = (textToSend || chatInput).trim();
        if (!text) return;

        const userMsg = {
            id: 'u_' + Date.now(),
            sender: 'user',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            const lower = text.toLowerCase();
            let reply = "Thanks for reaching out! Our team has noted your question. If you need immediate hands-on assistance, you can also use the 'Report an Issue' tab or call the Administrator.";

            if (lower.includes('milk') || lower.includes('production') || lower.includes('cow') || lower.includes('buffalo') || lower.includes('shift')) {
                reply = "🥛 For Milk Production:\n• Navigate to 'Milk Production' on the sidebar.\n• Click 'Record Milk' to log Morning or Evening yields.\n• Entries automatically update the daily KPIs on the Admin Dashboard.";
            } else if (lower.includes('sale') || lower.includes('price') || lower.includes('invoice') || lower.includes('rate') || lower.includes('bill')) {
                reply = "💰 For Milk Sales:\n• Open 'Milk Sales' and select 'Record Sale'.\n• Select your customer, quantity in litres, and unit price.\n• The total amount is calculated server-side and recorded in the customer's ledger.";
            } else if (lower.includes('customer') || lower.includes('client') || lower.includes('balance') || lower.includes('phone')) {
                reply = "👥 Customer Management:\n• You can register new customers under the 'Customers' section.\n• Each customer profile tracks lifetime purchases, outstanding dues, and payments.";
            } else if (lower.includes('payment') || lower.includes('upi') || lower.includes('cash') || lower.includes('pending') || lower.includes('verified')) {
                reply = "💳 Payment Processing:\n• Log customer payments under 'Payments' > 'Record Payment'.\n• Payments are verified by Administrator Mani Chandu before appearing in final verified revenue.";
            } else if (lower.includes('inventory') || lower.includes('stock') || lower.includes('feed') || lower.includes('medicine')) {
                reply = "📦 Inventory & Feeds:\n• Check stock levels under 'Inventory'.\n• When supplies fall below minimum thresholds, an alert automatically warns the team on the dashboard.";
            } else if (lower.includes('admin') || lower.includes('contact') || lower.includes('mani') || lower.includes('chandu') || lower.includes('call') || lower.includes('phone')) {
                reply = "📞 Direct Administrator Contact:\n• Administrator: Mani Chandu (ADMIN)\n• Helpline: +91 99999 99999\n• Email: chandukurra55@gmail.com\n• Active Hours: 6:00 AM – 9:00 PM IST";
            } else if (lower.includes('bug') || lower.includes('error') || lower.includes('problem') || lower.includes('issue') || lower.includes('broken')) {
                reply = "⚠️ Found an issue?\nPlease switch to the 'Report an Issue' tab in this Support Center. Fill out the short form and our engineering team will inspect the error immediately!";
            } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
                reply = "Hello there! How can I assist with your dairy farm operations today? You can ask about milk production, sales, payments, or report any issues.";
            }

            const botMsg = {
                id: 'b_' + Date.now(),
                sender: 'support',
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setIsTyping(false);
            setMessages((prev) => [...prev, botMsg]);
        }, 850);
    };

    const handleTicketSubmit = (e) => {
        e.preventDefault();
        if (!ticketTitle.trim() || !ticketDescription.trim()) return;

        setIsSubmitting(true);
        setTimeout(() => {
            const newTicket = {
                id: 'KDF-' + Math.floor(10000 + Math.random() * 90000),
                title: ticketTitle.trim(),
                category: ticketCategory,
                priority: ticketPriority,
                description: ticketDescription.trim(),
                status: 'IN_REVIEW',
                createdAt: new Date().toLocaleString()
            };

            const updated = [newTicket, ...myTickets];
            setMyTickets(updated);
            try {
                localStorage.setItem('kurra_support_tickets', JSON.stringify(updated));
            } catch (err) {
                console.error(err);
            }

            setSubmittedTicket(newTicket);
            setIsSubmitting(false);
            setTicketTitle('');
            setTicketDescription('');
        }, 700);
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('chandukurra55@gmail.com');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
    };

    if (!isOpen) return null;

    return (
        <div className="support-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="support-modal-title">
            <div className="support-modal-window" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="support-modal-header">
                    <div className="support-header-left">
                        <div className="support-header-icon">🎧</div>
                        <div>
                            <h3 id="support-modal-title" className="support-modal-title">Help & Support</h3>
                            <p className="support-modal-subtitle">How can we help you today?</p>
                        </div>
                    </div>
                    <button className="support-close-btn" onClick={onClose} aria-label="Close Support Center">✕</button>
                </div>

                {/* Tab Navigation */}
                <div className="support-tabs-bar">
                    <button
                        className={`support-tab-btn ${activeTab === 'browse' ? 'is-active' : ''}`}
                        onClick={() => { setActiveTab('browse'); }}
                    >
                        📚 Knowledge Base
                    </button>
                    <button
                        className={`support-tab-btn ${activeTab === 'chat' ? 'is-active' : ''}`}
                        onClick={() => { setActiveTab('chat'); }}
                    >
                        💬 Chat with Support
                    </button>
                    <button
                        className={`support-tab-btn ${activeTab === 'report' ? 'is-active' : ''}`}
                        onClick={() => { setActiveTab('report'); setSubmittedTicket(null); }}
                    >
                        📝 Report an Issue {myTickets.length > 0 && <span className="support-badge">{myTickets.length}</span>}
                    </button>
                    <button
                        className={`support-tab-btn ${activeTab === 'contact' ? 'is-active' : ''}`}
                        onClick={() => { setActiveTab('contact'); }}
                    >
                        📞 Contact Admin
                    </button>
                </div>

                {/* Modal Body */}
                <div className="support-modal-body">
                    {/* TAB 1: BROWSE TOPICS & FAQS */}
                    {activeTab === 'browse' && (
                        <div className="support-browse-view">
                            {/* Search bar */}
                            <div className="support-search-wrapper">
                                <span className="support-search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="support-search-input"
                                    placeholder="Search help articles, questions, or keywords (e.g. milk, payment, stock)..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (selectedCategory) setSelectedCategory(null);
                                    }}
                                />
                                {searchQuery && (
                                    <button className="support-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                                )}
                            </div>

                            {/* Search Results Display */}
                            {searchResults !== null ? (
                                <div className="support-search-results">
                                    <div className="support-results-header">
                                        Found <strong>{searchResults.length}</strong> help {searchResults.length === 1 ? 'article' : 'articles'} matching "{searchQuery}"
                                    </div>
                                    {searchResults.length === 0 ? (
                                        <div className="support-empty-state">
                                            <span>🔎</span>
                                            <h4>No matching articles found</h4>
                                            <p>Try different keywords or chat directly with our support team.</p>
                                            <button className="btn btn-outline-info btn-sm mt-2" onClick={() => setActiveTab('chat')}>
                                                💬 Ask in Live Chat
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="support-faqs-list">
                                            {searchResults.map((item) => (
                                                <div key={item.faqId} className="support-faq-card">
                                                    <div
                                                        className="support-faq-question"
                                                        onClick={() => setExpandedFaqId(expandedFaqId === item.faqId ? null : item.faqId)}
                                                    >
                                                        <span className="support-faq-badge">{item.categoryIcon} {item.categoryName}</span>
                                                        <strong>{item.q}</strong>
                                                        <span className="support-faq-toggle">{expandedFaqId === item.faqId ? '−' : '+'}</span>
                                                    </div>
                                                    {expandedFaqId === item.faqId && (
                                                        <div className="support-faq-answer">
                                                            <p>{item.a}</p>
                                                            <button
                                                                className="support-ask-chip"
                                                                onClick={() => {
                                                                    setActiveTab('chat');
                                                                    handleSendMessage(item.q);
                                                                }}
                                                            >
                                                                💬 Ask about this in Chat
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : selectedCategory ? (
                                /* Single Category Deep View */
                                (() => {
                                    const cat = HELP_CATEGORIES.find(c => c.id === selectedCategory);
                                    if (!cat) return null;
                                    return (
                                        <div className="support-category-detail">
                                            <div className="support-cat-detail-head">
                                                <button className="support-back-btn" onClick={() => setSelectedCategory(null)}>
                                                    ← Back to all categories
                                                </button>
                                                <div className="support-cat-detail-title">
                                                    <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                                                    <div>
                                                        <h4>Need help with {cat.name}?</h4>
                                                        <p>{cat.shortDesc}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="support-faqs-list">
                                                {cat.faqs.map((faq, idx) => {
                                                    const faqKey = `${cat.id}-${idx}`;
                                                    const isExpanded = expandedFaqId === faqKey;
                                                    return (
                                                        <div key={faqKey} className={`support-faq-card ${isExpanded ? 'is-expanded' : ''}`}>
                                                            <div
                                                                className="support-faq-question"
                                                                onClick={() => setExpandedFaqId(isExpanded ? null : faqKey)}
                                                            >
                                                                <strong>{faq.q}</strong>
                                                                <span className="support-faq-toggle">{isExpanded ? '−' : '+'}</span>
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="support-faq-answer">
                                                                    <p>{faq.a}</p>
                                                                    <div className="d-flex gap-2 flex-wrap mt-3">
                                                                        <button
                                                                            className="support-ask-chip"
                                                                            onClick={() => {
                                                                                setActiveTab('chat');
                                                                                handleSendMessage(faq.q);
                                                                            }}
                                                                        >
                                                                            💬 Ask Support Assistant
                                                                        </button>
                                                                        <button
                                                                            className="support-ask-chip"
                                                                            onClick={() => {
                                                                                setTicketCategory(cat.name);
                                                                                setTicketTitle(`Issue regarding: ${faq.q}`);
                                                                                setActiveTab('report');
                                                                            }}
                                                                        >
                                                                            📝 Open Ticket for this
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                /* Grid of 7 Categories */
                                <div>
                                    <div className="support-section-intro">
                                        <h5>Quick Help Categories</h5>
                                        <p>Select a category to browse step-by-step guidance and common questions:</p>
                                    </div>
                                    <div className="support-category-grid">
                                        {HELP_CATEGORIES.map((cat) => (
                                            <div
                                                key={cat.id}
                                                className="support-category-card"
                                                onClick={() => {
                                                    setSelectedCategory(cat.id);
                                                    setExpandedFaqId(`${cat.id}-0`);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="support-category-icon">{cat.icon}</div>
                                                <div className="support-category-info">
                                                    <h6>{cat.name}</h6>
                                                    <p>{cat.shortDesc}</p>
                                                </div>
                                                <span className="support-category-arrow">→</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom Action Cards */}
                                    <div className="support-quick-actions-row">
                                        <div className="support-action-box" onClick={() => setActiveTab('chat')}>
                                            <span className="support-action-icon">💬</span>
                                            <div>
                                                <strong>Chat with Support</strong>
                                                <small>Ask questions and get instant guidance</small>
                                            </div>
                                        </div>
                                        <div className="support-action-box" onClick={() => setActiveTab('report')}>
                                            <span className="support-action-icon">📝</span>
                                            <div>
                                                <strong>Report an Issue</strong>
                                                <small>Submit a support ticket to our operations team</small>
                                            </div>
                                        </div>
                                        <div className="support-action-box" onClick={() => setActiveTab('contact')}>
                                            <span className="support-action-icon">📞</span>
                                            <div>
                                                <strong>Contact Admin</strong>
                                                <small>Direct phone & email support for urgent farm needs</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: LIVE CHAT SUPPORT */}
                    {activeTab === 'chat' && (
                        <div className="support-chat-container">
                            <div className="support-chat-messages">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`support-chat-bubble-row ${msg.sender === 'user' ? 'is-user' : 'is-support'}`}
                                    >
                                        {msg.sender === 'support' && <div className="support-chat-avatar">🎧</div>}
                                        <div className="support-chat-bubble">
                                            <div className="support-chat-text" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                                            <span className="support-chat-time">{msg.time}</span>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="support-chat-bubble-row is-support">
                                        <div className="support-chat-avatar">🎧</div>
                                        <div className="support-chat-bubble support-typing-bubble">
                                            <span className="support-dot"></span>
                                            <span className="support-dot"></span>
                                            <span className="support-dot"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Quick Suggestion Chips */}
                            <div className="support-chat-suggestions">
                                <span className="suggestions-label">Suggestions:</span>
                                {QUICK_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        className="support-prompt-chip"
                                        onClick={() => handleSendMessage(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <form
                                className="support-chat-input-bar"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                            >
                                <input
                                    type="text"
                                    className="support-chat-input"
                                    placeholder="Type your question or issue here..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="support-chat-send-btn" disabled={!chatInput.trim()}>
                                    Send ➤
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB 3: REPORT AN ISSUE */}
                    {activeTab === 'report' && (
                        <div className="support-report-view">
                            {submittedTicket ? (
                                <div className="support-success-card">
                                    <div className="support-success-icon">✓</div>
                                    <h4>Your support request has been submitted successfully.</h4>
                                    <p>Our team will review it shortly.</p>
                                    <div className="support-ticket-summary">
                                        <div className="ticket-item">
                                            <span>Ticket ID:</span>
                                            <strong>#{submittedTicket.id}</strong>
                                        </div>
                                        <div className="ticket-item">
                                            <span>Title:</span>
                                            <strong>{submittedTicket.title}</strong>
                                        </div>
                                        <div className="ticket-item">
                                            <span>Category:</span>
                                            <strong>{submittedTicket.category}</strong>
                                        </div>
                                        <div className="ticket-item">
                                            <span>Priority:</span>
                                            <span className={`priority-badge ${submittedTicket.priority.toLowerCase()}`}>
                                                {submittedTicket.priority}
                                            </span>
                                        </div>
                                        <div className="ticket-item">
                                            <span>Status:</span>
                                            <span className="status-badge">In Review</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2 justify-content-center mt-4">
                                        <button className="btn btn-primary" onClick={() => setSubmittedTicket(null)}>
                                            + Submit Another Request
                                        </button>
                                        <button className="btn btn-outline-light" onClick={() => setActiveTab('chat')}>
                                            💬 Discuss in Chat
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="support-report-intro">
                                        <h5>Report an Issue / Submit a Ticket</h5>
                                        <p>Encountered a problem or require a manual correction? Submit the details below for fast assistance.</p>
                                    </div>

                                    <form className="support-report-form" onSubmit={handleTicketSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Issue Title <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Brief summary (e.g., Cannot submit evening milk entry)"
                                                value={ticketTitle}
                                                onChange={(e) => setTicketTitle(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Category</label>
                                                <select
                                                    className="form-select"
                                                    value={ticketCategory}
                                                    onChange={(e) => setTicketCategory(e.target.value)}
                                                >
                                                    <option>Milk Production</option>
                                                    <option>Milk Sales</option>
                                                    <option>Customers</option>
                                                    <option>Payments</option>
                                                    <option>Inventory</option>
                                                    <option>Users & Staff</option>
                                                    <option>Technical Support</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Priority</label>
                                                <select
                                                    className="form-select"
                                                    value={ticketPriority}
                                                    onChange={(e) => setTicketPriority(e.target.value)}
                                                >
                                                    <option value="Low">Low - General Question</option>
                                                    <option value="Medium">Medium - Standard Issue</option>
                                                    <option value="High">High - Impeding Daily Work</option>
                                                    <option value="Urgent">Urgent - Critical Livestock/Finance Emergency</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Description <span className="text-danger">*</span></label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                placeholder="Provide detailed steps or context so we can resolve this quickly..."
                                                value={ticketDescription}
                                                onChange={(e) => setTicketDescription(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                            <small className="text-muted">Tickets are reviewed by Farm Administration within 24h.</small>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Existing Tickets List */}
                                    {myTickets.length > 0 && (
                                        <div className="support-existing-tickets mt-5">
                                            <h6>Your Submitted Tickets ({myTickets.length})</h6>
                                            <div className="support-tickets-table-wrapper">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Ticket ID</th>
                                                            <th>Title</th>
                                                            <th>Category</th>
                                                            <th>Priority</th>
                                                            <th>Status</th>
                                                            <th>Submitted</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {myTickets.map((t) => (
                                                            <tr key={t.id}>
                                                                <td><strong>#{t.id}</strong></td>
                                                                <td>{t.title}</td>
                                                                <td>{t.category}</td>
                                                                <td>
                                                                    <span className={`priority-badge ${t.priority.toLowerCase()}`}>
                                                                        {t.priority}
                                                                    </span>
                                                                </td>
                                                                <td><span className="status-badge">In Review</span></td>
                                                                <td><small className="text-muted">{t.createdAt}</small></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: CONTACT ADMINISTRATOR */}
                    {activeTab === 'contact' && (
                        <div className="support-contact-view">
                            <div className="support-admin-card">
                                <div className="admin-card-header">
                                    <span className="admin-badge-icon">👑</span>
                                    <div>
                                        <h4>Direct Farm Administration</h4>
                                        <p>For urgent operational assistance, ledger reconciliation, or account access</p>
                                    </div>
                                </div>

                                <div className="admin-details-grid">
                                    <div className="admin-detail-item">
                                        <span className="detail-label">Lead Administrator</span>
                                        <strong>Mani Chandu (ADMIN)</strong>
                                    </div>
                                    <div className="admin-detail-item">
                                        <span className="detail-label">Farm Organization</span>
                                        <strong>Kurra's Smart Dairy Farm</strong>
                                    </div>
                                    <div className="admin-detail-item">
                                        <span className="detail-label">Direct Email</span>
                                        <strong>chandukurra55@gmail.com</strong>
                                    </div>
                                    <div className="admin-detail-item">
                                        <span className="detail-label">Farm Helpline</span>
                                        <strong>+91 99999 99999</strong>
                                    </div>
                                    <div className="admin-detail-item">
                                        <span className="detail-label">Support Hours</span>
                                        <strong>6:00 AM – 9:00 PM IST (Daily)</strong>
                                    </div>
                                    <div className="admin-detail-item">
                                        <span className="detail-label">Emergency Operations</span>
                                        <strong className="text-success">24/7 Cattle & Milking Alerts</strong>
                                    </div>
                                </div>

                                <div className="admin-actions-bar">
                                    <button className="btn btn-outline-info" onClick={handleCopyEmail}>
                                        {copySuccess ? '✓ Email Copied!' : '📋 Copy Email'}
                                    </button>
                                    <a href="mailto:chandukurra55@gmail.com?subject=Kurra%20Dairy%20Farm%20Support%20Request" className="btn btn-primary">
                                        ✉️ Send Direct Email
                                    </a>
                                    <a href="tel:+919999999999" className="btn btn-success">
                                        📞 Call Helpline
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportCenterModal;
