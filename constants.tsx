
import React from 'react';
import type { SystemComponent, Connection, DecisionTree, IncidentAssessmentDoc } from './types';
import { SystemIcon, HL7Icon, DicomIcon, ApiIcon } from './components/common/Icons';
import type { IconProps } from './components/common/Icons';

export const KNOWLEDGE_BASE_DOCUMENT = `
---
title: Healthcare Imaging Platform Support
tags:
  - nlp
  - natural-language-processing
  - healthcare-it
  - it-support
  - troubleshooting
last updated: Sunday, July 27th 2025, 4:09:09 am
---

# Support Engineering Operations Guide: Healthcare Imaging Integration Platform

## Support Infrastructure Overview

### **Primary Support Domains**

**1. IRIS Interface Engine Support**
* **Environment Access**: DEV → TEST → PROD → DR escalation path
* **Monitoring Endpoints**: Internal load balancer health checks across 11 Azure VMs
* **Primary Failure Points**: Node arbitration, message queue backlogs, database connectivity
* **Support Tools**: Azure monitoring dashboards, HL7 message tracking, database performance counters

**2. Unifier Appliance Support**
* **Regional Coverage**: 5 active regions (WI, CT, OH, FL, NV, CA) requiring 24/7 monitoring
* **Local vs. Cloud Issues**: Distinguish between on-premise Unifier failures and cloud connectivity problems
* **Capacity Monitoring**: 3TB storage thresholds, 30-day cache utilization, study volume trending

## Critical Support Scenarios & Diagnostic Workflows

### **HL7 Message Flow Failures**

**Symptom**: Reports not appearing in RIS/EMR, billing discrepancies, missing patient data

**Diagnostic Protocol**:
1. **Message Queue Analysis**: Check IRIS for backed-up queues, failed message retries
2. **Endpoint Connectivity**: Verify HL7 listener status on receiving systems (RIS/EMR, PowerScribe, Zotec Billing)
3. **Message Validation**: Parse HL7 segments for malformed data, missing required fields
4. **Network Path Verification**: Confirm firewall rules, VPN tunnel status, port accessibility

**Common Resolutions**:
* Restart HL7 listeners on target systems
* Reprocess failed messages from IRIS dead letter queue
* Update message transformation rules for new data formats
* Coordinate with vendor support for system-specific issues

### **DICOM Image Delivery Problems**

**Symptom**: Images not loading in RadAssist workstations, slow retrieval times, incomplete studies

**Escalation Decision Tree**:

\`\`\`shell
Image Loading Issue
├── Local Unifier Problem
│   ├── Check cache utilization (>90% = purge old studies)
│   ├── Verify DICOM C-STORE operations from PACS
│   └── Restart Unifier services if necessary
├── Network Connectivity Issue  
│   ├── Test HTTPS connectivity to Azure App Services
│   ├── Check firewall logs for blocked connections
│   └── Verify DNS resolution for cloud endpoints
└── Cloud Platform Issue
    ├── Monitor Azure service health dashboard
    ├── Check Redis Cache performance metrics
    └── Escalate to cloud operations team
\`\`\`

### **PowerScribe Integration Failures**

**Symptom**: Dictations not triggering, reports stuck in pending status, workflow disruptions

**Support Actions**:
1. **API Connectivity**: Verify HTTPS endpoints between IRIS and PowerScribe API
2. **Authentication Status**: Check token expiration, certificate validity
3. **Workflow State**: Query Azure SQL for pending report transactions
4. **Clinical Impact Assessment**: Prioritize based on study urgency (STAT vs. routine)

## Performance Monitoring & Alerting Framework

### **Key Performance Indicators (KPIs)**

**System Health Metrics**:
* **Message Processing Latency**: HL7 end-to-end delivery time (target: <30 seconds)
* **Image Retrieval Performance**: DICOM study load time (target: <10 seconds for recent studies)
* **System Availability**: Uptime percentage per regional Unifier (target: 99.9%)
* **Cache Hit Ratio**: Local Unifier cache effectiveness (target: >85%)

**Critical Alert Thresholds**:
* **IMMEDIATE**: Any IRIS node failure, complete site connectivity loss
* **WARNING**: Message queue depth >100, image retrieval time >30 seconds
* **INFORMATIONAL**: Cache utilization >80%, scheduled maintenance windows

### **Vendor Escalation Matrix**

| **Component** | **L1 Support** | **L2 Engineering** | **Vendor Contact** |
|---------------|----------------|-------------------|-------------------|
| IRIS Engine | Internal Support | LucidHealth | 24/7 support line |
| Unifier Appliances | Internal Support | DICOM Systems | Business hours |
| PowerScribe 360 | Internal Support | Nuance | Priority support |
| Azure Platform | Internal Support | Microsoft | Enterprise support |
| PACS Systems | Internal Support | Vendor-specific | Varies by site |

## Troubleshooting Playbooks

### **"Images Not Loading" Response Protocol**

**Immediate Actions (0-5 minutes)**:
1. Verify user connectivity: Can they access other applications?
2. Check regional Unifier status: Is their local cache responding?
3. Test alternate workstation: Is this user-specific or systemic?

**Secondary Investigation (5-15 minutes)**:
1. Query IRIS message logs for recent DICOM transfers
2. Check Azure App Services health dashboard
3. Verify PowerScribe API connectivity if report-related

**Escalation Criteria**:
* Multiple users affected across different workstations
* Complete regional Unifier failure
* Azure service degradation confirmed

### **"Reports Missing from EMR" Response Protocol**

**Immediate Actions**:
1. Search IRIS HL7 logs for ORU message generation
2. Verify PowerScribe report completion status
3. Check RIS/EMR HL7 listener connectivity

**Root Cause Analysis**:
1. **PowerScribe Issue**: Report stuck in draft, dictation not completed
2. **IRIS Transformation Issue**: HL7 message format rejection by EMR
3. **Network Issue**: HL7 port blocked, VPN tunnel down
4. **EMR Issue**: Interface engine down, database connectivity problems

## Support Communication Templates

### **Clinical Staff Notifications**

**For Image Loading Issues**:

> "We're experiencing a temporary delay with image retrieval in RadAssist. Our team is actively working on the issue. Expected resolution: [timeframe]. Alternative viewing options: [local PACS workstation/backup system]. Contact IT at [number] for urgent cases."

**For Report Delivery Delays**:

> "There's currently a delay in report delivery to the EMR system. All dictations are being captured and will be delivered once service is restored. Estimated resolution: [timeframe]. For STAT reports, please contact Radiology directly at [number]."

### **Management Escalation Format**

**Subject**: [URGENT/WARNING] - Healthcare Imaging System Impact - [Site/Region]

**Impact**: [Number] users affected, [System] unavailable, Clinical workflow impact: [High/Medium/Low]

**Root Cause**: [Brief technical summary]

**Current Actions**: [Specific steps being taken]

**ETA for Resolution**: [Realistic timeframe with confidence level]

**Workarounds Available**: [Alternative processes for clinical staff]

## Preventive Maintenance & Monitoring

### **Weekly Health Checks**

* Review message processing volumes for anomalies
* Verify backup completion across all environments
* Check certificate expiration dates (warn at 30 days)
* Analyze performance trends for capacity planning

### **Monthly System Reviews**

* Regional Unifier storage utilization analysis
* IRIS database maintenance and optimization
* Azure resource utilization assessment
* Vendor patch management coordination

### **Quarterly Business Reviews**

* Service level agreement (SLA) performance reporting
* Capacity planning projections based on growth trends
* Disaster recovery testing and documentation updates
* Technology refresh planning and budget recommendations

This support framework ensures rapid problem identification, a path to efficient resolution, and clear communication channels while maintaining the critical healthcare imaging workflow that clinical staff depend on for patient care.
`;

export const SYSTEM_COMPONENTS: SystemComponent[] = [
    { id: 'pacs', name: 'PACS Systems', description: 'Picture Archiving and Communication System.', details: ["Vendor-specific per site.", "Source of DICOM images."], colorClass: 'text-brand-accent-green' },
    { 
      id: 'unifier', 
      name: 'Unifier Appliances', 
      description: 'On-premise caching and connectivity appliances.', 
      details: ["Located in 5 regions.", "Monitor storage (3TB), cache, and volume."], 
      colorClass: 'text-brand-accent-green',
      unifierStatus: {
        serviceStatus: 'Online',
        cacheUsage: 85,
        recentErrors: {
            count: 3,
            lastError: 'DICOM C-STORE failed: timeout connecting to PACS-XYZ.'
        }
      }
    },
    { id: 'iris', name: 'IRIS Engine', description: 'Core HL7 & API integration engine.', details: ["Runs on Azure VMs.", "Handles message transformation and routing."], colorClass: 'text-brand-accent-cyan' },
    { id: 'powerscribe', name: 'PowerScribe 360', description: 'Dictation and reporting system by Nuance.', details: ["Integrates via HTTPS API.", "Failures can halt report workflows."], colorClass: 'text-brand-accent-pink' },
    { id: 'risemr', name: 'RIS/EMR', description: 'Radiology Information System / Electronic Medical Record.', details: ["Receives final reports via HL7.", "Critical for patient record integrity."], colorClass: 'text-brand-accent-pink' },
    { id: 'radassist', name: 'RadAssist', description: 'Primary diagnostic workstation for radiologists.', details: ["Pulls images via Unifier.", "Performance is a key KPI."], colorClass: 'text-brand-accent-purple' },
];

export const CONNECTIONS: Connection[] = [
    { from: 'pacs', to: 'unifier', label: 'DICOM' },
    { from: 'unifier', to: 'iris', label: 'HTTPS' },
    { from: 'radassist', to: 'unifier', label: 'DICOM' },
    { from: 'iris', to: 'powerscribe', label: 'API' },
    { from: 'iris', to: 'risemr', label: 'HL7' },
];

export const ICONS: Record<string, React.ReactElement<IconProps>> = {
    DICOM: <DicomIcon className="w-5 h-5 text-info" />,
    HL7: <HL7Icon className="w-5 h-5 text-warning" />,
    API: <ApiIcon className="w-5 h-5 text-normal" />,
    HTTPS: <ApiIcon className="w-5 h-5 text-normal" />,
    SYSTEM: <SystemIcon className="w-6 h-6 text-brand-subtle" />
};

export const DICOM_WIZARD_TREE: DecisionTree = {
  start: { text: "What is the primary symptom?", options: [{ text: "Images not loading / slow", next: 'local' }, { text: "Connectivity issues", next: 'network' }, { text: "Platform-wide outage", next: 'cloud' }], colorClass: 'bg-info/10 border-info'},
  local: { text: "Is the issue localized to one Unifier?", options: [{ text: "Yes, seems local", next: 'cache' }, { text: "No, multiple regions affected", next: 'network' }], colorClass: 'bg-info/10 border-info'},
  network: { text: "Check network connectivity to Azure.", options: [{ text: "HTTPS to App Services OK", next: 'dns' }, { text: "HTTPS failing", next: 'https' }], colorClass: 'bg-info/10 border-info'},
  cloud: { text: "Is Azure reporting service health issues?", options: [{ text: "Yes, degradation reported", next: 'azureHealth' }, { text: "No, all services green", next: 'redis' }], colorClass: 'bg-info/10 border-info'},
  cache: { text: "Check local Unifier cache utilization.", resolution: "If >90%, purge old studies. Check DICOM C-STORE operations from PACS. As a last resort, restart Unifier services.", colorClass: 'bg-normal/10 border-normal'},
  cstore: { text: "Verify DICOM C-STORE from PACS.", resolution: "Ensure PACS is sending studies correctly to the Unifier appliance. Check logs on both systems.", colorClass: 'bg-normal/10 border-normal'},
  restart: { text: "Restart Unifier services.", resolution: "If other steps fail, perform a controlled restart of the Unifier services. Monitor system upon restart.", colorClass: 'bg-warning/10 border-warning'},
  https: { text: "Check firewall logs.", resolution: "Review firewall logs for blocked connections to Azure App Services. Ensure rules are correct.", colorClass: 'bg-normal/10 border-normal'},
  firewall: { text: "Check firewall logs.", resolution: "Review logs for blocked connections to cloud endpoints.", colorClass: 'bg-normal/10 border-normal'},
  dns: { text: "Verify DNS resolution.", resolution: "Ensure DNS correctly resolves all cloud endpoints. Use nslookup or dig for diagnostics.", colorClass: 'bg-normal/10 border-normal'},
  azureHealth: { text: "Monitor Azure Service Health Dashboard.", resolution: "Communicate status to users based on Azure updates. Escalate to cloud operations team for internal impact assessment.", colorClass: 'bg-warning/10 border-warning'},
  redis: { text: "Check Redis Cache performance metrics.", resolution: "High latency or errors in Redis could be the bottleneck. Analyze metrics in Azure Portal.", colorClass: 'bg-normal/10 border-normal'},
  escalateCloud: { text: "Escalate to Cloud Operations.", resolution: "If all else fails, escalate to the Cloud Operations team with all collected diagnostic data.", colorClass: 'bg-critical/10 border-critical'},
};

export const HL7_WIZARD_TREE: DecisionTree = {
  start: { text: "What is the primary symptom of the HL7 failure?", options: [{ text: "Reports missing from EMR", next: 'check_ps' }, { text: "Billing data is incorrect", next: 'check_ps' }], colorClass: 'bg-info/10 border-info'},
  check_ps: { text: "Is the report finalized in PowerScribe?", options: [{ text: "Yes, it is finalized", next: 'check_iris' }, { text: "No, it's in draft/pending", next: 'resolve_ps' }], colorClass: 'bg-info/10 border-info'},
  resolve_ps: { text: "Finalize the report in PowerScribe.", resolution: "The radiologist needs to finalize the report. Once finalized, the ORU message will be generated and sent.", colorClass: 'bg-normal/10 border-normal' },
  check_iris: { text: "Check the IRIS Engine message queue.", options: [{ text: "Queue is backlogged or shows errors", next: 'resolve_iris_queue' }, { text: "Queue is clear, message sent", next: 'check_emr' }], colorClass: 'bg-info/10 border-info'},
  resolve_iris_queue: { text: "Reprocess failed messages from the IRIS dead letter queue.", resolution: "Investigate the cause of the backlog. It could be malformed data or endpoint connectivity. Reprocess messages once the root cause is fixed.", colorClass: 'bg-warning/10 border-warning'},
  check_emr: { text: "Verify the EMR/RIS HL7 listener status.", options: [{ text: "Listener is down or unresponsive", next: 'resolve_emr_listener' }, { text: "Listener is up and running", next: 'check_network' }], colorClass: 'bg-info/10 border-info'},
  resolve_emr_listener: { text: "Restart the HL7 listener on the EMR/RIS.", resolution: "Contact the EMR/RIS vendor or local IT to restart the interface listener. Verify connectivity from the IRIS engine.", colorClass: 'bg-normal/10 border-normal'},
  check_network: { text: "Is there a network path issue?", resolution: "Verify firewall rules, VPN tunnels, and port accessibility between IRIS and the destination system. A network issue could be dropping the messages.", colorClass: 'bg-warning/10 border-warning'},
};

export const POWERSCRIBE_WIZARD_TREE: DecisionTree = {
  start: { text: "What is the primary symptom of the PowerScribe integration failure?", options: [{ text: "Dictations not triggering or reports are stuck", next: 'api_connectivity' }, { text: "Workflow is disrupted for a specific user/group", next: 'user_specific' }], colorClass: 'bg-info/10 border-info'},
  api_connectivity: { text: "First, let's check API connectivity. Is the HTTPS endpoint between IRIS and the PowerScribe API reachable?", options: [{ text: "Yes, the endpoint is reachable", next: 'auth_status' }, { text: "No, the endpoint is down or timing out", next: 'resolve_api_down' }], colorClass: 'bg-info/10 border-info'},
  resolve_api_down: { text: "Troubleshoot the network path.", resolution: "The API endpoint is unreachable. Investigate potential network issues like firewall blocks, DNS problems, or a service outage on the PowerScribe side. Coordinate with the network team and Nuance support if necessary.", colorClass: 'bg-warning/10 border-warning'},
  auth_status: { text: "API is up. Now, check the authentication status. Are there any expired tokens or invalid certificates?", options: [{ text: "Yes, there's an authentication error", next: 'resolve_auth' }, { text: "No, authentication seems valid", next: 'check_db' }], colorClass: 'bg-info/10 border-info'},
  resolve_auth: { text: "Resolve the authentication issue.", resolution: "Update the expired API tokens or renew the invalid certificates. This often requires coordination with the PowerScribe administrator.", colorClass: 'bg-normal/10 border-normal'},
  check_db: { text: "Authentication is OK. Let's check the database. Query Azure SQL for pending report transactions related to the issue.", options: [{ text: "Found stuck transactions in the database", next: 'resolve_db' }, { text: "No relevant stuck transactions found", next: 'escalate_nuance' }], colorClass: 'bg-info/10 border-info'},
  resolve_db: { text: "Address the stuck database transactions.", resolution: "Investigate why the report transactions are stuck. This may require manual intervention in the database or fixing an underlying logic bug in the IRIS engine. Escalate to L2 Engineering with the transaction details.", colorClass: 'bg-warning/10 border-warning'},
  user_specific: { text: "The issue seems user-specific.", resolution: "Investigate user permissions and configuration within PowerScribe and the IRIS engine. It could be a misconfigured user profile or group policy. Compare with a working user's configuration.", colorClass: 'bg-normal/10 border-normal'},
  escalate_nuance: { text: "All checks passed, but the issue persists.", resolution: "At this point, the issue is likely within the PowerScribe system itself. Escalate to Nuance priority support with all the diagnostic steps you've taken.", colorClass: 'bg-critical/10 border-critical'},
};

export const INCIDENT_ASSESSMENTS: IncidentAssessmentDoc[] = [
    {
        id: 'hl7',
        title: 'HL7 Failures: Reports Missing from EMR/RIS',
        content: `
This issue directly relates to failures in the HL7 message flow. [cite_start]When a radiologist completes a report, it should be sent as an ORU (Observation Result) message to the hospital's EMR and to billing systems[cite: 1, 2, 34].

* **Symptom**: Reports not appearing in the RIS/EMR, billing discrepancies, or missing patient data.
* **Integration Points of Failure**:
    * [cite_start]**PowerScribe 360**: The report may be stuck in a pending or draft status and has not been finalized to generate an HL7 message[cite: 15, 19, 32].
    * **LucidHealth IRIS Engine**: This is the central hub for message processing. [cite_start]A failure here is a primary cause[cite: 12, 14, 22]. [cite_start]It is responsible for transforming and routing messages from PowerScribe to their destination[cite: 1, 2, 33, 34].
    * **Lucid Technologies / Zotec Billing**: These are the downstream recipients for business intelligence and billing information. [cite_start]Connectivity issues can prevent them from receiving final report data[cite: 20, 27, 29, 34].
    * **Site's EMR/RIS**: The receiving system at the hospital may have its own interface engine or HL7 listener that is failing.
* **Potential Root Causes**:
    * **Message Queue Backlog**: IRIS may have a backup of messages that are not being processed, or there could be a high number of failed retries.
    * [cite_start]**Endpoint Connectivity Failure**: The HL7 listeners on the receiving systems, such as the hospital's EMR or Zotec Billing, may be down or unreachable[cite: 27].
    * **Malformed HL7 Data**: The message itself might have incorrect formatting or be missing required fields, causing the receiving system to reject it.
    * **Network Path Failure**: A firewall rule or a down VPN tunnel could be blocking the connection between the IRIS engine and the destination.
    * **Report Status in PowerScribe**: The report was never finalized by the radiologist, so an ORU message was never generated.
`
    },
    {
        id: 'dicom',
        title: 'DICOM Failures: Images Not Loading',
        content: `
This problem points to a failure in the DICOM data flow, which involves moving large imaging studies from a hospital's on-site PACS to the cloud-based RadAssist platform via a local Unifier appliance.

* **Symptom**: Images are slow to retrieve, do not load at all, or studies appear incomplete.
* **Integration Points of Failure**:
    * [cite_start]**Hospital PACS**: The source Picture Archiving and Communication System (PACS) may not be sending the images correctly[cite: 748, 805, 883].
    * [cite_start]**Unifier Appliance**: A physical or virtual machine on-site at the hospital or regional datacenter that caches images for faster retrieval[cite: 744, 763, 767, 772, 776]. [cite_start]It acts as a critical bridge between the local PACS and the cloud[cite: 744].
    * [cite_start]**Azure Public Cloud**: The core of the RadAssist platform, which includes App Services, Redis Cache, and storage that must be accessible for image viewing[cite: 824, 893].
    * [cite_start]**RadAssist Workstation**: The viewing station itself could have connectivity issues[cite: 819, 890].
* **Potential Root Causes**:
    * **Local Unifier Cache Issue**: The Unifier's 30-day cache may be over 90% full, requiring old studies to be purged.
    * **Network Connectivity**: HTTPS connectivity from the Unifier to Azure App Services could be blocked by a firewall, or there might be a DNS resolution problem.
    * **Cloud Platform Degradation**: A service outage within Azure or poor performance of the Redis Cache could impact image retrieval.
    * **Failed DICOM Transfer**: The DICOM C-STORE operation from the hospital's PACS to the Unifier may have failed.
    * **Unifier Services**: The services on the Unifier appliance itself may need to be restarted.
`
    },
    {
        id: 'powerscribe',
        title: 'PowerScribe Integration Failures',
        content: `
This issue disrupts the entire reporting workflow, as PowerScribe is the central dictation system where radiologists create their reports.

* **Symptom**: Dictations are not triggering correctly, reports are stuck in a "pending" status, or the normal reporting workflow is interrupted.
* **Integration Points of Failure**:
    * [cite_start]**LucidHealth IRIS and PowerScribe API**: IRIS communicates with PowerScribe via an API to automate the workflow[cite: 817, 818, 887, 888]. A failure in this connection is a critical failure point.
    * **Azure SQL Database**: The backend database stores the state of report transactions; issues here can leave reports in a pending state.
* **Potential Root Causes**:
    * **API Connectivity**: The HTTPS endpoints between the IRIS engine and the PowerScribe API are unreachable.
    * **Authentication Failure**: API access tokens may have expired, or security certificates may be invalid.
    * **Workflow State**: A query of the Azure SQL database could show that transactions for the affected reports are stuck.
    * **Clinical Impact**: The issue must be assessed for clinical urgency (e.g., a STAT report is a higher priority).
`
    },
    {
        id: 'performance',
        title: 'Performance Degradation: Latency & Errors',
        content: `
This assessment covers issues related to system slowdowns, high latency, and an increase in error rates, which can impact clinical workflows even if the system is technically "online."

* **Symptom**: Users report that image retrieval is slow, reports take too long to appear, or the system feels unresponsive.
* **Key Performance Indicators (KPIs) to Check**:
    * [cite_start]**Message Processing Latency**: The target for HL7 end-to-end delivery is under 30 seconds. If this KPI is breached, it indicates a bottleneck in the IRIS Engine or network path[cite: 55, 61].
    * [cite_start]**Image Retrieval Performance**: The target for loading DICOM studies is under 10 seconds. Slower times point to issues with the Unifier appliance, its cache, or cloud connectivity[cite: 56, 62].
    * [cite_start]**Cache Hit Ratio**: Unifier appliances aim for a cache hit ratio over 85%. A lower ratio means more requests are going to the slower cloud storage, increasing latency[cite: 58].
* **Potential Root Causes**:
    * **High Unifier Cache Utilization**: When a Unifier's cache exceeds 80-90% utilization, its performance can degrade. [cite_start]This often requires purging older studies to free up space[cite: 22, 59, 64].
    * **IRIS Engine Overload**: High message volumes can lead to backlogged queues in the IRIS engine. Check Azure monitoring for CPU and memory usage on the IRIS VMs.
    * **Network Bottlenecks**: Review network path performance, VPN tunnel stability, and firewall logs for any dropped packets or high latency between on-premise Unifiers and Azure.
    * **Database Performance**: Slow queries in the Azure SQL database can impact workflows that rely on it, such as PowerScribe report state management.
* **Alert Thresholds to Investigate**:
    * [cite_start]**WARNING**: A message queue depth over 100 or image retrieval times exceeding 30 seconds are considered warning-level events that require immediate investigation[cite: 63].
    * **INFORMATIONAL**: Cache utilization over 80% should be noted and monitored closely.
`
    },
];
