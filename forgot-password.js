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
    document.querySelector("#forgot-password-form");

const message =
    document.querySelector("#reset-message");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.querySelector("#email").value.trim();

    message.textContent =
        "Sending reset link...";

    const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo:
                    `${window.location.origin}/reset-password.html`
            }
        );

    if (error) {

        console.error("PASSWORD RESET ERROR:", error);

        message.textContent =
            "Something went wrong: " + error.message;

        return;
    }

    message.textContent =
        "If this email is registered, a password reset link has been sent. Check your inbox.";
});