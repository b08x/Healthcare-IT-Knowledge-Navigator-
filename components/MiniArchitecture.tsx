

import React, { useState, useRef, useLayoutEffect } from 'react';
import { SYSTEM_COMPONENTS, CONNECTIONS, ICONS } from '../constants';
import Card from './common/Card';

const getComponentById = (id: string) => SYSTEM_COMPONENTS.find(c => c.id === id);

interface MiniArchitectureProps {
    highlightedIds: string[];
}

const MiniArchitecture = ({ highlightedIds }: MiniArchitectureProps) => {
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
                
                const fromOffset = (fromRect.width / 2) * 0.9;
                const toOffset = (toRect.width / 2) + 8; // Adjust for arrow marker

                const x1 = fromCenter.x + Math.cos(angle) * fromOffset;
                const y1 = fromCenter.y + Math.sin(angle) * fromOffset;
                const x2 = toCenter.x - Math.cos(angle) * toOffset;
                const y2 = toCenter.y - Math.sin(angle) * toOffset;

                return { ...conn, x1, y1, x2, y2, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 };
            }).filter(Boolean);
            
            setLineCoords(newCoords as any[]);
        };
        
        const timeoutId = setTimeout(calculateCoords, 50);
        window.addEventListener('resize', calculateCoords);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateCoords);
        };
    }, []);

    const isAnythingHighlighted = highlightedIds.length > 0;

    const getStatus = (type: 'component' | 'line' | 'label', item: any): 'highlighted' | 'unfocused' | 'default' => {
        if (!isAnythingHighlighted) return 'default';
        
        if (type === 'component') {
            return highlightedIds.includes(item.id) ? 'highlighted' : 'unfocused';
        }
        
        if (type === 'line' || type === 'label') {
            const isConnHighlighted = highlightedIds.includes(item.from) && highlightedIds.includes(item.to);
            return isConnHighlighted ? 'highlighted' : 'unfocused';
        }
        
        return 'default';
    };
    
    const componentLayout = [
        ['pacs', 'unifier'],
        ['radassist', 'iris'],
        ['powerscribe', 'risemr']
    ];

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-brand-text mb-4">System Context</h3>
            <div ref={containerRef} className="relative flex-1 bg-brand-bg rounded-lg border border-brand-surface p-2 overflow-hidden">
                <div className="grid grid-cols-2 h-full gap-2">
                    {componentLayout.flat().map((id) => {
                        const comp = getComponentById(id);
                        if (!comp) return null;
                        
                        const status = getStatus('component', comp);
                        const statusClasses = {
                            default: 'border-brand-surface',
                            highlighted: 'border-brand-accent ring-2 ring-brand-accent/50 shadow-md shadow-brand-accent/10 scale-105',
                            unfocused: 'opacity-40 border-transparent'
                        };

                        return (
                            <div key={id} ref={el => { if (el) { componentRefs.current.set(id, el); } else { componentRefs.current.delete(id); } }} className="flex items-center justify-center">
                                <div className={`w-36 h-24 flex flex-col items-center justify-center p-2 text-center bg-brand-surface rounded-lg border-2 transition-all duration-300 ${statusClasses[status]}`}>
                                    {React.cloneElement(ICONS.SYSTEM, { className: `w-6 h-6 mb-1 ${comp.colorClass}` })}
                                    <h4 className="font-bold text-xs text-brand-text">{comp.name}</h4>
                                </div>
                            </div>
                        );
                   })}
                </div>

                <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    <defs>
                        {lineCoords.map((conn) => {
                            const status = getStatus('line', conn);
                            const colorClasses = {
                                default: 'fill-brand-subtle',
                                highlighted: 'fill-brand-accent',
                                unfocused: 'fill-brand-subtle/40'
                            };
                            return (
                                <marker key={`marker-mini-${conn.from}-${conn.to}`} id={`mini-arrow-${conn.from}-${conn.to}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" className={`transition-all duration-300 ${colorClasses[status]}`} />
                                </marker>
                            );
                        })}
                    </defs>
                    {lineCoords.map((conn) => {
                        const status = getStatus('line', conn);
                        const strokeClasses = {
                            default: 'stroke-brand-subtle/50',
                            highlighted: 'stroke-brand-accent stroke-2',
                            unfocused: 'stroke-brand-subtle/20'
                        };
                        return (
                            <line key={`line-mini-${conn.from}-${conn.to}`} x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2} className={`transition-all duration-300 ${strokeClasses[status]}`} strokeWidth="1.5" markerEnd={`url(#mini-arrow-${conn.from}-${conn.to})`} />
                        );
                    })}
                </svg>

                 {lineCoords.map((conn) => {
                    const status = getStatus('label', conn);
                    const labelClasses = {
                        default: 'opacity-100',
                        highlighted: 'opacity-100',
                        unfocused: 'opacity-30'
                    };
                    return (
                        <div key={`label-mini-${conn.from}-${conn.to}`} className={`absolute p-0.5 bg-brand-bg rounded-md flex items-center space-x-1 transition-opacity duration-300 ${labelClasses[status]}`} style={{ top: conn.midY, left: conn.midX, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                           {React.cloneElement(ICONS[conn.label], { className: 'w-3 h-3 text-brand-text opacity-90' })}
                           <span className="text-[10px] font-semibold text-brand-text opacity-90">{conn.label}</span>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
};

export default MiniArchitecture;