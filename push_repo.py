import subprocess
import os

def run_git():
    repo_url = "https://github.com/OwaisSayyed2007/anthropic-hack-deployment"
    
    commands = [
        ["git", "remote", "remove", "origin"], # Clean up if exists
        ["git", "remote", "add", "origin", repo_url],
        ["git", "add", "."],
        ["git", "commit", "-m", "feat: complete migration to Supermemory and Simple Auth + Deployment Prep"],
        ["git", "branch", "-M", "main"],
        ["git", "push", "-u", "origin", "main", "--force"] # Using force since it's a new repo and might have a README
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
