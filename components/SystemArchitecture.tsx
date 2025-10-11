import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { SYSTEM_COMPONENTS, CONNECTIONS, ICONS } from '../constants';
import type { SystemComponent, UnifierStatus } from '../types';
import Card from './common/Card';
import { XIcon } from './common/Icons';

const getComponentById = (id: string) => SYSTEM_COMPONENTS.find(c => c.id === id);

const UnifierStatusVisualizer = ({ status }: { status: UnifierStatus }) => {
    const statusInfo = {
        Online: { text: 'Online', colorClass: 'bg-normal' },
        Degraded: { text: 'Degraded', colorClass: 'bg-warning' },
        Offline: { text: 'Offline', colorClass: 'bg-critical' },
    };

    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (status.cacheUsage / 100) * circumference;

    const getCacheColor = (usage: number) => {
        if (usage > 90) return 'stroke-critical';
        if (usage > 75) return 'stroke-warning';
        return 'stroke-info';
    };

    return (
        <div className="mt-6 p-4 bg-brand-bg/50 rounded-lg border border-white/10">
            <h3 className="font-semibold text-brand-text opacity-70 text-xs uppercase tracking-wider mb-4">Real-time Status</h3>
            <div className="space-y-6">
                {/* Service Status */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-brand-text">Service Status</span>
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${statusInfo[status.serviceStatus].colorClass}`}></span>
                        <span className="text-sm font-semibold text-brand-text">{statusInfo[status.serviceStatus].text}</span>
                    </div>
                </div>

                {/* Cache Usage */}
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-brand-text">Cache Usage</span>
                    <div className="relative w-[80px] h-[80px]">
                        <svg className="absolute top-0 left-0" height="100%" width="100%" viewBox="0 0 100 100">
                            <circle
                                className="stroke-current text-brand-surface"
                                strokeWidth={stroke}
                                fill="transparent"
                                r={normalizedRadius}
                                cx="50"
                                cy="50"
                            />
                            <circle
                                className={`stroke-current ${getCacheColor(status.cacheUsage)} transition-all duration-500`}
                                strokeWidth={stroke}
                                strokeDasharray={circumference + ' ' + circumference}
                                style={{ strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                strokeLinecap="round"
                                fill="transparent"
                                r={normalizedRadius}
                                cx="50"
                                cy="50"
                            />
                        </svg>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-brand-text">
                            {status.cacheUsage}%
                        </span>
                    </div>
                </div>

                {/* Recent Errors */}
                <div>
                     <span className="text-sm font-medium text-brand-text">Recent Errors ({status.recentErrors.count})</span>
                     <div className="mt-2 p-3 bg-brand-bg rounded-md text-xs text-brand-text opacity-80 font-mono border border-brand-subtle/10">
                        {status.recentErrors.lastError}
                     </div>
                </div>
            </div>
        </div>
    );
};


const ComponentDetailPanel = ({ component, onClose }: { component: SystemComponent, onClose: () => void }) => {
    const incoming = CONNECTIONS.filter(c => c.to === component.id);
    const outgoing = CONNECTIONS.filter(c => c.from === component.id);
    const getComponentName = (id: string) => getComponentById(id)?.name || 'Unknown';

    return (
        <div className="w-full lg:w-96 lg:h-full flex-shrink-0 bg-brand-surface rounded-lg p-6 border border-brand-subtle/10 flex flex-col animate-slide-in">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-subtle/10">
                <h2 className="text-xl font-bold text-brand-accent">{component.name}</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                    <XIcon className="w-6 h-6 text-brand-text opacity-70" />
                </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar">
                <p className="text-brand-text opacity-90 mb-4 text-sm">{component.description}</p>
                
                {component.unifierStatus && component.id === 'unifier' && (
                    <UnifierStatusVisualizer status={component.unifierStatus} />
                )}

                <h3 className="font-semibold text-brand-text opacity-70 text-xs uppercase tracking-wider mb-2 mt-6">Details</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-brand-text mb-6">
                    {component.details.map((detail, index) => <li key={index}>{detail}</li>)}
                </ul>

                {incoming.length > 0 && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-brand-text opacity-70 text-xs uppercase tracking-wider mb-2">Receives From</h3>
                        <div className="space-y-2">
                            {incoming.map(conn => (
                                <div key={conn.from} className="text-sm bg-brand-bg/50 p-3 rounded-md border border-white/5">
                                    <span className="font-bold text-brand-text">{getComponentName(conn.from)}</span> via <span className="font-semibold text-info">{conn.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {outgoing.length > 0 && (
                     <div className="mb-4">
                        <h3 className="font-semibold text-brand-text opacity-70 text-xs uppercase tracking-wider mb-2">Sends To</h3>
                        <div className="space-y-2">
                            {outgoing.map(conn => (
                                <div key={conn.to} className="text-sm bg-brand-bg/50 p-3 rounded-md border border-white/5">
                                    <span className="font-bold text-brand-text">{getComponentName(conn.to)}</span> via <span className="font-semibold text-warning">{conn.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
            `}</style>
        </div>
    );
};


const SystemArchitecture = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [lineCoords, setLineCoords] = useState<any[]>([]);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const componentRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

    useLayoutEffect(() => {
        const calculateCoords = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();

            const newCoords = CONNECTIONS.map(conn => {
                const fromEl = componentRefs.current.get(conn.from);
                const toEl = componentRefs.current.get(conn.to);
                if (!fromEl || !toEl) return null;

                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();

                const fromCenter = {
                    x: fromRect.left + fromRect.width / 2 - containerRect.left,
                    y: fromRect.top + fromRect.height / 2 - containerRect.top,
                };
                const toCenter = {
                    x: toRect.left + toRect.width / 2 - containerRect.left,
                    y: toRect.top + toRect.height / 2 - containerRect.top,
                };

                const dx = toCenter.x - fromCenter.x;
                const dy = toCenter.y - fromCenter.y;
                const angle = Math.atan2(dy, dx);
                
                const fromOffset = fromRect.width / 2;
                const toOffset = toRect.width / 2 + 12; // Adjust for arrow marker

                const x1 = fromCenter.x + Math.cos(angle) * fromOffset;
                const y1 = fromCenter.y + Math.sin(angle) * fromOffset;
                const x2 = toCenter.x - Math.cos(angle) * toOffset;
                const y2 = toCenter.y - Math.sin(angle) * toOffset;

                return { ...conn, x1, y1, x2, y2, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 };
            }).filter(Boolean);
            
            setLineCoords(newCoords);
        };

        const timeoutId = setTimeout(calculateCoords, 50);
        const resizeObserver = new ResizeObserver(calculateCoords);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        window.addEventListener('resize', calculateCoords);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateCoords);
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [selectedId]); // Recalculate when selection changes and panel appears/disappears

    const selectedComponent = useMemo(() => selectedId ? getComponentById(selectedId) : null, [selectedId]);
    const relatedIds = useMemo(() => {
        if (!selectedId) return new Set();
        const related = new Set<string>();
        CONNECTIONS.forEach(conn => {
            if (conn.from === selectedId) related.add(conn.to);
            if (conn.to === selectedId) related.add(conn.from);
        });
        return related;
    }, [selectedId]);
    
    const getStatus = (id: string, type: 'component' | 'line' | 'label', conn?: any) => {
        if (!selectedId) return 'default';
        let isRelated = false;
        if (type === 'component') isRelated = id === selectedId || relatedIds.has(id);
        if (type === 'line' || type === 'label') isRelated = conn.from === selectedId || conn.to === selectedId;

        if (id === selectedId) return 'selected';
        if (isRelated) return 'related';
        return 'unfocused';
    };
    
    const componentGroups = [
        ['pacs'],
        ['unifier', 'radassist'],
        ['iris'],
        ['powerscribe', 'risemr']
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-200px)]">
            <div ref={containerRef} className="relative flex-1 bg-brand-bg rounded-lg border border-brand-surface p-4 overflow-hidden min-h-[500px] lg:min-h-0" onClick={(e) => { if(e.target === e.currentTarget) setSelectedId(null)}}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-full gap-x-4">
                    {componentGroups.map((group, colIndex) => (
                        <div key={colIndex} className="flex flex-col items-center justify-around py-4 sm:py-8">
                            {group.map(id => {
                                const comp = getComponentById(id);
                                if (!comp) return null;
                                const status = getStatus(id, 'component');
                                const statusClasses = {
                                    default: 'border-brand-surface hover:border-brand-accent',
                                    selected: 'border-brand-accent ring-2 ring-brand-accent/50 shadow-xl shadow-brand-accent/10 scale-105',
                                    related: 'border-info ring-2 ring-info/50',
                                    unfocused: 'opacity-40'
                                };
                                return (
                                    <div key={id} ref={el => { if (el) { componentRefs.current.set(id, el); } else { componentRefs.current.delete(id); } }} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }} className={`w-44 cursor-pointer transition-all duration-300 my-2 sm:my-0`}>
                                        <Card className={`text-center !p-4 transition-all duration-300 ${statusClasses[status]}`}>
                                            <div className="flex flex-col items-center">
                                                <div className="p-2 mb-2">
                                                    {React.cloneElement(ICONS.SYSTEM, { className: `w-8 h-8 ${comp.colorClass}` })}
                                                </div>
                                                <h3 className="font-bold text-sm text-brand-text">{comp.name}</h3>
                                                <p className="text-xs text-brand-text opacity-80 mt-1 h-10">{comp.description}</p>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    <defs>
                        {lineCoords.map((conn) => {
                            const status = getStatus(conn.label, 'line', conn);
                            const colorClasses = {
                                default: 'fill-brand-subtle',
                                selected: 'fill-brand-accent',
                                related: 'fill-brand-accent',
                                unfocused: 'fill-brand-subtle/40'
                            };
                            return (
                                <marker key={`marker-${conn.from}-${conn.to}`} id={`arrow-${conn.from}-${conn.to}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" className={`transition-all duration-300 ${colorClasses[status]}`} />
                                </marker>
                            );
                        })}
                    </defs>
                    {lineCoords.map((conn) => {
                        const status = getStatus(conn.label, 'line', conn);
                        const strokeClasses = {
                            default: 'stroke-brand-subtle/50',
                            selected: 'stroke-brand-accent',
                            related: 'stroke-brand-accent',
                            unfocused: 'stroke-brand-subtle/20'
                        };
                        return (
                            <line key={`line-${conn.from}-${conn.to}`} x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2} className={`transition-all duration-300 ${strokeClasses[status]}`} strokeWidth="2" markerEnd={`url(#arrow-${conn.from}-${conn.to})`} />
                        );
                    })}
                </svg>

                 {lineCoords.map((conn) => {
                    const status = getStatus(conn.label, 'label', conn);
                    const labelClasses = {
                            default: 'opacity-100',
                            selected: 'opacity-100',
                            related: 'opacity-100',
                            unfocused: 'opacity-40'
                        };
                    return (
                        <div key={`label-${conn.from}-${conn.to}`} className={`absolute p-1 bg-brand-bg rounded-md flex items-center space-x-1 transition-opacity duration-300 ${labelClasses[status]}`} style={{ top: conn.midY, left: conn.midX, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                           {React.cloneElement(ICONS[conn.label], { className: 'w-4 h-4 text-brand-text opacity-90' })}
                           <span className="text-xs font-semibold text-brand-text opacity-90">{conn.label}</span>
                        </div>
                    )
                })}

                <div className="absolute bottom-4 right-4 bg-brand-surface rounded-lg p-3 border border-brand-subtle/10 shadow-sm">
                    <h4 className="font-bold text-sm mb-2 text-brand-text">Legend</h4>
                    <div className="space-y-2">
                        {['DICOM', 'HL7', 'API/HTTPS'].map(label => (
                            <div key={label} className="flex items-center space-x-2">
                                {React.cloneElement(ICONS[label.split('/')[0]], { className: 'w-5 h-5' })}
                                <span className={`text-xs font-medium text-brand-text opacity-90`}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedComponent && (
                <ComponentDetailPanel component={selectedComponent} onClose={() => setSelectedId(null)} />
            )}
        </div>
    );
};

export default SystemArchitecture;