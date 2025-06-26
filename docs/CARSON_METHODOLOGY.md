# Carson Methodology Implementation

## Core Philosophy

"The biggest mistake that I do that everyone does is they try to rush through the context where you just don't have the patience to tell the AI what it actually needs to know to solve your problem" - Ryan Carson

## Three-File System Structure

### 1. PRD Generator
**Location**: `PROJECT_PLAN.md`
- Project-specific PRD templates
- Complete business requirements
- Technical specifications with acceptance criteria

### 2. Task List Generator  
**Implementation**: TodoWrite/TodoRead tools
- TDD-first task breakdown with AI optimization
- Single subtasks with specific test targets
- Human approval points between tasks

### 3. TDD Implementation Rules
**Principles**:
- Tests prevent token waste by defining exact implementation boundaries
- Agent Zero implements minimal code to pass one test at a time
- Stop after each subtask and report validation results
- No over-implementation beyond test requirements

## AI Orchestration Architecture

### Role Distribution

**Claude Code (Senior Developer/Technical Lead)**:
- System architecture and integration design
- Technical specification creation with detailed acceptance criteria
- TDD Test Design: Write comprehensive test suites before implementation
- Code review ensuring SOLID principles
- Context Control: Precise context management to prevent token waste

**Agent Zero (Implementation Specialist)**:
- Test-Driven Implementation: Write minimal code to pass specific tests only
- One Subtask Execution: Complete single subtask, stop, wait for approval
- Bounded Implementation: Tests define exact scope - prevents over-implementation

**Lovable (Rapid Prototyping)**:
- UI generation and basic CRUD operations
- Supabase integration and schema setup
- Mobile-first responsive design
- Fast MVP generation for validation

### Token Optimization Strategy (5-10x Efficiency)

- **TDD Guardrails**: Tests prevent expensive over-implementation loops
- **Subtask Boundaries**: Methodology stops runaway token consumption
- **Context Precision**: Exact specifications, not open-ended tasks
- **Human Approval Points**: Natural stopping points after each subtask

## Enhanced Management Flow

1. User provides strategic direction and design requirements
2. Claude creates structured PRD using project-specific templates
3. Claude writes comprehensive test suite defining exact implementation boundaries
4. Claude breaks down into single subtasks with specific test targets
5. Agent Zero implements minimal code to pass one test at a time
6. Agent Zero stops after each subtask and reports validation results
7. Claude reviews test passage and implementation against design philosophy
8. User approves completion before proceeding to next subtask

## Git Integration for Context Management

### Single Source of Truth
- All code, documentation, and project artifacts in single Git repository
- Complete project history maintains all decisions and iterations
- No export/import friction between AI tools
- Continuous context awareness for all AI agents

### Version Control Workflow
- **main**: Production-ready code
- **dev**: Lovable integration and development work  
- **feature/***: Agent Zero implementation branches
- **Pull Requests**: Human approval points for major changes

## Success Metrics for This Project

### Efficiency Indicators
- 5-10x token efficiency improvement achieved ✓
- TDD guardrails prevent over-implementation ✓
- Human approval points maintain quality control ✓
- Design philosophy preserved through AI coordination ✓

### Technical Validation
- Working MVP in 1-3 days
- 538+ dispensary autocomplete performs <2 seconds
- Mobile-first survey completes in <30 seconds
- ROI analysis correctly correlates visit data with Hoodie reports

---

**Implementation Status**: Active  
**Current Phase**: Git Setup Complete  
**Next Phase**: Lovable MVP Generation