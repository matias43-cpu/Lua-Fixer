import { Router } from "express";
import { GenerateCodeBody } from "@workspace/api-zod";

const router = Router();

function has(prompt: string, ...words: string[]): boolean {
  return words.some((w) => prompt.includes(w));
}

function generateLua(prompt: string): string {
  if (has(prompt, "ban", "kick", "roblox", "player")) {
    return `-- Lua: Roblox ban/kick system
local Players = game:GetService("Players")
local BannedList = { "BadPlayer123" }

Players.PlayerAdded:Connect(function(player)
    for _, banned in ipairs(BannedList) do
        if player.Name == banned then
            player:Kick("You have been banned from this server.")
        end
    end
end)`;
  }
  if (has(prompt, "timer", "countdown", "time")) {
    return `-- Lua: Countdown timer
local timeLeft = 60

while timeLeft > 0 do
    print("Time remaining: " .. timeLeft .. "s")
    timeLeft = timeLeft - 1
    task.wait(1)
end

print("Time's up!")`;
  }
  if (has(prompt, "inventory", "item", "shop")) {
    return `-- Lua: Simple inventory system
local inventory = {}

local function addItem(item)
    table.insert(inventory, item)
    print("Added: " .. item)
end

local function showInventory()
    print("=== Inventory ===")
    for i, item in ipairs(inventory) do
        print(i .. ". " .. item)
    end
end

addItem("Sword")
addItem("Shield")
addItem("Potion")
showInventory()`;
  }
  if (has(prompt, "loop", "for", "repeat")) {
    return `-- Lua: Loop example
for i = 1, 10 do
    print("Iteration: " .. i)
end`;
  }
  if (has(prompt, "hello", "salut", "print", "message", "mesaj")) {
    return `-- Lua: Hello World
function greet(name)
    print("Hello, " .. name .. "!")
end

greet("World")`;
  }
  // default
  return `-- Lua: Script for "${prompt}"
local function main()
    print("Running: ${prompt}")
    -- Add your logic here
end

main()`;
}

function generatePython(prompt: string): string {
  if (has(prompt, "list", "lista", "numbers", "numere", "array")) {
    return `# Python: List operations
numbers = [1, 2, 3, 4, 5, 10, 20]

total = sum(numbers)
average = total / len(numbers)
maximum = max(numbers)

print(f"Total:   {total}")
print(f"Average: {average:.2f}")
print(f"Max:     {maximum}")`;
  }
  if (has(prompt, "file", "fisier", "read", "write", "citire")) {
    return `# Python: File read/write
filename = "output.txt"

# Write to file
with open(filename, "w") as f:
    f.write("Hello from Python!\\n")
    f.write("Generated automatically.\\n")

# Read it back
with open(filename, "r") as f:
    content = f.read()

print(content)`;
  }
  if (has(prompt, "api", "request", "http", "web", "url")) {
    return `# Python: HTTP GET request
import urllib.request
import json

url = "https://api.example.com/data"

try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read())
        print("Response:", data)
except Exception as e:
    print(f"Error: {e}")`;
  }
  if (has(prompt, "class", "clasa", "object", "obiect")) {
    return `# Python: Class example
class Animal:
    def __init__(self, name: str, sound: str):
        self.name = name
        self.sound = sound

    def speak(self) -> str:
        return f"{self.name} says {self.sound}!"

dog = Animal("Dog", "Woof")
cat = Animal("Cat", "Meow")

print(dog.speak())
print(cat.speak())`;
  }
  if (has(prompt, "hello", "salut", "print", "message", "mesaj")) {
    return `# Python: Hello World
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))`;
  }
  return `# Python: Script for "${prompt}"
def main():
    print("Running: ${prompt}")
    # Add your logic here

if __name__ == "__main__":
    main()`;
}

function generateJavaScript(prompt: string): string {
  if (has(prompt, "fetch", "api", "request", "http", "url")) {
    return `// JavaScript: Fetch API example
async function getData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        const data = await response.json();
        console.log("Data:", data);
        return data;
    } catch (error) {
        console.error("Error:", error.message);
    }
}

getData("https://jsonplaceholder.typicode.com/todos/1");`;
  }
  if (has(prompt, "button", "click", "dom", "html", "event")) {
    return `// JavaScript: DOM event handling
document.addEventListener("DOMContentLoaded", () => {
    const button = document.createElement("button");
    button.textContent = "Click me!";
    button.style.padding = "10px 20px";

    button.addEventListener("click", () => {
        console.log("Button clicked!");
        alert("Hello from JavaScript!");
    });

    document.body.appendChild(button);
});`;
  }
  if (has(prompt, "timer", "interval", "timeout", "delay")) {
    return `// JavaScript: Timer / interval
let count = 0;
const MAX = 5;

const interval = setInterval(() => {
    count++;
    console.log(\`Tick \${count}/\${MAX}\`);
    if (count >= MAX) {
        clearInterval(interval);
        console.log("Done!");
    }
}, 1000);`;
  }
  if (has(prompt, "array", "list", "filter", "map", "sort")) {
    return `// JavaScript: Array operations
const numbers = [5, 3, 8, 1, 9, 2, 7, 4, 6];

const sorted    = [...numbers].sort((a, b) => a - b);
const evens     = numbers.filter((n) => n % 2 === 0);
const doubled   = numbers.map((n) => n * 2);

console.log("Original:", numbers);
console.log("Sorted:  ", sorted);
console.log("Evens:   ", evens);
console.log("Doubled: ", doubled);`;
  }
  return `// JavaScript: Script for "${prompt}"
function main() {
    console.log("Running: ${prompt}");
    // Add your logic here
}

main();`;
}

function generateCpp(prompt: string): string {
  if (has(prompt, "sort", "array", "vector", "list")) {
    return `// C++: Sorting a vector
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 3, 8, 1, 9, 2, 7, 4, 6};

    std::sort(numbers.begin(), numbers.end());

    std::cout << "Sorted: ";
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;

    return 0;
}`;
  }
  if (has(prompt, "class", "object", "obiect")) {
    return `// C++: Class example
#include <iostream>
#include <string>

class Animal {
private:
    std::string name;
    std::string sound;

public:
    Animal(const std::string& n, const std::string& s)
        : name(n), sound(s) {}

    void speak() const {
        std::cout << name << " says " << sound << "!" << std::endl;
    }
};

int main() {
    Animal dog("Dog", "Woof");
    Animal cat("Cat", "Meow");

    dog.speak();
    cat.speak();

    return 0;
}`;
  }
  if (has(prompt, "file", "fisier", "read", "write")) {
    return `// C++: File I/O
#include <iostream>
#include <fstream>
#include <string>

int main() {
    // Write
    std::ofstream outFile("output.txt");
    outFile << "Hello from C++!" << std::endl;
    outFile.close();

    // Read
    std::ifstream inFile("output.txt");
    std::string line;
    while (std::getline(inFile, line)) {
        std::cout << line << std::endl;
    }
    inFile.close();

    return 0;
}`;
  }
  if (has(prompt, "loop", "for", "repeat", "bucla")) {
    return `// C++: Loop example
#include <iostream>

int main() {
    for (int i = 1; i <= 10; i++) {
        std::cout << "Iteration: " << i << std::endl;
    }
    return 0;
}`;
  }
  return `// C++: Program for "${prompt}"
#include <iostream>
#include <string>

int main() {
    std::string task = "${prompt}";
    std::cout << "Running: " << task << std::endl;
    // Add your logic here
    return 0;
}`;
}

router.post("/code/generate", (req, res) => {
  const parseResult = GenerateCodeBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body", details: parseResult.error.flatten() });
    return;
  }

  const { prompt, language } = parseResult.data;
  const p = prompt.toLowerCase().trim();

  const generatedCode =
    language === "python"
      ? generatePython(p)
      : language === "javascript"
        ? generateJavaScript(p)
        : language === "cpp"
          ? generateCpp(p)
          : generateLua(p);

  res.json({ language, prompt, generatedCode });
});

export default router;
