import React, { useState, useRef, useEffect } from 'react';
import type { Role, DecisionTree, DiagnosticResponse } from '../types';
import Card from './common/Card';
import Modal from './common/Modal';
import IncidentAssessment from './IncidentAssessment';
import MiniArchitecture from './MiniArchitecture';
import { DICOM_WIZARD_TREE, HL7_WIZARD_TREE, POWERSCRIBE_WIZARD_TREE } from '../constants';
import { queryKnowledgeBase, generateDocumentation, getDiagnosticResponse, getExplanationFor } from '../services/geminiService';
import { 
    FileWarningIcon, ShieldAlertIcon, SendIcon, BotIcon, UserIcon, ClipboardIcon, CheckIcon, InfoIcon, MessageSquareIcon, CheckSquareIcon, SquareIcon, ChevronLeftIcon, ChevronRightIcon, LifeBuoyIcon, BrainCircuitIcon
} from './common/Icons';
import type { IconProps } from './common/Icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface IntegratedSupportHubProps {
  role: Role;
}

interface WizardInfo {
    key: 'DICOM' | 'HL7' | 'PowerScribe';
    title: string;
    description: string;
    tree: DecisionTree;
    icon: React.ReactElement<IconProps>;
}

const WIZARDS: WizardInfo[] = [
    {
        key: 'DICOM',
        title: 'DICOM Issues Wizard',
        description: 'Troubleshoot "Images Not Loading" and other DICOM-related problems.',
        tree: DICOM_WIZARD_TREE,
        icon: <FileWarningIcon className="w-8 h-8 text-info" />
    },
    {
        key: 'HL7',
        title: 'HL7 Report Failure Wizard',
        description: 'Diagnose issues with missing reports in EMR/RIS and billing discrepancies.',
        tree: HL7_WIZARD_TREE,
        icon: <ShieldAlertIcon className="w-8 h-8 text-warning" />
    },
    {
        key: 'PowerScribe',
        title: 'PowerScribe Failure Wizard',
        description: 'Diagnose dictation, report status, and workflow interruption issues.',
        tree: POWERSCRIBE_WIZARD_TREE,
        icon: <MessageSquareIcon className="w-8 h-8 text-brand-accent-pink" />
    }
];

const DiagnosticWizard = ({ wizard, onClose, selectedContext, onToggleContext }: { wizard: WizardInfo; onClose: () => void; selectedContext: string[]; onToggleContext: (text: string) => void; }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedComponents, setHighlightedComponents] = useState<string[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
    const [explanationContent, setExplanationContent] = useState('');
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState('');

    const handleBotMessageClick = async (text: string) => {
        if (isExplanationLoading) return;
        setIsExplanationModalOpen(true);
        setIsExplanationLoading(true);
        setSelectedMessage(text);
        try {
            const explanation = await getExplanationFor(text);
            setExplanationContent(explanation);
        } catch (error) {
            setExplanationContent("Sorry, couldn't fetch an explanation for this message.");
        } finally {
            setIsExplanationLoading(false);
        }
    };

    const samplePrompts = wizard.key === 'DICOM'
      ? ["Images are loading very slowly.", "A specific study won't open.", "Is the Unifier for my region online?"]
      : wizard.key === 'HL7'
      ? ["A STAT report is missing from the EMR.", "Billing data seems incorrect for recent studies.", "Why are reports from yesterday delayed?"]
      : ["My dictations aren't triggering a workflow.", "A report is stuck in 'pending' status.", "Is the PowerScribe API connection healthy?"];

    useEffect(() => {
        const initialMessage: Message = {
            sender: 'bot',
            text: `Starting the ${wizard.title}. I will guide you through diagnosing the issue. Please describe the problem you are encountering.`
        };
        setMessages([initialMessage]);
        setHighlightedComponents([]);
    }, [wizard.title]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse : DiagnosticResponse = await getDiagnosticResponse(wizard.title, newMessages);
            const botMessage: Message = { sender: 'bot', text: botResponse.text };
            setMessages(prev => [...prev, botMessage]);
            setHighlightedComponents(botResponse.components);
        } catch (error) {
            const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
            setHighlightedComponents([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-info/10 p-2 rounded-full">{React.cloneElement(wizard.icon, { className: 'w-8 h-8' })}</div>
                    <h3 className="text-xl font-semibold text-brand-text">{wizard.title}</h3>
                </div>
                <button onClick={onClose} className="text-sm font-semibold text-brand-accent hover:underline">&larr; Back to Tool Selection</button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                <div className="md:w-2/5 w-full flex-shrink-0">
                    <MiniArchitecture highlightedIds={highlightedComponents} />
                </div>
                <div className="md:w-3/5 w-full flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar mb-4 bg-brand-bg p-4 rounded-lg min-h-[300px]">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' ? (
                                    <>
                                        <BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent mt-1" />
                                        <div className="max-w-md">
                                            <button
                                                onClick={() => onToggleContext(msg.text)}
                                                className={`w-full text-left p-3 rounded-2xl transition-all border shadow-md ${selectedContext.includes(msg.text) ? 'bg-brand-accent/10 border-brand-accent/80' : 'bg-brand-surface border-transparent hover:border-brand-subtle/50'}`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="text-sm whitespace-pre-wrap text-brand-text flex-1">{msg.text}</p>
                                                    {selectedContext.includes(msg.text)
                                                        ? <CheckSquareIcon className="w-5 h-5 text-brand-accent flex-shrink-0"/>
                                                        : <SquareIcon className="w-5 h-5 text-brand-subtle/50 flex-shrink-0"/>
                                                    }
                                                </div>
                                            </button>
                                            <div
                                                onClick={(e) => { e.stopPropagation(); handleBotMessageClick(msg.text); }}
                                                className="text-xs text-brand-text opacity-60 mt-2 ml-2 flex items-center gap-1 hover:opacity-100 hover:text-brand-accent cursor-pointer w-fit"
                                            >
                                                <InfoIcon className="w-3 h-3"/> Click for explanation
                                            </div>
                                        </div>
                                    </>
                                 ) : (
                                    <>
                                        <div className="max-w-md px-4 py-3 rounded-2xl bg-brand-accent text-brand-bg font-medium shadow-md"><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                                        <UserIcon className="w-8 h-8 flex-shrink-0 text-brand-text opacity-70" />
                                    </>
                                )}
                            </div>
                        ))}
                        {isLoading && (<div className="flex items-start gap-3"><BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" /><div className="max-w-md px-4 py-3 rounded-2xl bg-brand-surface text-brand-text"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div>)}
                        <div ref={chatEndRef}></div>
                    </div>
                     <div className="mt-auto">
                        <div className="flex items-center gap-2 p-2 bg-brand-surface border border-white/10 rounded-lg">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Describe symptoms or answer the question..." className="w-full px-2 py-1 bg-transparent focus:outline-none disabled:opacity-50 text-brand-text placeholder:text-brand-subtle" disabled={isLoading} />
                            <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2 rounded-full bg-brand-accent text-brand-bg hover:brightness-110 transition-all disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-brand-text opacity-70 mr-1">Try asking:</span>
                            {samplePrompts.map((prompt, i) => (
                                <button key={i} onClick={() => setInput(prompt)} className="text-xs px-3 py-1 bg-brand-surface rounded-full border border-brand-subtle/20 hover:bg-brand-subtle/10 text-brand-text opacity-80 hover:opacity-100 transition-colors">"{prompt}"</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isExplanationModalOpen && (
                <Modal title="Explanation" onClose={() => setIsExplanationModalOpen(false)}>
                    <div className="p-2">
                        <blockquote className="border-l-4 border-brand-subtle/50 pl-4 py-2 mb-4 bg-brand-bg rounded-r-md">
                            <p className="text-brand-text opacity-90 italic">{selectedMessage}</p>
                        </blockquote>
                        {isExplanationLoading ? (
                            <div className="flex items-center space-x-2 text-brand-text opacity-80">
                                <svg className="animate-spin h-5 w-5 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Generating explanation...</span>
                            </div>
                        ) : (
                             <button
                                onClick={() => explanationContent && !isExplanationLoading && onToggleContext(explanationContent)}
                                disabled={isExplanationLoading || !explanationContent}
                                className={`w-full text-left p-3 rounded-lg transition-all border mt-2 bg-brand-bg disabled:cursor-not-allowed
                                        ${selectedContext.includes(explanationContent)
                                        ? 'border-brand-accent/80'
                                        : 'border-transparent hover:border-brand-subtle/50'}`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-brand-text whitespace-pre-wrap flex-1">{explanationContent}</p>
                                    {explanationContent && !isExplanationLoading && (
                                        selectedContext.includes(explanationContent)
                                            ? <CheckSquareIcon className="w-5 h-5 text-brand-accent flex-shrink-0"/>
                                            : <SquareIcon className="w-5 h-5 text-brand-subtle/50 flex-shrink-0"/>
                                    )}
                                </div>
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            <style>{`.animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

const AiAssistantPanel = ({ selectedContext, onToggleContext, onUpdateDocTopic, docTopic, onGenerateDoc, isDocLoading, generatedDoc, docError, onCopy, copied }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isChatLoading, setChatIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0) return;
        const initialBotMessage: Message = { sender: 'bot', text: "Hello! I'm Navigator AI. How can I assist you?" };
        setMessages([initialBotMessage]);
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isChatLoading) return;
        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setChatIsLoading(true);
        try {
            const botResponse = await queryKnowledgeBase(input);
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error.' }]);
        } finally {
            setChatIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="text-center">
                <h2 className="text-xl font-bold text-brand-text">AI Assistant</h2>
                <p className="text-sm text-brand-subtle">Use context from your diagnostic session to generate reports or ask follow-up questions.</p>
            </div>
            <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar p-1">
                <Card className="flex flex-col bg-brand-bg">
                    <h3 className="text-lg font-semibold text-brand-text mb-1">Documentation Generator</h3>
                    <p className="text-xs text-brand-text opacity-80 mb-4">Generate a technical document based on a topic and your selected context from chat sessions.</p>
                    <textarea value={docTopic} onChange={e => onUpdateDocTopic(e.target.value)} placeholder="Enter a topic for documentation (e.g., 'What to do when reports are missing from the EMR')" rows={3} className="w-full p-2 bg-brand-surface border border-white/10 rounded-md text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-text placeholder:text-brand-subtle"></textarea>
                    
                    {selectedContext.length > 0 && (
                        <div className="text-xs text-brand-text opacity-80 mb-3 p-2 bg-brand-surface rounded-md border border-brand-subtle/20">
                            Added context from chat: <span className="font-bold text-brand-accent">{selectedContext.length}</span> chunk(s).
                        </div>
                    )}

                    <button onClick={onGenerateDoc} disabled={isDocLoading || !docTopic.trim()} className="w-full bg-brand-accent text-brand-bg font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">{isDocLoading ? 'Generating...' : 'Generate Doc'}</button>
                    
                    {(isDocLoading || docError || generatedDoc) && (
                        <div className="mt-4 pt-4 border-t border-brand-subtle/10">
                            {isDocLoading && (<div className="flex items-center space-x-2 text-brand-text opacity-80"><svg className="animate-spin h-5 w-5 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Please wait...</span></div>)}
                            {docError && <p className="text-critical font-medium">{docError}</p>}
                            {generatedDoc && (
                                <div className="relative">
                                    <button onClick={onCopy} className="absolute top-0 right-0 p-2 text-sm bg-brand-bg rounded-lg hover:bg-brand-subtle/20 transition-colors flex items-center gap-2 text-brand-text opacity-80"> {copied ? <CheckIcon className="w-4 h-4 text-normal"/> : <ClipboardIcon className="w-4 h-4"/>} {copied ? 'Copied!' : 'Copy'} </button>
                                    <div className="prose prose-sm prose-invert max-w-none mt-2 whitespace-pre-wrap font-mono text-xs p-4 bg-brand-surface rounded-md h-48 overflow-y-auto custom-scrollbar">{generatedDoc}</div>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <Card className="flex flex-col flex-1 h-[50vh] min-h-[400px] bg-brand-bg">
                    <h3 className="text-lg font-semibold text-brand-text mb-1">Knowledge AI Chat</h3>
                    <p className="text-xs text-brand-text opacity-80 mb-4">Ask general questions, or select messages to add them as context for the doc generator above.</p>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' ? (
                                    <>
                                        <BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent mt-1" />
                                        <button onClick={() => onToggleContext(msg.text)} className={`max-w-md text-left p-3 rounded-2xl transition-all border shadow-md ${selectedContext.includes(msg.text) ? 'bg-brand-accent/10 border-brand-accent/80' : 'bg-brand-surface border-transparent hover:border-brand-subtle/50'}`}>
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-sm whitespace-pre-wrap text-brand-text">{msg.text}</p>
                                                {selectedContext.includes(msg.text) 
                                                    ? <CheckSquareIcon className="w-5 h-5 text-brand-accent flex-shrink-0"/>
                                                    : <SquareIcon className="w-5 h-5 text-brand-subtle/50 flex-shrink-0"/>
                                                }
                                            </div>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className={`max-w-md px-4 py-3 rounded-2xl bg-brand-accent text-brand-bg font-medium shadow-md`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                                        <UserIcon className="w-8 h-8 flex-shrink-0 text-brand-text opacity-70" />
                                    </>
                                )}
                            </div>
                        ))}
                        {isChatLoading && (<div className="flex items-start gap-3"><BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" /><div className="max-w-md px-4 py-3 rounded-2xl bg-brand-surface text-brand-text"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div>)}
                        <div ref={chatEndRef}></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 mt-4 bg-brand-surface border border-white/10 rounded-lg">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="w-full px-2 py-1 bg-transparent focus:outline-none disabled:opacity-50 text-brand-text placeholder:text-brand-subtle" disabled={isChatLoading} />
                        <button onClick={handleSend} disabled={isChatLoading || input.trim() === ''} className="p-2 rounded-full bg-brand-accent text-brand-bg hover:brightness-110 transition-all disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
                    </div>
                </Card>
            </div>
        </div>
    );
}


const IntegratedSupportHub = ({ role }: IntegratedSupportHubProps) => {
    // Desktop Sidebar State
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);

    // Mobile Modal State
    const [isIncidentModalOpen, setIncidentModalOpen] = useState(false);
    const [isAssistantModalOpen, setAssistantModalOpen] = useState(false);
    
    // Diagnostic Wizard State
    const [activeWizard, setActiveWizard] = useState<WizardInfo | null>(null);

    // Shared State for Context, Docs, etc.
    const [selectedContext, setSelectedContext] = useState<string[]>([]);
    const [docTopic, setDocTopic] = useState('');
    const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
    const [isDocLoading, setDocIsLoading] = useState(false);
    const [docError, setDocError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleToggleContext = (text: string) => {
      setSelectedContext(prev =>
        prev.includes(text)
          ? prev.filter(item => item !== text)
          : [...prev, text]
      );
    };

    const handleGenerateDoc = async () => {
        if (!docTopic.trim() || isDocLoading) return;
        setDocIsLoading(true);
        setGeneratedDoc(null);
        setDocError(null);
        try {
            const result = await generateDocumentation(docTopic, selectedContext);
            setGeneratedDoc(result);
        } catch (err) {
            setDocError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setDocIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (generatedDoc) {
            navigator.clipboard.writeText(generatedDoc);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const commonAiAssistantProps = {
        selectedContext,
        onToggleContext: handleToggleContext,
        docTopic,
        onUpdateDocTopic: setDocTopic,
        onGenerateDoc: handleGenerateDoc,
        isDocLoading,
        generatedDoc,
        docError,
        onCopy: handleCopy,
        copied,
    };

    return (
        <div className="h-full w-full">
            {/* Desktop Layout: 3-Column with Collapsible Sidebars */}
            <div className="hidden lg:flex h-full w-full gap-4">
                 {/* Left Sidebar */}
                <div className={`flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isLeftSidebarOpen ? 'w-[400px]' : 'w-0'}`}>
                    <Card className={`h-full w-full overflow-hidden flex flex-col ${!isLeftSidebarOpen && 'p-0 border-0'}`}>
                        {isLeftSidebarOpen && <div className="overflow-y-auto custom-scrollbar h-full"><IncidentAssessment /></div>}
                    </Card>
                </div>

                {/* Main Content and Toggles */}
                <div className="flex-1 flex items-center min-w-0">
                    <button onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)} title={isLeftSidebarOpen ? "Collapse Incident Library" : "Expand Incident Library"} className="h-24 w-6 bg-brand-surface hover:bg-brand-subtle/20 rounded-r-lg flex items-center justify-center -mr-4 z-10 flex-shrink-0">
                        <ChevronLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isLeftSidebarOpen ? '' : 'rotate-180'}`} />
                    </button>
                    
                    <div className="flex-1 h-full min-w-0">
                        <Card className="h-full flex flex-col">
                            {!activeWizard ? (
                                <>
                                    <h2 className="text-xl font-bold text-brand-text mb-1">Diagnostic Wizards</h2>
                                    <p className="text-brand-text opacity-80 mb-6">Select a wizard to begin a step-by-step AI-powered diagnostic flow.</p>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {WIZARDS.map((wizard) => (
                                            <button key={wizard.key} onClick={() => setActiveWizard(wizard)} className="text-left p-6 bg-brand-surface/50 rounded-lg border border-brand-subtle/20 hover:border-info hover:bg-brand-surface transition-all group">
                                                <div className="flex items-start gap-4">
                                                    <div className={`bg-brand-surface p-3 rounded-full transition-colors`}>{React.cloneElement(wizard.icon, {className: `w-8 h-8`})}</div>
                                                    <div><h4 className="font-bold text-brand-text">{wizard.title}</h4><p className="text-sm text-brand-text opacity-80">{wizard.description}</p></div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <DiagnosticWizard wizard={activeWizard} onClose={() => setActiveWizard(null)} selectedContext={selectedContext} onToggleContext={handleToggleContext} />
                            )}
                        </Card>
                    </div>

                    <button onClick={() => setRightSidebarOpen(!isRightSidebarOpen)} title={isRightSidebarOpen ? "Collapse AI Assistant" : "Expand AI Assistant"} className="h-24 w-6 bg-brand-surface hover:bg-brand-subtle/20 rounded-l-lg flex items-center justify-center -ml-4 z-10 flex-shrink-0">
                        <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${!isRightSidebarOpen ? '' : 'rotate-180'}`} />
                    </button>
                </div>

                {/* Right Sidebar */}
                <div className={`flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isRightSidebarOpen ? 'w-[450px]' : 'w-0'}`}>
                    <div className={`h-full w-full overflow-hidden flex flex-col bg-brand-surface/50 p-6 rounded-xl border border-brand-subtle/10 ${!isRightSidebarOpen && 'p-0 border-0'}`}>
                        {isRightSidebarOpen && <AiAssistantPanel {...commonAiAssistantProps} />}
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Layout: Single Column with Modals */}
            <div className="lg:hidden flex flex-col h-full gap-4">
                <div className="flex-1 overflow-y-auto">
                    <Card className="h-full flex flex-col">
                        {!activeWizard ? (
                            <>
                                <h2 className="text-xl font-bold text-brand-text mb-1">Diagnostic Wizards</h2>
                                <p className="text-brand-text opacity-80 mb-6">Select a wizard to begin a step-by-step AI-powered diagnostic flow.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {WIZARDS.map((wizard) => (
                                        <button key={wizard.key} onClick={() => setActiveWizard(wizard)} className="text-left p-6 bg-brand-surface/50 rounded-lg border border-brand-subtle/20 hover:border-info hover:bg-brand-surface transition-all group">
                                            <div className="flex items-start gap-4">
                                                <div className={`bg-brand-surface p-3 rounded-full transition-colors`}>{React.cloneElement(wizard.icon, {className: `w-8 h-8`})}</div>
                                                <div><h4 className="font-bold text-brand-text">{wizard.title}</h4><p className="text-sm text-brand-text opacity-80">{wizard.description}</p></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <DiagnosticWizard wizard={activeWizard} onClose={() => setActiveWizard(null)} selectedContext={selectedContext} onToggleContext={handleToggleContext} />
                        )}
                    </Card>
                </div>

                {/* Mobile Footer Toolbar */}
                <div className="flex-shrink-0 grid grid-cols-2 gap-2 p-2 bg-brand-surface border-t border-brand-subtle/10">
                    <button onClick={() => setIncidentModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-brand-subtle/10 transition-colors">
                        <LifeBuoyIcon className="w-6 h-6 text-brand-accent-purple mb-1" />
                        <span className="text-xs font-medium text-brand-text">Incident Library</span>
                    </button>
                    <button onClick={() => setAssistantModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-brand-subtle/10 transition-colors">
                        <BrainCircuitIcon className="w-6 h-6 text-brand-accent-cyan mb-1" />
                        <span className="text-xs font-medium text-brand-text">AI Assistant</span>
                    </button>
                </div>
            </div>

            {/* Mobile Modals */}
            {isIncidentModalOpen && (
                <Modal title="Incident Assessment Library" onClose={() => setIncidentModalOpen(false)}>
                    <div className="h-[75vh] overflow-y-auto custom-scrollbar">
                        <IncidentAssessment />
                    </div>
                </Modal>
            )}
            {isAssistantModalOpen && (
                <Modal title="AI Assistant" onClose={() => setAssistantModalOpen(false)}>
                     <div className="h-[75vh] overflow-y-auto custom-scrollbar">
                        <AiAssistantPanel {...commonAiAssistantProps} />
                    </div>
                </Modal>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 3px; }
                .prose-invert { --tw-prose-body: #a9b1d6; --tw-prose-headings: #a9b1d6; --tw-prose-bold: #a9b1d6; --tw-prose-code: #a9b1d6; --tw-prose-bullets: #787c99; }
            `}</style>
        </div>
    );
};

export default IntegratedSupportHub;