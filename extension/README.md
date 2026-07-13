# GradePilot

GradePilot is a browser tool built for Air University students. It reads your student portal grade report and calculates your true academic standing. It applies university retake rules automatically and helps you plan your future semesters.

## What It Does For You

Calculate True Grades
The tool calculates your Semester GPA and Cumulative GPA. It drops non credit courses and applies the best grade for retaken subjects. 

Plan Your Degree
Input a target score. The tool tells you exactly what grades you need in your remaining semesters to graduate with that score. 

Simulate Retakes
Find out exactly how much your score will increase if you retake specific past courses. The tool ranks your past classes to show you where to spend your effort. 

## How To Install 

There are currently two ways to install GradePilot on your computer.

Install from a ZIP File
1. Download the extension ZIP file and extract it.
2. Open Google Chrome and go to the extensions page.
3. Turn on Developer Mode in the top right.
4. Click Load unpacked and select your extracted folder.
5. Log into the student portal and view your grade report. 

Install from GitHub
Developers can clone this repository directly. 
1. Run git pull to get the latest code.
2. Follow the steps above to load the unpacked extension in Chrome. 

Coming Soon Windows Setup Wizard
We are building a dedicated Windows installer. Soon you will be able to download a standard executable file. You will double click the installer and it will automatically handle the folder creation and setup process for you. 

## How It Works Under The Hood

GradePilot uses clean ES2022 Vanilla JavaScript and follows strict security policies. 

User Interface
The tool renders its interface inside a Shadow DOM. This isolates the styles and prevents the extension from breaking the university portal layout. 

Data Extraction
The parser reads the HTML structure of the university portal and extracts your course names and grades. 

Math Engine
The engine calculates all grades. It strictly enforces the university policy to handle repeated courses and summer classes. 

Data Storage
Your data never leaves your browser. The tool uses local browser storage to save your settings. 

## License

This project is open source. You may reuse and modify this code. 

Designed by Ahmad Kaleem Bhatti 
Read the User Manual for complete instructions.
