from flask import Flask, render_template_string, request

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Multi-Language Code Fixer v1.2</title>
    <style>
        body { background-color: #0d1117; color: #c9d1d9; font-family: sans-serif; text-align: center; padding: 40px; }
        h1 { color: #58a6ff; margin-bottom: 5px; }
        .subtitle { color: #8b949e; margin-bottom: 25px; }
        select { background: #161b22; color: #58a6ff; border: 1px solid #30363d; padding: 10px; font-size: 16px; border-radius: 5px; margin-bottom: 15px; cursor: pointer; font-weight: bold; }
        textarea { width: 80%; height: 160px; background: #161b22; color: #00ff00; border: 1px solid #30363d; padding: 12px; font-family: monospace; border-radius: 5px; font-size: 14px; }
        button { background: #238636; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 5px; cursor: pointer; margin-top: 15px; font-weight: bold; }
        button:hover { background: #2ea043; }
        .box { background: #161b22; border: 1px solid #30363d; width: 80%; margin: 20px auto; padding: 15px; text-align: left; border-radius: 5px; font-family: monospace; }
        .error { color: #ff7b72; font-weight: bold; }
        .success { color: #7ee787; }
    </style>
</head>
<body>
    <h1>Code Validator & Auto-Fixer v1.2</h1>
    <p class="subtitle">Sistem inteligent capabil să scaneze 4 tipuri diferite de limbaje</p>
    
    <form method="POST">
        <label for="language" style="margin-right: 10px; font-weight: bold;">Alege limbajul scriptului:</label>
        <select name="language" id="language">
            <option value="lua">🌙 Lua Scripting (Jocuri)</option>
            <option value="python">🐍 Python Code (Sisteme/AI)</option>
            <option value="javascript">🌐 JavaScript (Site-uri/Web)</option>
            <option value="cpp">💻 C++ (Algoritmi/Aplicații)</option>
        </select>
        <br>
        
        <textarea name="code_input" placeholder="Lipește codul greșit aici...">{{ original_code }}</textarea><br>
        <button type="submit">Scanează și Corectează</button>
    </form>

    {% if error_log %}
        <div class="box">
            <h3>[Analiză Server v1.2] Limbaj: <span style="color: #58a6ff; text-transform: uppercase;">{{ selected_lang }}</span></h3>
            <p class="error">{{ error_log }}</p>
        </div>
        <div class="box">
            <h3>Codul Corectat Automat:</h3>
            <pre class="success">{{ fixed_code }}</pre>
        </div>
    {% elif original_code %}
        <div class="box">
            <p class="success">✓ Serverul a analizat codul și totul este perfect scris!</p>
        </div>
    {% endif %}
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def home():
    original_code = ""
    error_log = ""
    fixed_code = ""
    selected_lang = "lua"
    
    if request.method == "POST":
        original_code = request.form.get("code_input", "")
        selected_lang = request.form.get("language", "lua")
        fixed_code = original_code
        
        if not original_code.strip():
            return render_template_string(HTML_TEMPLATE, original_code=original_code, error_log="Te rog adaugă niște cod.", fixed_code="", selected_lang=selected_lang)

        if selected_lang == "lua":
            if "function" in original_code and "end" not in original_code:
                error_log = "Eroare în Lua: Lipsește 'end' la finalul funcției!"
                fixed_code = original_code + "\nend"
            elif "if" in original_code and "then" not in original_code:
                error_log = "Eroare în Lua: Ai uitat să pui 'then' după condiție!"
                fixed_code = original_code + " then"

        elif selected_lang == "python":
            if "def " in original_code and ":" not in original_code:
                error_log = "Eroare în Python: Lipsește ':' la finalul liniei cu def!"
                linii = original_code.split("\n")
                for i, linie in enumerate(linii):
                    if "def " in linie and ":" not in linie:
                        linii[i] = linie + ":"
                fixed_code = "\n".join(linii)

        elif selected_lang == "javascript":
            if "function" in original_code and "{" not in original_code:
                error_log = "Eroare în JavaScript: Funcțiile au nevoie de acolade '{ }'!"
                fixed_code = original_code + " {\n\n}"

        elif selected_lang == "cpp":
            if "cout" in original_code and ";" not in original_code:
                error_log = "Eroare în C++: Ai uitat să pui ';' la final!"
                fixed_code = original_code + ";"

    return render_template_string(HTML_TEMPLATE, original_code=original_code, error_log=error_log, fixed_code=fixed_code, selected_lang=selected_lang)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
