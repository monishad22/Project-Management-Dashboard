document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const loginError =
            document.getElementById(
                "loginError"
            );

        const loginButton =
            document.getElementById(
                "loginButton"
            );


        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const username =
                    document
                        .getElementById(
                            "username"
                        )
                        .value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "password"
                        )
                        .value;


                loginError.classList.add(
                    "d-none"
                );


                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Signing in...";


                try {

                    const response =
                        await fetch(
                            "/api/auth/login",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        username,
                                        password
                                    })
                            }
                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Login failed."
                        );

                    }


                    localStorage.setItem(
                        "stockpilot_token",
                        result.token
                    );


                    localStorage.setItem(
                        "stockpilot_user",
                        JSON.stringify(
                            result.user
                        )
                    );


                    window.location.href =
                        "/dashboard";


                } catch (error) {

                    loginError.textContent =
                        error.message;


                    loginError.classList.remove(
                        "d-none"
                    );


                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "Sign In";

                }

            }
        );

    }
);