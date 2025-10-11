import React, { useState } from 'react';
import Card from './common/Card';
import { INCIDENT_ASSESSMENTS } from '../constants';
import type { IncidentAssessmentDoc } from '../types';

const parseWithCitations = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\[cite_start\].*?\[cite: .*?\])/);
    return parts.map((part, index) => {
        const match = part.match(/\[cite_start\](.*?)\[cite: (.*?)\]/);
        if (match) {
            return (
                <span key={index} className="bg-brand-accent/10 border-l-4 border-brand-accent/50 pl-2 pr-1 py-0.5 rounded-r-md text-brand-text">
                    {match[1]}
                    <sup className="ml-1 text-brand-accent font-semibold cursor-help" title={`Source IDs: ${match[2]}`}>
                        [{match[2]}]
                    </sup>
                </span>
            );
        }
        return part;
    });
};

const IncidentDetail = ({ incident }: { incident: IncidentAssessmentDoc }) => {
    const renderables: React.ReactNode[] = [];
    const lines = incident.content.trim().split('\n');
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            renderables.push(
                <ul key={renderables.length} className="list-disc list-outside space-y-2 my-4 pl-5 text-brand-text opacity-90">
                    {currentList}
                </ul>
            );
            currentList = [];
        }
    };
    
    lines.forEach((line, i) => {
        if (line.trim() === '') return;

        if (line.startsWith('### ')) {
            flushList();
            renderables.push(<h3 key={i} className="text-xl font-semibold text-brand-text mt-6 mb-4">{line.substring(4)}</h3>);
            return;
        }

        const listItemMatch = line.match(/^\s*\*\s(.*)/);
        if (listItemMatch) {
            let content = listItemMatch[1];
            const boldMatch = content.match(/^\*\*(.*?)\*\*:\s*(.*)/);
            if (boldMatch) {
                currentList.push(<li key={i}><strong className="text-brand-text opacity-100">{boldMatch[1]}</strong>: {parseWithCitations(boldMatch[2])}</li>);
            } else {
                currentList.push(<li key={i}>{parseWithCitations(content)}</li>);
            }
            return;
        }

        flushList();
        renderables.push(<p key={i} className="text-brand-text mb-4 leading-relaxed">{parseWithCitations(line)}</p>);
    });

    flushList();

    return (
        <div className="mt-4 animate-fade-in">
             <h3 className="text-2xl font-bold text-brand-accent mb-1">{incident.title}</h3>
             <p className="text-brand-text opacity-80 mb-6">A correlation between common issues and their potential root causes.</p>
             <div>{renderables}</div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
             `}</style>
        </div>
    );
};

const IncidentAssessment = () => {
    const [selectedIncident, setSelectedIncident] = useState<IncidentAssessmentDoc | null>(INCIDENT_ASSESSMENTS[0]);

    return (
        <Card>
            <h2 className="text-2xl font-bold text-brand-accent mb-4">Incident Assessment Library</h2>
            <div className="flex flex-wrap gap-2 border-b border-brand-surface pb-4 mb-4">
                {INCIDENT_ASSESSMENTS.map(incident => (
                    <button
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                            selectedIncident?.id === incident.id
                                ? 'bg-brand-accent text-brand-bg shadow'
                                : 'bg-brand-surface text-brand-text opacity-70 hover:bg-brand-subtle/10 hover:opacity-100'
                        }`}
                    >
                        {incident.title}
                    </button>
                ))}
            </div>
            
            {selectedIncident ? (
                <IncidentDetail incident={selectedIncident} />
            ) : (
                <p className="text-center text-brand-text opacity-70 py-8">Select an incident to view details.</p>
            )}
        </Card>
    );
};

export default IncidentAssessment;