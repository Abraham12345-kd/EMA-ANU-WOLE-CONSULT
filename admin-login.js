// =================================
// SUPABASE CONNECTION
// =================================

const SUPABASE_URL =
    "https://wuhqqdlrydmbtrrzpkob.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_VLL0ZXbSAkmUv7PLQX6oDA_nTVaLAGj";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =================================
// ADMIN LOGIN
// =================================

const loginForm =
    document.querySelector("#login-form");

const loginMessage =
    document.querySelector("#login-message");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.querySelector("#email").value.trim();

    const password =
        document.querySelector("#password").value;


    loginMessage.textContent =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    if (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        loginMessage.textContent =
            "Login failed: " + error.message;

        return;
    }


    console.log(
        "Admin logged in:",
        data.user
    );


    window.location.href =
        "admin.html";

});

const passwordInput =
    document.querySelector("#password");

const passwordToggle =
    document.querySelector("#password-toggle");

passwordToggle.addEventListener("click", () => {

    const isHidden =
        passwordInput.type === "password";

    passwordInput.type =
        isHidden ? "text" : "password";

    passwordToggle.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
    );

    passwordToggle.innerHTML = isHidden
        ? `
            <svg
                class="eye-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M3 3l18 18"></path>
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"></path>
                <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a17.5 17.5 0 0 1-3.1 4.4"></path>
                <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.1-.8"></path>
            </svg>
        `
        : `
            <svg
                class="eye-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
});