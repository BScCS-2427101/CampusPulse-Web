# CampusPulse Web - Final Presentation Guide

This document outlines the recommended workflow for a comprehensive and successful college project demonstration of CampusPulse Web.

## Pre-Requisites
Ensure your terminal is pointed at the root of `CampusPulse_Web`.

## STEP 1: Start Web App
Double-click `start_web_app.bat` to launch the backend and frontend simultaneously.
Open your browser to `http://127.0.0.1:5173`.
*Talking Point:* "Welcome to CampusPulse Web. This platform brings the entire CampusPulse analytical engine into a modern, responsive React interface, backed by a robust FastAPI backend."

## STEP 2: Dashboard Overview
Navigate to the **Dashboard** via the sidebar.
*Talking Point:* "Our Executive Dashboard provides an immediate macro-view of the university. We're tracking 100 total students across 100 programs with an average assessment score of ~68.1. Notice the quick access to Academic Risk counts at a glance."

## STEP 3: Practical 13 - Academic Performance
Navigate to **Practical 13**.
*Talking Point:* "This module isolates Academic Performance. Using 9 dedicated visualizations, we map Average Assessment Scores by Program, trace Pass Percentages, and investigate the correlation between Attendance and final Scores. The filters dynamically drill into specific semesters without reloading the page."

## STEP 4: Practical 14 - Student Risk and Behaviour
Navigate to **Practical 14**.
*Talking Point:* "Here, we transition from pure performance to behavioural risk. We segment our analytical base (68 enrolled students) and isolate our 'High Risk' demographic—currently standing at 2 students. We also identify missing operational data, like the 67 'Not Specified' scholarship records."

## STEP 5: Practical 15 - Historical Trends + Forecast
Navigate to **Practical 15**.
*Talking Point:* "Looking forward, Practical 15 leverages our historical datasets to map chronological trends. The system automatically applies a hybrid forecasting model—falling back to a 2-period Simple Moving Average (SMA) for short timelines, and deploying Linear Regression (`numpy.polyfit`) for histories extending over 4 periods."

## STEP 6: Storytelling
Navigate to **Storytelling**. Click **Enter Presentation Mode**.
*Talking Point:* "To streamline academic presentations, the Storytelling module strings these analytics into an 8-stage narrative. We can navigate cleanly from 'Campus Overview' down to 'Insights & Actions' using arrow keys."

## STEP 7: Live Simulation
Navigate to **Live Data Simulation**. Ensure role is set to **Admin**.
*Talking Point:* "CampusPulse isn't just a static reporting tool; it reacts to live database changes. I will hit 'Simulate One Update'—which mutates a student's grades or attendance behind the scenes. Notice how navigating back to the Dashboard instantly reflects the new mathematical baseline securely, without a page reload."

## STEP 8: Data Quality
Navigate to **Data Quality**.
*Talking Point:* "Trusting analytics requires trusting the data. Our Quality module evaluates the Live dataset in real-time, instantly identifying anomalies like students who have 'Credits Earned' exceeding their 'Credits Attempted', or highlighting missing structural referential integrity."

## STEP 9: Export Center
Navigate to **Export Center**.
*Talking Point:* "For offline analysis, we offer secure extraction. With one click, we can generate a high-fidelity PNG of our Dashboard, or download a fully structured Multi-Sheet `.xlsx` workbook of our Live Dataset."
*(Click the PNG and XLSX buttons to demonstrate the download).*

## STEP 10: Reset
Return to **Live Data Simulation**. Click **Reset Live Dataset**.
*Talking Point:* "Finally, for the next demonstration, we simply hit Reset. This securely reinstates the immutable Original Dataset baseline, guaranteeing consistent analytics for every presentation."

---
*End of Demonstration.* Run `stop_web_app.bat` to gracefully terminate the servers.
