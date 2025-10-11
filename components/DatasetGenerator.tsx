import React, { useState } from 'react';
import Card from './common/Card';
import { generateQADataset, QAPair } from '../services/geminiService';
import { DownloadIcon } from './common/Icons';

const topics = [
    "HL7 Message Flow Failures",
    "DICOM Image Delivery Problems",
    "PowerScribe Integration Failures",
    "Performance Monitoring & Alerting",
    "Vendor Escalation Matrix"
];

const personas = [
    "Support Engineer",
    "System Architect",
    "Clinical Staff",
];

const DatasetGenerator = () => {
    const [topic, setTopic] = useState(topics[0]);
    const [persona, setPersona] = useState(personas[0]);
    const [count, setCount] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<QAPair[]>([]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const data = await generateQADataset(topic, persona, count);
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const data = {
            generated_from: {
                topic,
                persona,
                count,
                timestamp: new Date().toISOString()
            },
            dataset: results
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dataset_${topic.replace(/\s/g, '_')}_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const renderSelect = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]) => (
        <div>
            <label htmlFor={label} className="block text-sm font-medium text-brand-text opacity-90">{label}</label>
            <select
                id={label}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-brand-bg text-brand-text border border-white/20 focus:outline-none focus:ring-info focus:border-info sm:text-sm rounded-md"
            >
                {options.map(opt => <option key={opt} className="bg-brand-surface text-brand-text">{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {renderSelect("Topic", topic, e => setTopic(e.target.value), topics)}
                    {renderSelect("Persona", persona, e => setPersona(e.target.value), personas)}

                    <div>
                        <label htmlFor="count" className="block text-sm font-medium text-brand-text opacity-90">Number of Pairs</label>
                        <input
                            type="number"
                            id="count"
                            value={count}
                            onChange={e => setCount(Math.max(1, parseInt(e.target.value, 10)))}
                            min="1"
                            max="20"
                            className="mt-1 block w-full pl-3 pr-2 py-2 text-base bg-brand-bg text-brand-text border border-white/20 focus:outline-none focus:ring-info focus:border-info sm:text-sm rounded-md"
                        />
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full bg-brand-accent text-brand-bg font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate Dataset'}
                    </button>
                </div>
            </Card>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-text">Generated Data</h3>
                    {results.length > 0 && (
                        <button 
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 bg-normal text-white rounded-lg hover:brightness-110 transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            Export JSON
                        </button>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center p-10">
                         <div className="flex items-center space-x-2 text-brand-text opacity-80">
                            <svg className="animate-spin h-5 w-5 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating dataset, please wait...</span>
                        </div>
                    </div>
                )}
                
                {error && <Card className="border-critical/50 bg-critical/10"><p className="text-critical font-medium">{error}</p></Card>}

                {!isLoading && !error && results.length === 0 && (
                    <Card><p className="text-center text-brand-text opacity-70">No data generated yet. Configure the options above and click "Generate Dataset".</p></Card>
                )}

                <div className="space-y-4">
                    {results.map((pair, index) => (
                        <Card key={index} className="transition hover:shadow-md">
                            <p className="font-semibold text-brand-text mb-2">
                                <span className="text-brand-accent font-bold">Q:</span> {pair.question}
                            </p>
                            <div className="pl-4 border-l-4 border-brand-surface">
                                <p className="text-brand-text opacity-90">
                                    <span className="text-normal font-bold">A:</span> {pair.answer}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DatasetGenerator;