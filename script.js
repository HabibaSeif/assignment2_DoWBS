/* ==========================================================
   Habiba Seif – Interactive CV (Assignment 2)
   Features implemented:
     1. Contact form with validation
     2. Show / hide sections
     3. Dark mode / light mode toggle
     4. Dynamic skills list
     5. Welcome message on page load
     6. Interactive project details
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
    initWelcomeMessage();
    initThemeToggle();
    initSectionToggles();
    initProjectDetails();
    initSkillForm();
    initContactForm();
});

/* ----------------------------------------------------------
   Small helper: safe wrapper around localStorage.
   (Some browsers block storage, so we never let it crash.)
   ---------------------------------------------------------- */
function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

/* ==========================================================
   FEATURE 5 – Welcome message
   Shows a banner when the page loads, then hides it
   automatically after 5 seconds (or when closed).
   ========================================================== */
function initWelcomeMessage() {
    const banner = document.getElementById("welcome-banner");
    const text = document.getElementById("welcome-text");
    const closeBtn = document.getElementById("welcome-close");
    if (!banner) return;

    // Pick a greeting based on the visitor's local time
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    text.textContent = greeting + "! Welcome to my portfolio page!";
    banner.hidden = false;

    const hideBanner = function () { banner.hidden = true; };
    closeBtn.addEventListener("click", hideBanner);
    setTimeout(hideBanner, 5000);
}

/* ==========================================================
   FEATURE 3 – Dark / light mode toggle
   Sets data-theme="dark" on <html>; the CSS variables do the rest.
   The choice is remembered between visits.
   ========================================================== */
function initThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;
    const root = document.documentElement;

    // Update the button text/icon to match the current theme
    function updateButton(theme) {
        const isDark = theme === "dark";
        button.querySelector(".theme-icon").textContent = isDark ? "☀️" : "🌙";
        button.querySelector(".theme-label").textContent = isDark ? "Light" : "Dark";
        button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    // Apply saved theme (default: light)
    let theme = storageGet("theme") === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    updateButton(theme);

    button.addEventListener("click", function () {
        theme = theme === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", theme);
        storageSet("theme", theme);
        updateButton(theme);
    });
}

/* ==========================================================
   FEATURE 2 – Show / hide sections
   Each .toggle-btn controls the .collapsible block whose id
   is stored in its data-target attribute.
   ========================================================== */
function initSectionToggles() {
    const buttons = document.querySelectorAll(".toggle-btn");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const target = document.getElementById(button.dataset.target);
            if (!target) return;

            const nowHidden = target.classList.toggle("is-hidden");
            const label = button.dataset.label;

            button.textContent = (nowHidden ? "Show " : "Hide ") + label;
            button.setAttribute("aria-expanded", String(!nowHidden));
        });
    });
}

/* ==========================================================
   FEATURE 6 – Interactive project section
   "Show Details" reveals the extra project information
   (highlights, tools, GitHub link) without reloading the page.
   ========================================================== */
function initProjectDetails() {
    const buttons = document.querySelectorAll(".details-btn");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const details = document.getElementById(button.getAttribute("aria-controls"));
            if (!details) return;

            const willShow = details.hidden; // currently hidden -> will be shown
            details.hidden = !willShow;
            button.textContent = willShow ? "Hide Details" : "Show Details";
            button.setAttribute("aria-expanded", String(willShow));
        });
    });
}

/* ==========================================================
   FEATURE 4 – Dynamic skills list
   The user types a skill, picks a category and clicks Add.
   The skill appears instantly and can be removed with ×.
   ========================================================== */
function initSkillForm() {
    const form = document.getElementById("skill-form");
    const input = document.getElementById("skill-input");
    const category = document.getElementById("skill-category");
    const message = document.getElementById("skill-message");
    if (!form) return;

    // Show a short feedback message under the form
    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message " + type;
    }

    // True if the skill already exists in either list (case-insensitive)
    function skillExists(name) {
        const all = document.querySelectorAll(".skill-list span");
        return Array.from(all).some(function (span) {
            // the user-added chips contain a × button, so read only the first text node
            const label = span.firstChild ? span.firstChild.textContent : "";
            return label.trim().toLowerCase() === name.toLowerCase();
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // stop the page from reloading

        const name = input.value.trim();

        if (name === "") {
            showMessage("Please enter a skill first.", "error");
            return;
        }
        if (skillExists(name)) {
            showMessage('"' + name + '" is already in the list.', "error");
            return;
        }

        // Build the new skill chip: <span class="user-skill">Python <button>×</button></span>
        const chip = document.createElement("span");
        chip.className = "user-skill";
        chip.appendChild(document.createTextNode(name)); // textNode => safe from HTML injection

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-skill";
        removeBtn.setAttribute("aria-label", "Remove " + name);
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", function () {
            chip.remove();
            showMessage('Removed "' + name + '".', "success");
        });
        chip.appendChild(removeBtn);

        document.getElementById(category.value + "-list").appendChild(chip);

        showMessage('"' + name + '" added to your skills!', "success");
        input.value = "";
        input.focus();
    });
}

/* ==========================================================
   FEATURE 1 – Contact form with validation
   Checks: required fields (name, email, message) and a
   proper email format. Errors/success are shown dynamically.
   ========================================================== */
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const fields = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        message: document.getElementById("message")
    };
    const status = document.getElementById("form-status");

    // Simple email pattern: text@text.text (no spaces)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Return an error string for one field, or "" if it is valid
    function validateField(key) {
        const value = fields[key].value.trim();

        if (value === "") {
            return "This field is required.";
        }
        if (key === "email" && !emailPattern.test(value)) {
            return "Please enter a valid email address (e.g. name@example.com).";
        }
        if (key === "message" && value.length < 10) {
            return "Message must be at least 10 characters long.";
        }
        return "";
    }

    // Show or clear the error under a field
    function showError(key, errorText) {
        const errorSpan = document.getElementById(key + "-error");
        errorSpan.textContent = errorText;
        fields[key].parentElement.classList.toggle("invalid", errorText !== "");
        fields[key].setAttribute("aria-invalid", errorText !== "" ? "true" : "false");
    }

    // Validate a field again as soon as the user leaves it / edits it
    Object.keys(fields).forEach(function (key) {
        fields[key].addEventListener("blur", function () {
            showError(key, validateField(key));
        });
        fields[key].addEventListener("input", function () {
            // only re-check while an error is showing, so we don't nag early
            if (fields[key].parentElement.classList.contains("invalid")) {
                showError(key, validateField(key));
            }
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let firstInvalid = null;
        Object.keys(fields).forEach(function (key) {
            const error = validateField(key);
            showError(key, error);
            if (error && !firstInvalid) firstInvalid = fields[key];
        });

        if (firstInvalid) {
            status.textContent = "Please fix the highlighted fields and try again.";
            status.className = "form-message error";
            firstInvalid.focus();
            return;
        }

        // All fields valid. (There is no backend on a static site, so the
        // message is not actually sent; we just confirm and reset the form.)
        const firstName = fields.name.value.trim().split(" ")[0];
        status.textContent = "Thank you, " + firstName + "! Your message was sent successfully.";
        status.className = "form-message success";
        form.reset();
        Object.keys(fields).forEach(function (key) { showError(key, ""); });
    });
}
