import subprocess
import os
import shutil

def wipe_and_push():
    repo_url = "https://github.com/OwaisSayyed2007/anthropic-hack-deployment"
    
    # 1. Delete .git folder if it exists
    if os.path.exists(".git"):
        shutil.rmtree(".git")
    
    commands = [
        ["git", "init"],
        ["git", "remote", "add", "origin", repo_url],
        ["git", "add", "."],
        ["git", "commit", "-m", "feat: initial clean migration push"],
        ["git", "branch", "-M", "main"],
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
    wipe_and_push()
