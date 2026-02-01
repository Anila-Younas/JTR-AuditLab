# JTR-AuditLab

JTR-AuditLab is a web-based password auditing laboratory designed for educational and authorized security testing in controlled environments. The project integrates the real John the Ripper engine with a modern frontend interface to demonstrate password auditing workflows, attack methodologies, and security assessment practices.

The focus of this project is on practical learning, transparency, and professional implementation rather than automated exploitation. It is intended for cybersecurity students, researchers, and professionals studying password security concepts.

---

## Disclaimer

This tool is intended strictly for educational purposes and authorized security testing. Unauthorized password cracking or testing of systems without explicit permission is illegal and unethical. Users are responsible for ensuring compliance with all applicable laws and institutional policies.

---

## Features

- Web-based graphical interface for password auditing
- Integration with John the Ripper for real audit execution
- Support for multiple datasets and audit sessions
- Real-time streaming output from audit processes
- Visual risk assessment based on audit results
- Historical audit session tracking
- PDF export of audit reports
- Responsive dark-themed interface suitable for lab environments

---

## Project Structure

```

JTR-AuditLab/
├── backend/                 # FastAPI backend server
│   ├── main.py              # API endpoints and audit logic
│   ├── requirements.txt     # Python dependencies
│   └── uploads/             # Uploaded hash files (runtime)
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # State management
│   │   ├── pages/           # Application pages
│   │   └── services/        # API communication layer
│   ├── package.json
│   └── vite.config.js
└── README.md

````

---

## Prerequisites

- Node.js 18 or higher
- Python 3.9 or higher
- John the Ripper installed and accessible via system PATH
- Windows or Linux operating system

---

## Backend Setup

1. Navigate to the backend directory:

   cd backend


2. Create and activate a virtual environment:

   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux / macOS
   source venv/bin/activate
   ```

3. Install required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:

   ```bash
   python main.py
   ```

The API will be available at `http://127.0.0.1:8000`.

---

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

---

## Usage Overview

### Dataset Upload

* Upload password hash files in supported formats
* Multiple datasets can be managed independently

### Audit Configuration

Supported audit modes include:

* Dictionary-based analysis
* Rule and pattern-based analysis
* Brute force testing
* Password policy compliance checks

### Audit Execution

* Audits run in real time using the John the Ripper backend
* Console output is streamed live to the interface
* Risk level is calculated dynamically based on results

### Reporting

* View historical audit sessions
* Export audit results as PDF reports for documentation

---



## Security Considerations

* Run only in isolated or controlled environments
* Implement authentication before any production deployment
* Remove uploaded datasets after use
* Maintain audit logs for accountability

---


## Author

Developed as an academic and practical cybersecurity project focused on password auditing and full-stack system design.
