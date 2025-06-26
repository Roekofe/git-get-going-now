# Dispensary Survey ROI Tracking System - Complete Project Plan

## Project Overview

**Objective**: Build a web survey system for tracking brand ambassador visits to dispensaries with automated ROI measurement using 4-week pre/post sales analysis.

**Business Problem**: Need to verify ROI on brand ambassador/sales rep visits to individual dispensaries by comparing product performance against market trends to isolate actual impact from seasonal/market effects.

## Current Assets

### Data Foundation (Already Complete)
- **dispensary_matcher.py** - Address-based matching script between Hoodie and OLCC data
- **dispensary_survey_master.csv** - 538 verified dispensaries with 95%+ verification rate
- **Data Structure**: Survey_Display_Name, Hoodie_ID, Verified_License, Match_Type, Confidence_Score, Is_Verified
- **Hoodie Export Fields**: Banner, street address, city, state, postal code, website
- **OLCC Integration**: License verification and active business status

### ROI Methodology (Business Logic Defined)
- **4-Week Analysis Window**: 4 weeks pre-visit + 4 weeks post-visit
- **Market Trend Control**: Pull identical timeframes for market data to negate seasonal effects
- **Product Specificity**: Compare apples-to-apples (edibles vs edibles, gummies vs gummies)
- **True ROI Calculation**: Include all costs (labor, gas, samples) vs estimated lift
- **Market Comparison**: Use market trend differential to isolate actual impact

## Technical Architecture

### Core Stack Decision
- **Frontend**: React/Next.js (Lovable-generated, mobile-first)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Development**: Lovable for speed + Claude Code for intelligence + Agent Zero for implementation
- **Version Control**: Git-centric workflow for total context awareness
- **Deployment**: GitHub Actions + automated CI/CD

### Data Integration Constraints
- **Hoodie Limitation**: No API endpoints available, only scheduled report delivery
- **Report Schedule**: Monthly data delivered ~1 week into next month (e.g., February data available ~March 7th)
- **Analysis Timing**: 8-week window (4 pre + 4 post) requires validation of available monthly data
- **Batch Processing**: ROI analysis must be batch-processed when sufficient data arrives

## Implementation Plan

### Phase 1: Git-Centric Foundation (Day 1, Morning)
- Create `dispensary-survey` GitHub repository
- Initialize with Carson methodology documentation
- Import existing assets (dispensary_survey_master.csv, dispensary_matcher.py)
- Set up branch strategy: main (production), dev (Lovable sync), feature/* (Agent Zero tasks)

### Phase 2: Lovable MVP Generation (Day 1, Afternoon)
- Connect Lovable to GitHub repository
- Generate mobile-first survey app with Supabase integration
- Create autocomplete for 538+ dispensaries with server-side filtering
- Import dispensary CSV directly to Supabase
- Configure 3-character minimum search with performance optimization

### Phase 3: Claude Code Strategic Enhancement (Day 2)
- Analyze exported Lovable code in Git
- Optimize autocomplete performance for 538+ dispensaries
- Design TDD tests for business logic
- Enhance database schema for visit tracking and ROI analysis

### Phase 4: Hoodie Integration Architecture (Day 2-3)
- **Visit Recording System**: Capture timestamp, dispensary (via Hoodie ID), rep info
- **Data Availability Calculator**: Logic to determine if 8-week analysis window has sufficient monthly data
- **Analysis Status Tracking**: "Pending", "Partial", "Complete" flags
- **Batch Processing Pipeline**: Automated ROI calculation when monthly reports arrive

### Phase 5: Carson Methodology TDD Implementation
- **Core MVP Tests**: Rep can select dispensary and log visit in <30 seconds on mobile
- **Data Integrity Tests**: Visit records correctly map to Hoodie IDs
- **Performance Tests**: Autocomplete responds in <2 seconds with 538+ options
- **Business Logic Tests**: ROI analysis correctly correlates visit dates with available monthly data

### Phase 6: Agent Zero Targeted Implementation (Day 3-4)
- Task 1: Implement advanced autocomplete component
- Task 2: Create date range availability calculator
- Task 3: Build ROI analysis queue processor
- Task 4: Add mobile-optimized form validation
- **Process**: Single-task focus with human approval between each task

## Database Schema Design

### Core Tables
```sql
-- Import from existing dispensary_survey_master.csv
dispensaries (
    id, hoodie_id, survey_display_name, verified_license, 
    match_type, confidence_score, is_verified
)

-- Track brand ambassador visits
visits (
    id, dispensary_id, rep_id, visit_timestamp, 
    visit_purpose, samples_given, estimated_cost, notes,
    analysis_status, expected_complete_date
)

-- Track available monthly data from Hoodie
monthly_data_inventory (
    id, year, month, date_received, data_coverage,
    records_count, processing_status
)

-- Store ROI analysis results
roi_analysis (
    id, visit_id, analysis_date, pre_period_start, pre_period_end,
    post_period_start, post_period_end, our_product_lift,
    market_trend_lift, net_impact, estimated_revenue,
    total_costs, calculated_roi, data_quality_score
)

-- User management for reps
users (
    id, email, name, role, territory, active
)
```

## Business Logic Implementation

### Data Availability Logic
- **Visit Date**: February 15th
- **Required Data**: January + February + March monthly reports
- **Available When**: ~April 7th (March data arrives ~April 7th)
- **Status Updates**: Automatically update analysis status as monthly data arrives

### ROI Calculation Process
1. **Pre-Period Analysis**: 4 weeks before visit date
2. **Post-Period Analysis**: 4 weeks after visit date
3. **Market Trend Baseline**: Same periods for market data
4. **Net Impact Calculation**: (Our lift - Market trend lift)
5. **Cost Analysis**: Labor + gas + samples + opportunity cost
6. **ROI Formula**: (Net Revenue Impact - Total Costs) / Total Costs

## Success Metrics

### Speed Validation (Week 1)
- Working survey app deployed in 1 day
- Real rep tests mobile workflow by day 3
- First visit logged with correct Hoodie ID mapping

### Business Validation (Week 2)
- Monthly data availability logic working
- ROI analysis queue populated with visit records
- Manual correlation of one visit to Hoodie sales data

### Technical Validation (Week 3)
- 538+ dispensary autocomplete performing <2 seconds
- Mobile-first responsive design tested in field
- Supabase real-time updates working reliably

## Risk Mitigation

### Technical Risks
- **Lovable Limitations**: Export to Git immediately, Claude Code takes over development
- **Performance Issues**: Server-side filtering, proper indexing, caching strategies
- **Data Quality**: Verification flags, confidence scoring, manual review processes

### Business Risks
- **Delayed ROI Analysis**: Clear expectations about monthly data timing
- **Incomplete Data**: Partial analysis capabilities, data quality flags
- **User Adoption**: Mobile-first design, <30 second workflow, minimal friction

## Carson Methodology Integration

### Three-File System
1. **PRD Generator**: This document serves as project-specific requirements
2. **Task List Generator**: TDD-first task breakdown with Agent Zero optimization
3. **TDD Implementation Rules**: Prevent token waste, single-task focus

### AI Orchestration Roles
- **Claude Code**: Strategic planning, complex business logic, code review
- **Lovable**: Rapid UI generation, basic CRUD operations, Supabase integration
- **Agent Zero**: Focused implementation, single-task execution with approval points
- **Git**: Single source of truth, context preservation, version control

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Advanced reporting dashboard
- Territory-based analytics
- Automated cost tracking integration
- Competitor analysis features

### Phase 3 Features
- Predictive ROI modeling
- Optimal visit scheduling
- Integration with CRM systems
- Advanced data visualization

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-26  
**Status**: Approved - Ready for Implementation  
**Next Step**: Phase 1 - Git Repository Setup