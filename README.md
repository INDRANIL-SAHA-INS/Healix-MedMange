
# HEALIX

Healix is an AI-powered mobile health platform that helps traveling doctors provide consistent and efficient healthcare across multiple rural communities. It enables seamless patient data collection, storage, and retrieval, eliminating the need for paper records. The platform supports chronic disease tracking, AI-driven insights for predictive health analysis, and automated alerts for timely follow-ups. With a focus on Responsible AI and data privacy, Healix empowers healthcare providers with decision support tools to improve patient outcomes. Designed for commercial deployment, it ensures scalability and reliability for real-world medical use.


## Features

- *User Hierarchy:* The system includes three main user types: Admin, Doctor, and Assistant. Admins can add real, qualified doctors and community health workers (assistants) from various areas.
- *Appointment Management:* Both Admins and Doctors can add and manage appointments before visits.
- *Health Report Form:* Doctors can create comprehensive health reports with sections for:
  - Basic Info
  - Vital Signs
  - General Health
  - Pain & Discomfort
  - Digestion
  - Chronic Conditions
  - Lifestyle
  - Women's Health
  - Family Health
  - Mental Health
  - Heart Health
  - Vaccination History
  - Prescription
- *Patient Data Tracking:* The health report is stored safely in the database and can be retrieved using filters (date, region, name, criticality). The system supports predictions for health deterioration and arranges appointments based on urgency.
- *Messaging & Chat:* Doctors and Assistants can message each other. There is also a dedicated AI chat feature for helping doctors analyze patient data and improve diagnosis.
- *AI-Powered Insights:* The AI model is trained on extensive medical data and helps doctors manage chronic diseases, predict health deterioration, and offer better treatment recommendations.
## Installation

BACKEND

Download the .env file from the google drive link sent paste it in the Backend folder.

Download the zip file for copy paste in the terminal
```bash
  https://github.com/jhinu55/HEALIX.git
```
USING LOCAL LLMS(Only if you have gpu , can run on cpu but slow)

Install ollama (command for linux . Can be downloaded from https://ollama.com/download)
```bash
  curl -fsSL https://ollama.com/install.sh | sh
```
Pull the required models
```bash
  ollama pull mistral
  ollama pull llama3
  ollama pull llava
```

USING FREE GROQ API KEY

Go to https://console.groq.com/keys. Generate a api key and save it.

Delete the medical_chat.py and table_analysis.py.Cut and paste the files inside groq folder to Backend

Create a .env file store your api key as GROQ_API_KEY="<paste actual api key here>" 

You are Good to go now:)

Extract the file and open in VS CODE and setup the Backend by creating a virtual environment and downloading the required libraries(commands are for linux user).
```bash
  cd Backend 
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
```
Run the Backend
```bash
  python3 app.py 
```
OR
```bash
  python app.py
```



FRONTEND

Download the .env file from the google drive link(given in ppt) sent paste it in the Frontend folder.

Open a folder in a new Vs Code window.Open the project folder. Type the following in the terminal
```bash
  cd FRONTEND1
  npm install init
```

For test run, the logoin credentials are written in the google drive shared in ppt


## Technologies used
Frontend: React.js,Vite,Typescript,Tailwind css, Lucid, React router

Backend:Supabase,Node.js,Python,Flask,Lanchain,Tensorflow,Keras,Numpy,Pandas

## Contact


Indranil Saha:

Github: https://github.com/INDRANIL-SAHA-INS

Linkedin : https://www.linkedin.com/in/indranilsaha6

Shreya Baid: 

Github: https://github.com/jhinu55

Linkedin: https://www.linkedin.com/in/shreya-baid-550443351/




