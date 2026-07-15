import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "print(" not in content:
        return False
        
    # Ignore the init_db_script and test_gemini.py since they are CLI scripts
    if "init_db_script" in filepath or "test_gemini" in filepath:
        return False
        
    lines = content.split('\n')
    new_lines = []
    
    has_logger = any("import logging" in line for line in lines)
    
    # insert logger imports after first imports
    if not has_logger:
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith("import ") or line.startswith("from "):
                insert_idx = i
        
        lines.insert(insert_idx + 1, "import logging")
        lines.insert(insert_idx + 2, "logger = logging.getLogger(__name__)")
        lines.insert(insert_idx + 3, "logging.basicConfig(level=logging.INFO)")
        
    for line in lines:
        if "print(" in line:
            # Replace print with logger.info or logger.error
            if "Error" in line or "error" in line or "failed" in line or "Failed" in line:
                line = re.sub(r'print\((.*?)\)', r'logger.error(\1)', line)
            else:
                line = re.sub(r'print\((.*?)\)', r'logger.info(\1)', line)
        new_lines.append(line)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
        
    return True

backend_dir = r"C:\Users\Arpit Gupta\OneDrive\Desktop\Prompt_War\PromptWar_Challenge-04-On-going-Smart-Stadiums-Tournament-Operations\backend"
count = 0
for root, _, files in os.walk(backend_dir):
    for f in files:
        if f.endswith(".py"):
            if fix_file(os.path.join(root, f)):
                count += 1
logger.info(f"Fixed {count} files.")
