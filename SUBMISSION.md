# CrossBorder Campus - SLAY HACKS 2026 Submission

**Project:** CrossBorder Campus - AI Life Assistant for International Students  
**Hackathon:** SLAY HACKS 2026 - https://slayy-hacks.devpost.com/  
**Repository:** https://github.com/lilfizz22/crossborder-campus  
**Team:** lilfizz22 (individual, first-time hackathon participant)

## 1. Project Name and Overview
CrossBorder Campus is an AI life assistant for international students living between two cities, for example Singapore and China. It shows a boarding-pass style journey, live SGD to CNY rates, budget tracking, and AI budget advice in one place.

## 2. Problem and Solution
**Problem:** International students juggle two currencies, two timelines, visa deadlines, and budgets in SGD and CNY. Exchange rates move daily, and important dates like return flights, visa expiry, and deadlines are easy to miss.

**Solution:** A single app with a dual-city timeline with countdowns, a live FX converter with remittance cashback calculation, expense tracking in SGD and CNY, AI budget advice, and reminders and checklists for return and re-entry.

**Who it helps:** International students, especially first-year students living between two countries.

## 3. AI Implementation
- **AI Budget Coach:** Uses a large language model to analyse anonymised monthly totals and return structured saving advice (headline, summary, 3 tips, one action for today). Only anonymised aggregates are sent, no personal identifiers.
- **Live FX data:** ExchangeRate-API for real-time SGD to CNY rates.
- **Rule-based reminders:** Deadline and checklist logic for return and re-entry.

## 4. Working Demo
Live demo is available as a fullstack web app built in Muse. Open the app, enable Demo Mode to see fictional demo data for student Lin Xiaoman, then try the Overview, AI Coach, FX, Expenses and Checklist tabs.

Demo Mode is required before recording or screenshots so no real personal data is shown.

## 5. Screenshots
Take screenshots in Demo Mode only:
- Overview - boarding-pass timeline and budget ring
- AI Coach - structured advice
- FX - live rate and converter
- Expenses and Checklist

## 6. Source Code
This repository. See README.md for setup. The app is TypeScript / React with server-side AI reasoning.

## 7. Project Demonstration Video
Video is recommended, 2-4 minutes, but not required if a live demo link is provided. If recording, use Demo Mode, record the Overview, AI Coach and FX tabs, no face needed.

## Privacy
All demo data is fictional. Demo Mode replaces all amounts, dates, expenses and todos with fictional data for student Lin Xiaoman and disables editing. No real personal financial data is included in this repository or in the submission.
