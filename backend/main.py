import os
import uuid
import json
import asyncio
import subprocess
import re
import signal

from datetime import datetime
from typing import Optional, Dict, List
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(
    title="JTR-AuditLab API",
    description="Backend API for John the Ripper password audit tool - Educational Use Only",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOHN_PATH = Path(r"C:\Users\USER\OneDrive\Desktop\john-1.9.0-jumbo-1-win64\run")
JOHN_EXE = JOHN_PATH / "john.exe"
JOHN_POT = JOHN_PATH / "john.pot"

if not JOHN_EXE.exists():
    print(f"WARNING: John the Ripper not found at {JOHN_EXE}")
else:
    print(f"[+] John the Ripper found at {JOHN_EXE}")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
SESSIONS_FILE = Path("sessions.json")
WORDLIST_DIR = JOHN_PATH / "password.lst"

datasets: Dict[str, dict] = {}
sessions: Dict[str, dict] = {}
detected_formats: Dict[str, str] = {}
active_processes: Dict[str, subprocess.Popen] = {}
stop_flags: Dict[str, bool] = {}

class AuditOptions(BaseModel):
    verbose: bool = False
    estimate_only: bool = False

class AuditRequest(BaseModel):
    dataset: str
    mode: str
    options: Optional[AuditOptions] = None

class StopAuditRequest(BaseModel):
    session_id: str

class DatasetResponse(BaseModel):
    id: str
    name: str
    size: int
    uploaded_at: str
    status: str

class SessionResponse(BaseModel):
    session_id: str
    dataset_name: str
    mode: str
    started_at: str
    duration: Optional[float]
    risk_level: str
    cracked_percent: float
    total_hashes: int
    cracked_count: int
    notes: str

def load_sessions():
    global sessions
    if SESSIONS_FILE.exists():
        try:
            with open(SESSIONS_FILE, 'r') as f:
                sessions = json.load(f)
        except:
            sessions = {}

def save_sessions():
    with open(SESSIONS_FILE, 'w') as f:
        json.dump(sessions, f, indent=2)

def detect_hash_format(hash_file: str) -> Optional[str]:
    try:
        result = subprocess.run(
            [str(JOHN_EXE), "--list=format-details"],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=str(JOHN_PATH)
        )
        
        with open(hash_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if ':' in line:
                        parts = line.split(':')
                        if len(parts) >= 2:
                            hash_value = parts[1].strip()
                            hash_len = len(hash_value)
                            
                            if hash_len == 32 and all(c in '0123456789abcdefABCDEF' for c in hash_value):
                                return "raw-md5"
                            elif hash_len == 40 and all(c in '0123456789abcdefABCDEF' for c in hash_value):
                                return "raw-sha1"
                            elif hash_len == 64 and all(c in '0123456789abcdefABCDEF' for c in hash_value):
                                return "raw-sha256"
                            elif hash_len == 128 and all(c in '0123456789abcdefABCDEF' for c in hash_value):
                                return "raw-sha512"
                            elif hash_value.startswith('$2a$') or hash_value.startswith('$2b$') or hash_value.startswith('$2y$'):
                                return "bcrypt"
                            elif hash_value.startswith('$1$'):
                                return "md5crypt"
                            elif hash_value.startswith('$6$'):
                                return "sha512crypt"
                            elif hash_value.startswith('$5$'):
                                return "sha256crypt"
                    break
        
        return None
    except Exception as e:
        print(f"Error detecting hash format: {e}")
        return None

def calculate_risk_score(cracked: int, total: int) -> tuple:
    if total == 0:
        return ("low", 0)
    
    percent = (cracked / total) * 100
    
    if percent >= 50:
        return ("high", percent)
    elif percent >= 20:
        return ("medium", percent)
    else:
        return ("low", percent)

def get_mode_args(mode: str, hash_file: str, hash_format: Optional[str] = None) -> list:
    base_args = [str(JOHN_EXE)]
    
    if hash_format:
        base_args.append(f"--format={hash_format}")
    
    base_args.extend(["--max-run-time=30"])
    
    if mode == "dictionary":
        wordlist = JOHN_PATH / "password.lst"
        if wordlist.exists():
            base_args.extend([f"--wordlist={wordlist}"])
        else:
            for wl in [JOHN_PATH / "rockyou.txt", JOHN_PATH / "wordlists" / "password.lst"]:
                if wl.exists():
                    base_args.extend([f"--wordlist={wl}"])
                    break
    elif mode == "bruteforce":
        base_args.extend(["--incremental=Digits"])
    elif mode == "policy":
        base_args.extend(["--single"])
    
    base_args.append(hash_file)
    
    return base_args

def parse_cracked_line(line: str) -> Optional[dict]:
    patterns = [
        r'^(.+?):(.+?)\s*\((.+?)\)\s*$',
        r'^(.+?):(.+?)$',
    ]
    
    for pattern in patterns:
        match = re.match(pattern, line.strip())
        if match:
            groups = match.groups()
            if len(groups) == 3:
                return {"user": groups[0], "password": groups[1], "type": groups[2]}
            elif len(groups) == 2:
                return {"user": groups[0], "password": groups[1], "type": "unknown"}
    return None

def get_cracked_passwords(hash_file: str, hash_format: Optional[str] = None, limit_lines: int = 100) -> List[dict]:
    try:
        cmd = [str(JOHN_EXE), "--show"]
        if hash_format:
            cmd.append(f"--format={hash_format}")
        cmd.append(hash_file)
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=15,
            cwd=str(JOHN_PATH)
        )
        
        cracked = []
        lines_processed = 0
        for line in result.stdout.strip().split('\n'):
            if line and ':' in line and not line.startswith('0 password') and 'cracked' not in line.lower() and 'left' not in line.lower():
                parsed = parse_cracked_line(line)
                if parsed:
                    cracked.append(parsed)
                    lines_processed += 1
                    if lines_processed >= limit_lines:
                        break
        
        return cracked
    except subprocess.TimeoutExpired:
        return []
    except Exception as e:
        print(f"Error getting cracked passwords: {e}")
        return []

load_sessions()

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "John the Ripper GUI API",
        "version": "1.0.0",
        "warning": "For educational and authorized lab use only"
    }

@app.post("/upload_dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        MAX_FILE_SIZE = 50 * 1024 * 1024
        
        dataset_id = str(uuid.uuid4())[:8]
        
        file_path = (UPLOAD_DIR / f"{dataset_id}_{file.filename}").resolve()
        
        file_size = 0
        line_count = 0
        with open(file_path, 'wb') as f:
            while chunk := await file.read(8192):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    f.close()
                    os.remove(file_path)
                    raise HTTPException(status_code=413, detail=f"File too large (max {MAX_FILE_SIZE / (1024*1024):.0f}MB)")
                f.write(chunk)
        
        with open(file_path, 'rb') as f:
            for i, line in enumerate(f):
                if b':' in line and not line.strip().startswith(b'#'):
                    line_count += 1
                if i > 5000:
                    line_count = int(line_count * (f.seek(0, 2) / (f.tell() + 1)))
                    break
        
        datasets[dataset_id] = {
            "id": dataset_id,
            "name": file.filename,
            "path": str(file_path),
            "size": file_size,
            "hash_count": line_count,
            "uploaded_at": datetime.now().isoformat(),
            "status": "pending"
        }
        
        return {
            "success": True,
            "dataset": datasets[dataset_id]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/datasets")
async def list_datasets():
    return {"datasets": list(datasets.values())}

@app.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        os.remove(datasets[dataset_id]["path"])
    except:
        pass
    
    del datasets[dataset_id]
    return {"success": True}

@app.post("/run_audit")
async def run_audit(request: AuditRequest):
    if request.dataset not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = datasets[request.dataset]
    session_id = str(uuid.uuid4())[:8]
    
    datasets[request.dataset]["status"] = "auditing"
    
    session = {
        "session_id": session_id,
        "dataset_id": request.dataset,
        "dataset_name": dataset["name"],
        "mode": request.mode,
        "started_at": datetime.now().isoformat(),
        "status": "running",
        "logs": [],
        "cracked": [],
        "total_hashes": dataset.get("hash_count", 0),
        "cracked_count": 0,
        "risk_level": "low",
        "cracked_percent": 0,
        "duration": None,
        "notes": ""
    }
    sessions[session_id] = session
    stop_flags[session_id] = False
    
    async def generate_output():
        start_time = datetime.now()
        total_hashes = dataset.get("hash_count", 10)
        cracked_count = 0
        hash_file = dataset["path"]
        
        hash_format = detect_hash_format(hash_file)
        detected_formats[request.dataset] = hash_format
        
        yield json.dumps({
            "type": "info",
            "message": f"[*] Starting John the Ripper audit...",
            "session_id": session_id
        }) + "\n"
        
        yield json.dumps({
            "type": "info",
            "message": f"[*] John the Ripper path: {JOHN_EXE}",
        }) + "\n"
        
        if hash_format:
            yield json.dumps({
                "type": "info",
                "message": f"[*] Detected hash format: {hash_format}",
            }) + "\n"
        
        yield json.dumps({
            "type": "info",
            "message": f"[*] Mode: {request.mode}",
        }) + "\n"
        
        yield json.dumps({
            "type": "info",
            "message": f"[*] Dataset: {dataset['name']} ({total_hashes} hashes)",
        }) + "\n"
        
        cmd_args = get_mode_args(request.mode, hash_file, hash_format)
        
        yield json.dumps({
            "type": "info",
            "message": f"[*] Command: {' '.join(cmd_args)}",
        }) + "\n"
        
        try:
            process = subprocess.Popen(
                cmd_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=str(JOHN_PATH),
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            
            active_processes[session_id] = process
            
            yield json.dumps({
                "type": "info",
                "message": "[*] John the Ripper process started...",
            }) + "\n"
            
            last_check_time = datetime.now()
            max_runtime = 60
            last_cracked_count = 0
            check_interval = 3
            
            while True:
                elapsed = (datetime.now() - start_time).total_seconds()
                if elapsed > max_runtime:
                    process.kill()
                    yield json.dumps({
                        "type": "warning",
                        "message": f"[!] Audit stopped - maximum runtime ({max_runtime}s) exceeded",
                    }) + "\n"
                    break
                
                if stop_flags.get(session_id, False):
                    process.terminate()
                    yield json.dumps({
                        "type": "warning",
                        "message": "[!] Audit stopped by user",
                    }) + "\n"
                    break
                
                return_code = process.poll()
                
                try:
                    line = process.stdout.readline()
                    if line:
                        line = line.strip()
                        
                        if any(keyword in line.lower() for keyword in ['loaded', 'guessing', 'press space', 'error']):
                            msg_type = "info"
                            if "Error" in line:
                                msg_type = "error"
                            
                            yield json.dumps({
                                "type": msg_type,
                                "message": f"[JtR] {line}",
                            }) + "\n"
                    
                except Exception as e:
                    pass
                
                time_since_check = (datetime.now() - last_check_time).total_seconds()
                if time_since_check > check_interval:
                    cracked_list = get_cracked_passwords(hash_file, hash_format, limit_lines=50)
                    new_cracked = len(cracked_list)
                    
                    if new_cracked > last_cracked_count:
                        for i in range(last_cracked_count, new_cracked):
                            if i < len(cracked_list):
                                crack = cracked_list[i]
                                yield json.dumps({
                                    "type": "cracked",
                                    "message": f"[+] Cracked: {crack['user']}:{crack['password']}",
                                    "password": crack['password'],
                                    "user": crack['user'],
                                    "cracked_count": i + 1,
                                    "total": total_hashes
                                }) + "\n"
                        last_cracked_count = new_cracked
                        
                        if total_hashes > 0 and (new_cracked / total_hashes) > 0.5:
                            yield json.dumps({
                                "type": "info",
                                "message": "[*] 50% crack threshold reached - stopping audit early",
                            }) + "\n"
                            process.terminate()
                            break
                    
                    last_check_time = datetime.now()
                
                if return_code is not None:
                    remaining = process.stdout.read()
                    if remaining:
                        for line in remaining.strip().split('\n'):
                            if line.strip():
                                yield json.dumps({
                                    "type": "info",
                                    "message": f"[JtR] {line.strip()}",
                                }) + "\n"
                    break
                
                await asyncio.sleep(0.1)
            
            final_cracked = get_cracked_passwords(hash_file, hash_format)
            cracked_count = len(final_cracked)
            
            if cracked_count > 0:
                yield json.dumps({
                    "type": "info",
                    "message": f"[*] Final cracked passwords:",
                }) + "\n"
                
                for crack in final_cracked:
                    yield json.dumps({
                        "type": "cracked",
                        "message": f"[+] {crack['user']}:{crack['password']}",
                        "password": crack['password'],
                        "user": crack['user'],
                        "cracked_count": cracked_count,
                        "total": total_hashes
                    }) + "\n"
            
        except FileNotFoundError:
            yield json.dumps({
                "type": "error",
                "message": f"[!] Error: John the Ripper not found at {JOHN_EXE}",
            }) + "\n"
        except Exception as e:
            yield json.dumps({
                "type": "error",
                "message": f"[!] Error running John the Ripper: {str(e)}",
            }) + "\n"
        finally:
            if session_id in active_processes:
                del active_processes[session_id]
            if session_id in stop_flags:
                del stop_flags[session_id]
        
        duration = (datetime.now() - start_time).total_seconds()
        risk_level, cracked_percent = calculate_risk_score(cracked_count, total_hashes)
        
        if session_id in sessions:
            sessions[session_id].update({
                "status": "completed",
                "cracked_count": cracked_count,
                "cracked_percent": cracked_percent,
                "risk_level": risk_level,
                "duration": duration,
                "notes": f"Completed {request.mode} analysis. {cracked_count}/{total_hashes} passwords cracked."
            })
            save_sessions()
        
        if request.dataset in datasets:
            datasets[request.dataset]["status"] = "completed"
        
        yield json.dumps({
            "type": "info",
            "message": f"[*] Audit complete in {duration:.2f} seconds",
        }) + "\n"
        
        yield json.dumps({
            "type": "summary",
            "session_id": session_id,
            "total_hashes": total_hashes,
            "cracked_count": cracked_count,
            "cracked_percent": cracked_percent,
            "risk_level": risk_level,
            "duration": duration,
            "mode": request.mode,
            "dataset_name": dataset["name"]
        }) + "\n"
    
    return StreamingResponse(
        generate_output(),
        media_type="application/x-ndjson"
    )

@app.post("/stop_audit")
async def stop_audit(request: StopAuditRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[request.session_id]
    
    if session["status"] != "running":
        return {"success": False, "message": "Audit is not running"}
    
    stop_flags[request.session_id] = True
    
    sessions[request.session_id]["status"] = "stopped"
    sessions[request.session_id]["notes"] = "Audit cancelled by user"
    
    dataset_id = session.get("dataset_id")
    if dataset_id and dataset_id in datasets:
        datasets[dataset_id]["status"] = "stopped"
    
    if request.session_id in active_processes:
        try:
            process = active_processes[request.session_id]
            process.terminate()
            process.kill()
        except:
            pass
        del active_processes[request.session_id]
    
    save_sessions()
    
    return {"success": True, "message": "Audit stopped"}

@app.get("/sessions")
async def list_sessions():
    return {"sessions": list(sessions.values())}

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions[session_id]
    save_sessions()
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
