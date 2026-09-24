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