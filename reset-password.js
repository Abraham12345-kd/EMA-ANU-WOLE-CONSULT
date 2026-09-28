const SUPABASE_URL =
    "https://wuhqqdlrydmbtrrzpkob.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_VLL0ZXbSAkmUv7PLQX6oDA_nTVaLAGj";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

const form =
    document.querySelector("#reset-password-form");

const message =
    document.querySelector("#reset-message");


supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (event === "PASSWORD_RECOVERY" && session) {

            console.log("Password recovery session active.");

        }

    }
);


form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const newPassword =
        document.querySelector("#new-password").value;

    const confirmPassword =
        document.querySelector("#confirm-password").value;


    if (newPassword !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        return;
    }


    if (newPassword.length < 8) {

        message.textContent =
            "Password must be at least 8 characters.";

        return;
    }


    message.textContent =
        "Updating password...";


    const { error } =
        await supabaseClient.auth.updateUser({
            password: newPassword
        });


    if (error) {

        console.error(
            "UPDATE PASSWORD ERROR:",
            error
        );

        message.textContent =
            "Password update failed: " + error.message;

        return;
    }


    message.textContent =
        "Password updated successfully. Redirecting to login...";


    await supabaseClient.auth.signOut();


    setTimeout(() => {

        window.location.href =
            "admin-login.html";

    }, 1500);

});

function setupPasswordToggle(inputId, buttonId) {

    const input =
        document.querySelector(`#${inputId}`);

    const button =
        document.querySelector(`#${buttonId}`);

    button.addEventListener("click", () => {

        const isHidden =
            input.type === "password";

        input.type =
            isHidden ? "text" : "password";

        button.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );

        button.innerHTML = isHidden
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
}

setupPasswordToggle(
    "new-password",
    "new-password-toggle"
);

setupPasswordToggle(
    "confirm-password",
    "confirm-password-toggle"
);