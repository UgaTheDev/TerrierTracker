# Terrier Tracker

A comprehensive degree planning platform for Boston University students to track academic progress, validate graduation requirements, and optimize course selection across 5,000+ courses.

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)

## 🎯 Overview

Terrier Tracker revolutionizes academic planning for BU students by automating degree requirement validation and providing real-time progress tracking. The platform eliminates the need for manual degree audits, reducing planning time by ~75% while ensuring students stay on track for graduation.

**Live Demo:** [terrier-tracker.vercel.app](https://terrier-tracker.vercel.app)

## ✨ Key Features

### Academic Planning
- **Intelligent Course Tracking** - Monitor progress across all BU Hub requirements and major/minor requirements
- **Real-time Validation** - Instant feedback on degree completion status as courses are added
- **Course Search** - Search and filter through 5,000+ BU courses with autocomplete
- **Progress Visualization** - Clear visual indicators for requirement fulfillment

### Smart Analysis
- **Requirement Calculator** - Automatically maps courses to Hub areas and calculates credits
- **Graduation Timeline** - Projects completion date based on current progress
- **Course Recommendations** - Suggests courses to efficiently fulfill remaining requirements

### User Experience
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- **Dynamic Forms** - Client-side validation with instant error feedback
- **Persistent Sessions** - Save and resume planning across multiple sessions
- **Export Functionality** - Download degree plans as PDF or shareable links

### Security & Authentication
- **Google OAuth 2.0** - Secure BU student authentication
- **Role-based Access** - Protected routes with session management
- **Data Privacy** - Encrypted storage of academic records

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- React Hook Form
- Zustand (state management)

**Backend**
- Flask 3.1.2
- Flask-CORS 6.0.1
- Python 3.11+
- Google Auth (OAuth 2.0)
- Bcrypt (password hashing)
- PyPDF (document handling)

**Database**
- PostgreSQL 15
- psycopg2-binary
- Optimized indexing for sub-second queries

**Deployment**
- Frontend: Vercel (Edge Network)
- Backend: Railway
- Database: Railway PostgreSQL
- CI/CD: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Google OAuth credentials

### Installation

#### Backend Setup

1. **Navigate to backend directory**
```bash
   git clone https://github.com/yourusername/terrier-tracker.git
   cd terrier-tracker/backend

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Google OAuth credentials

### Installation

#### Frontend Setup

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/terrier-tracker.git
   cd terrier-tracker/frontend
