import subprocess
import os
import time
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_port(port):
    try:
        pid = subprocess.check_output(["lsof", "-ti", f":{port}"]).decode().strip()
        if pid:
            print(f"Killing process {pid} on port {port}")
            subprocess.run(["kill", "-9", pid])
    except:
        pass

def run():
    # Cleanup
    print("Cleaning up ports 8002 and 8888...")
    kill_port(8002)
    kill_port(8888)
    
    time.sleep(1)

    print("Starting backend on 8002...")
    backend = subprocess.Popen(
        ["./venv311/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"],
        cwd="backend",
        stdout=open("backend_stdout.log", "w"),
        stderr=open("backend_stderr.log", "w")
    )
    
    print("Starting frontend on 8888...")
    # Set PORT env var for Next.js
    env = os.environ.copy()
    env["PORT"] = "8888"
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="frontend",
        env=env,
        stdout=open("frontend_stdout.log", "w"),
        stderr=open("frontend_stderr.log", "w")
    )
    
    print(f"Backend PID: {backend.pid}")
    print(f"Frontend PID: {frontend.pid}")
    
    # Wait and check
    time.sleep(5)
    if is_port_in_use(8002):
        print("✅ Backend is listening on 8002")
    else:
        print("❌ Backend FAILED to start. Check backend_stderr.log")
        
    if is_port_in_use(8888):
        print("✅ Frontend is listening on 8888")
    else:
        print("❌ Frontend FAILED to start. Check frontend_stderr.log")

if __name__ == "__main__":
    run()
