import subprocess
import os

def run_git():
    repo_url = "https://github.com/OwaisSayyed2007/anthropic-hack-deployment"
    
    commands = [
        ["git", "rm", "-r", "--cached", "backend/venv311/"], # Remove venv from git tracking
        ["git", "add", "."],
        ["git", "commit", "-m", "fix: ignore venv and add missing lib files"],
        ["git", "push", "-u", "origin", "main", "--force"]
    ]
    
    for cmd in commands:
        try:
            print(f"Running: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            print(result.stdout)
            if result.stderr:
                print(f"Error: {result.stderr}")
        except Exception as e:
            print(f"Failed to run {cmd}: {e}")

if __name__ == "__main__":
    run_git()
