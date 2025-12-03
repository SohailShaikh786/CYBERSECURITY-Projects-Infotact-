# Threat Intelligence Feed Processor and Anomaly Detector

## Overview

A comprehensive web-based threat intelligence platform that automates the collection, storage, and analysis of security threat data. The system correlates network and system logs with known Indicators of Compromise (IOCs) to detect potential security threats in real-time.

## Key Features

### 1. **Dashboard Overview**
- Real-time statistics on IOCs, logs, and alerts
- System status monitoring
- Recent security alerts feed
- Quick access to all major functions

### 2. **Threat Intelligence Feed Management**
- Integration with multiple threat intelligence sources:
  - AlienVault OTX
  - AbuseIPDB
  - Malware Domain List
  - EmergingThreats
- Automatic feed updates and synchronization
- Source status monitoring

### 3. **IOC Database**
- Comprehensive storage of threat indicators:
  - Malicious IP addresses
  - Suspicious domains
  - File hashes (MD5, SHA1, SHA256)
- Advanced search and filtering capabilities
- Severity classification (Critical, High, Medium, Low)
- Confidence scoring for each indicator

### 4. **Log Processing Engine**
- Support for multiple log types:
  - Network logs
  - System logs
  - Application logs
- Real-time log ingestion
- Automatic parsing and normalization
- Processing status tracking

### 5. **Correlation Engine**
- Automated log-to-IOC correlation
- Pattern matching algorithms
- Confidence scoring for matches
- Automatic alert generation on detection

### 6. **Security Alerts**
- Real-time threat detection alerts
- Severity-based classification
- Alert lifecycle management:
  - New → Acknowledged → Resolved
- Detailed alert information with context
- Alert filtering and search

### 7. **Simulated Log Generator**
- Generate realistic test logs
- Include benign and malicious indicators
- Support for all log types
- Perfect for testing and validation

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Hooks

### Backend
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Authentication**: Ready for Supabase Auth integration

### Database Schema

#### Tables
1. **threat_sources** - Threat intelligence feed sources
2. **iocs** - Indicators of Compromise
3. **logs** - System and network logs
4. **alerts** - Security alerts
5. **correlation_results** - Log-IOC correlation data

#### Key Features
- Optimized indexes for fast queries
- RPC functions for complex operations
- Automatic correlation processing
- Dashboard statistics aggregation

## Security Features

- No hardcoded secrets or API keys
- Secure database access through Supabase
- Input validation and sanitization
- Error handling with user-friendly messages
- Audit trail for all security events

## Sample Data

The system comes pre-populated with demonstration data:
- 4 threat intelligence sources
- 13 IOCs (IPs, domains, hashes)
- 9 sample logs (benign and malicious)
- 7 security alerts

## Use Cases

1. **Security Operations Center (SOC)**
   - Monitor incoming threats
   - Correlate logs with threat intelligence
   - Manage security incidents

2. **Threat Hunting**
   - Search for specific IOCs
   - Analyze log patterns
   - Identify potential compromises

3. **Incident Response**
   - Quick threat identification
   - Alert triage and management
   - Investigation support

4. **Security Testing**
   - Generate test scenarios
   - Validate detection capabilities
   - Train security teams

## Future Enhancements

- Real-time API integration with threat feeds
- Machine learning-based anomaly detection
- Automated response actions
- Integration with SIEM systems
- Custom alert rules and thresholds
- Export and reporting capabilities
- Multi-tenant support
- Role-based access control

## Performance

- Fast database queries with optimized indexes
- Efficient correlation algorithms
- Responsive UI with loading states
- Pagination for large datasets
- Real-time updates without page refresh

## Compliance

The system supports security compliance requirements:
- Audit logging
- Data retention policies
- Access control (ready for implementation)
- Incident documentation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design)

## Responsive Design

- Desktop-first approach
- Fully responsive on tablets and mobile
- Touch-friendly interface
- Optimized for various screen sizes
