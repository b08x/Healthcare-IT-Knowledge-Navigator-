

import React, { useState } from 'react';
import type { Role, DecisionTree } from '../types';
import Card from './common/Card';
import IncidentAssessment from './IncidentAssessment';
import { DICOM_WIZARD_TREE, HL7_WIZARD_TREE, POWERSCRIBE_WIZARD_TREE } from '../constants';
import { FileWarningIcon, ShieldAlertIcon, MessageSquareIcon, ChevronRightIcon, RefreshCwIcon } from './common/Icons';
import type { IconProps } from './common/Icons';

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

const DiagnosticWizard = ({ wizard, onClose }: { wizard: WizardInfo; onClose: () => void; }) => {
    const [currentNodeKey, setCurrentNodeKey] = useState<string>('start');
    
    const handleReset = () => {
        setCurrentNodeKey('start');
    };

    const handleOptionClick = (nextNodeKey: string) => {
        setCurrentNodeKey(nextNodeKey);
    };
    
    const node = wizard.tree[currentNodeKey];
    
    const colorClassMapping = {
        'bg-info/10 border-info': 'bg-info/10 border-info',
        'bg-normal/10 border-normal': 'bg-normal/10 border-normal',
        'bg-warning/10 border-warning': 'bg-warning/10 border-warning',
        'bg-critical/10 border-critical': 'bg-critical/10 border-critical'
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-info/10 p-2 rounded-full">
                         {React.cloneElement(wizard.icon, { className: 'w-8 h-8' })}
                    </div>
                    <h3 className="text-xl font-semibold text-brand-text">{wizard.title}</h3>
                </div>
                <button onClick={onClose} className="text-sm font-semibold text-brand-accent hover:underline">
                    &larr; Back to Wizard Selection
                </button>
            </div>

            <div className="flex justify-end mb-4">
                <button onClick={handleReset} className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1">
                    <RefreshCwIcon className="w-3 h-3"/>
                    Restart Wizard
                </button>
            </div>
          
            <div className={`p-6 rounded-lg border-2 ${colorClassMapping[node.colorClass] || 'bg-info/10 border-info'}`}>
                <p className="text-lg font-medium text-brand-text">{node.text}</p>
            </div>

            {node.options && (
                <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold text-brand-text opacity-80">Choose the next step:</p>
                    {node.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(option.next)}
                            className="w-full flex justify-between items-center text-left p-4 bg-brand-surface rounded-lg shadow-sm border border-brand-subtle/20 hover:bg-brand-subtle/10 hover:border-brand-accent transition"
                        >
                            <span className="font-medium text-brand-text">{option.text}</span>
                            <ChevronRightIcon className="w-5 h-5 text-brand-subtle" />
                        </button>
                    ))}
                </div>
            )}
            {node.resolution && (
                <div className="mt-6 p-4 bg-brand-bg rounded-lg">
                    <h4 className="font-semibold text-brand-text mb-2">Recommended Action / Resolution:</h4>
                    <p className="text-brand-text opacity-90 whitespace-pre-wrap">{node.resolution}</p>
                </div>
            )}
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
             `}</style>
        </div>
    );
};

const SupportCenter = ({ role }: { role: Role }) => {
    const [activeWizard, setActiveWizard] = useState<WizardInfo | null>(null);

    return (
        <div className="space-y-8">
            <Card>
                {!activeWizard ? (
                    <>
                        <h2 className="text-2xl font-bold text-brand-accent mb-1">Diagnostic Wizards</h2>
                        <p className="text-brand-text opacity-80 mb-6">Select a wizard to begin a step-by-step diagnostic flow.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {WIZARDS.map((wizard) => (
                                <button
                                    key={wizard.key}
                                    onClick={() => setActiveWizard(wizard)}
                                    className="text-left p-6 bg-brand-surface/50 rounded-lg border border-brand-subtle/20 hover:border-brand-accent hover:bg-brand-surface transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand-surface p-3 rounded-full transition-colors">
                                            {React.cloneElement(wizard.icon, {className: "w-8 h-8"})}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-brand-text">{wizard.title}</h4>
                                            <p className="text-sm text-brand-text opacity-80">{wizard.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <DiagnosticWizard wizard={activeWizard} onClose={() => setActiveWizard(null)} />
                )}
            </Card>

            <IncidentAssessment />
            
            <Card>
                <h3 className="text-lg font-semibold text-brand-accent mb-4">Escalation Matrix</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-brand-bg">
                            <tr>
                                <th className="p-3 font-semibold text-brand-text">Component</th>
                                <th className="p-3 font-semibold text-brand-text">Vendor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-brand-surface">
                                <td className="p-3">IRIS Engine</td>
                                <td className="p-3">LucidHealth</td>
                            </tr>
                            <tr className="border-b border-brand-surface">
                                <td className="p-3">Unifier Appliances</td>
                                <td className="p-3">DICOM Systems</td>
                            </tr>
                            <tr className="border-b border-brand-surface">
                                <td className="p-3">PowerScribe 360</td>
                                <td className="p-3">Nuance</td>
                            </tr>
                            <tr>
                                <td className="p-3">Azure Platform</td>
                                <td className="p-3">Microsoft</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SupportCenter;