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