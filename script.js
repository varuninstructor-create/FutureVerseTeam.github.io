document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       FORM ELEMENTS
       ========================================================= */


       const GOOGLE_SHEET_URL =
    "https://script.google.com/macros/s/AKfycbxw_ztxIXMEAodFVzReEYTuIIQUMWsazGN2_C3MUg3V8iiDyNTrc6oRFayVM2ALb5Ht/exec";

    const form = document.getElementById("teamRegistrationForm");

    if (!form) return;

    const fullName = document.getElementById("fullName");
    const age = document.getElementById("age");
    const gender = document.getElementById("gender");
    const city = document.getElementById("city");

    const email = document.getElementById("email");
    const otp = document.getElementById("otp");
    const otpSection = document.getElementById("otpSection");

    const sendOtpButton = document.getElementById("sendOtpButton");
    const verifyOtpButton = document.getElementById("verifyOtpButton");
    const otpMessage = document.getElementById("otpMessage");

    const reason = document.getElementById("reason");
    const time = document.getElementById("time");
    const confirmation = document.getElementById("confirmation");

    const submitRegistration =
        document.getElementById("submitRegistration");


    /* =========================================================
       INTEREST / SKILLS CHECKBOXES
       ========================================================= */

    const skillCheckboxes =
        form.querySelectorAll(
            'input[type="checkbox"][name="skills"], ' +
            'input[type="checkbox"][name="interests"], ' +
            '.skills-grid input[type="checkbox"], ' +
            '.skills-options input[type="checkbox"], ' +
            '.interest-options input[type="checkbox"], ' +
            '.interest-grid input[type="checkbox"]'
        );


    /* =========================================================
       OTP STATE
       ========================================================= */

    let generatedOTP = null;
    let emailVerified = false;
    let otpExpiryTime = 0;


    /* =========================================================
       PREMIUM ALERT
       ========================================================= */

    function showPremiumAlert(
        title,
        message,
        type = "error"
    ) {

        const oldAlert =
            document.querySelector(".fv-alert");

        if (oldAlert) {
            oldAlert.remove();
        }

        const alert = document.createElement("div");

        alert.className =
            `fv-alert fv-alert-${type}`;

        const icon =
            type === "success"
                ? "✓"
                : "!";

        alert.innerHTML = `
            <div class="fv-alert-box">

                <div class="fv-alert-icon">
                    ${icon}
                </div>

                <div class="fv-alert-content">

                    <h3>${title}</h3>

                    <p>${message}</p>

                </div>

                <button
                    type="button"
                    class="fv-alert-close"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>
        `;

        document.body.appendChild(alert);

        const closeButton =
            alert.querySelector(".fv-alert-close");

        closeButton.addEventListener(
            "click",
            () => {

                alert.classList.add("hide");

                setTimeout(() => {
                    alert.remove();
                }, 250);

            }
        );

        setTimeout(() => {

            if (!document.body.contains(alert)) {
                return;
            }

            alert.classList.add("hide");

            setTimeout(() => {

                if (document.body.contains(alert)) {
                    alert.remove();
                }

            }, 250);

        }, 4500);
    }


    /* =========================================================
       FIELD ERROR
       ========================================================= */

    function removeFieldError(field) {

        if (!field) return;

        field.classList.remove("field-error");

        const oldMessage =
            field.parentElement?.querySelector(
                ".field-error-message"
            );

        if (oldMessage) {
            oldMessage.remove();
        }
    }


    function showFieldError(
        field,
        message
    ) {

        if (!field) return;

        removeFieldError(field);

        field.classList.add("field-error");

        const errorMessage =
            document.createElement("div");

        errorMessage.className =
            "field-error-message";

        errorMessage.textContent =
            message;

        field.parentElement.appendChild(
            errorMessage
        );
    }


    function validateField(
        field,
        condition,
        message
    ) {

        if (!field) return true;

        if (!condition) {

            showFieldError(
                field,
                message
            );

            return false;
        }

        removeFieldError(field);

        return true;
    }


    /* =========================================================
       NAME VALIDATION
       ========================================================= */

    function isValidName(name) {

        name = name.trim();

        if (!name) {
            return false;
        }

        if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)) {
            return false;
        }

        const words = name.split(" ");

        for (const word of words) {

            if (!/^[A-Z][a-z]*$/.test(word)) {
                return false;
            }
        }

        if (/(.)\1\1/i.test(name)) {
            return false;
        }

        return true;
    }


    /* =========================================================
       AGE VALIDATION
       ========================================================= */

    function isValidAge(ageValue) {

        ageValue = ageValue.trim();

        if (!ageValue) {
            return false;
        }

        if (!/^\d+$/.test(ageValue)) {
            return false;
        }

        if (ageValue.length > 3) {
            return false;
        }

        const numericAge =
            Number(ageValue);

        if (
            numericAge < 18 ||
            numericAge > 100
        ) {
            return false;
        }

        return true;
    }


    /* =========================================================
       CITY / LOCATION
       MINIMUM 5
       MAXIMUM 50
       ========================================================= */

    function isValidCity(cityValue) {

        cityValue = cityValue.trim();

        if (!cityValue) {
            return false;
        }

        if (cityValue.length < 5) {
            return false;
        }

        if (cityValue.length > 50) {
            return false;
        }

        if (!/^[A-Za-z0-9\s,.'\-\/]+$/.test(cityValue)) {
            return false;
        }

        return true;
    }


    /* =========================================================
       ABOUT YOU
       MINIMUM 5
       MAXIMUM 100
       ========================================================= */

    function isValidReason(reasonValue) {

        reasonValue = reasonValue.trim();

        if (!reasonValue) {
            return false;
        }

        if (reasonValue.length < 5) {
            return false;
        }

        if (reasonValue.length > 100) {
            return false;
        }

        return true;
    }


    /* =========================================================
       FULL NAME — AUTO CAPITALIZE
       ========================================================= */

    if (fullName) {

        fullName.addEventListener(
            "input",
            () => {

                let value =
                    fullName.value;

                value =
                    value.replace(
                        /(^|\s)([a-z])/g,
                        (
                            match,
                            space,
                            letter
                        ) => {

                            return (
                                space +
                                letter.toUpperCase()
                            );

                        }
                    );

                fullName.value = value;

                removeFieldError(fullName);
            }
        );
    }


    /* =========================================================
       AGE — DIGITS ONLY / MAX 3 DIGITS
       ========================================================= */

    if (age) {

        age.addEventListener(
            "input",
            () => {

                age.value =
                    age.value
                        .replace(/\D/g, "")
                        .slice(0, 3);

                removeFieldError(age);
            }
        );
    }


    /* =========================================================
       CITY — MAX 50 CHARACTERS
       ========================================================= */

    if (city) {

        city.addEventListener(
            "input",
            () => {

                city.value =
                    city.value.slice(0, 50);

                removeFieldError(city);
            }
        );
    }


    /* =========================================================
       ABOUT YOU — MAX 100 CHARACTERS
       ========================================================= */

    if (reason) {

        reason.addEventListener(
            "input",
            () => {

                reason.value =
                    reason.value.slice(0, 100);

                removeFieldError(reason);
            }
        );
    }


    /* =========================================================
       EMAIL CHANGE
       ========================================================= */

    if (email) {

        email.addEventListener(
            "input",
            () => {

                emailVerified = false;
                generatedOTP = null;
                otpExpiryTime = 0;

                if (otpSection) {
                    otpSection.style.display =
                        "none";
                }

                if (otp) {
                    otp.value = "";
                    otp.disabled = false;
                }

                if (otpMessage) {

                    otpMessage.textContent = "";

                    otpMessage.classList.remove(
                        "success",
                        "error"
                    );
                }

                if (sendOtpButton) {

                    sendOtpButton.disabled =
                        false;

                    sendOtpButton.textContent =
                        "Send OTP";
                }

                if (verifyOtpButton) {

                    verifyOtpButton.disabled =
                        false;

                    verifyOtpButton.textContent =
                        "Verify Email";
                }

                email.readOnly = false;

                removeFieldError(email);
            }
        );
    }


    /* =========================================================
       OTP INPUT — ONLY 6 DIGITS
       ========================================================= */

    if (otp) {

        otp.addEventListener(
            "input",
            () => {

                otp.value =
                    otp.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                removeFieldError(otp);
            }
        );
    }


    /* =========================================================
       SEND OTP
       ========================================================= */

    if (sendOtpButton) {

        sendOtpButton.addEventListener(
            "click",
            async () => {

                const nameValue =
                    fullName
                        ? fullName.value.trim()
                        : "";

                const emailValue =
                    email
                        ? email.value.trim()
                        : "";


                if (!isValidName(nameValue)) {

                    showPremiumAlert(
                        "Invalid Name",
                        "Please enter your full name in a valid format.",
                        "error"
                    );

                    if (fullName) {

                        showFieldError(
                            fullName,
                            "Please enter a valid name."
                        );

                        fullName.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        setTimeout(() => {
                            fullName.focus();
                        }, 350);
                    }

                    return;
                }


                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(emailValue)) {

                    showPremiumAlert(
                        "Invalid Email",
                        "Please enter a valid email address.",
                        "error"
                    );

                    if (email) {

                        showFieldError(
                            email,
                            "Please enter a valid email address."
                        );

                        email.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        setTimeout(() => {
                            email.focus();
                        }, 350);
                    }

                    return;
                }


                generatedOTP =
                    Math.floor(
                        100000 +
                        Math.random() * 900000
                    ).toString();


                otpExpiryTime =
                    Date.now() +
                    10 * 60 * 1000;


                sendOtpButton.disabled = true;
                sendOtpButton.textContent =
                    "Sending...";


                try {

                    await emailjs.send(

                        "service_xjqunrn",

                        "template_v7f129a",

                        {
                            email:
                                emailValue,

                            name:
                                nameValue,

                            passcode:
                                generatedOTP
                        }
                    );


                    if (otpSection) {
                        otpSection.style.display =
                            "block";
                    }


                    if (otpMessage) {

                        otpMessage.textContent =
                            "A 6-digit verification code has been sent to your email.";

                        otpMessage.classList.remove(
                            "error"
                        );

                        otpMessage.classList.add(
                            "success"
                        );
                    }


                    sendOtpButton.textContent =
                        "OTP Sent";


                    /* GREEN SUCCESS ALERT */

                    showPremiumAlert(
                        "OTP Sent",
                        "A verification code has been sent to your email address.",
                        "success"
                    );


                } catch (error) {

                    console.error(
                        "EmailJS Error:",
                        error
                    );

                    generatedOTP = null;
                    otpExpiryTime = 0;

                    sendOtpButton.disabled =
                        false;

                    sendOtpButton.textContent =
                        "Send OTP";


                    if (otpMessage) {

                        otpMessage.textContent =
                            "Unable to send OTP. Please try again.";

                        otpMessage.classList.remove(
                            "success"
                        );

                        otpMessage.classList.add(
                            "error"
                        );
                    }


                    showPremiumAlert(
                        "OTP Not Sent",
                        "We could not send the verification code. Please try again.",
                        "error"
                    );
                }

            }
        );
    }


    /* =========================================================
       VERIFY OTP
       ========================================================= */

    if (verifyOtpButton) {

        verifyOtpButton.addEventListener(
            "click",
            () => {

                const enteredOTP =
                    otp
                        ? otp.value.trim()
                        : "";


                if (!generatedOTP) {

                    showPremiumAlert(
                        "Send OTP First",
                        "Please request a verification code before verifying your email.",
                        "error"
                    );

                    return;
                }


                if (!/^\d{6}$/.test(enteredOTP)) {

                    showPremiumAlert(
                        "Invalid OTP",
                        "Please enter the complete 6-digit verification code.",
                        "error"
                    );

                    if (otp) {

                        showFieldError(
                            otp,
                            "Enter a valid 6-digit OTP."
                        );

                        otp.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                        setTimeout(() => {
                            otp.focus();
                        }, 350);
                    }

                    return;
                }


                if (
                    Date.now() >
                    otpExpiryTime
                ) {

                    generatedOTP = null;
                    otpExpiryTime = 0;

                    showPremiumAlert(
                        "OTP Expired",
                        "This verification code has expired. Please request a new OTP.",
                        "error"
                    );

                    if (otpMessage) {

                        otpMessage.textContent =
                            "OTP expired. Please request a new code.";

                        otpMessage.classList.remove(
                            "success"
                        );

                        otpMessage.classList.add(
                            "error"
                        );
                    }

                    return;
                }


                if (
                    enteredOTP !==
                    generatedOTP
                ) {

                    showPremiumAlert(
                        "Incorrect OTP",
                        "The verification code you entered is incorrect.",
                        "error"
                    );

                    if (otpMessage) {

                        otpMessage.textContent =
                            "Incorrect OTP. Please try again.";

                        otpMessage.classList.remove(
                            "success"
                        );

                        otpMessage.classList.add(
                            "error"
                        );
                    }

                    return;
                }


                /* OTP VERIFIED */

                emailVerified = true;

                generatedOTP = null;
                otpExpiryTime = 0;


                if (otpMessage) {

                    otpMessage.textContent =
                        "✓ Email verified successfully.";

                    otpMessage.classList.remove(
                        "error"
                    );

                    otpMessage.classList.add(
                        "success"
                    );
                }


                if (otp) {
                    otp.disabled = true;
                }


                verifyOtpButton.disabled = true;

                verifyOtpButton.textContent =
                    "Verified ✓";


                if (sendOtpButton) {

                    sendOtpButton.disabled =
                        true;

                    sendOtpButton.textContent =
                        "Email Verified";
                }


                if (email) {
                    email.readOnly = true;
                }


                showPremiumAlert(
                    "Email Verified",
                    "Your email address has been verified successfully.",
                    "success"
                );

            }
        );
    }


    /* =========================================================
       INTEREST / SKILLS ERROR CLEAR
       ========================================================= */

    skillCheckboxes.forEach(
        (checkbox) => {

            checkbox.addEventListener(
                "change",
                () => {

                    const interestSection =
                        checkbox.closest(
                            ".skills-section, " +
                            ".skills-grid, " +
                            ".skills-options, " +
                            ".interest-section, " +
                            ".interest-grid, " +
                            ".interest-options"
                        );

                    if (interestSection) {

                        interestSection.classList.remove(
                            "checkbox-error"
                        );
                    }

                }
            );

        }
    );


    /* =========================================================
       CONFIRMATION ERROR CLEAR
       ========================================================= */

    if (confirmation) {

        confirmation.addEventListener(
            "change",
            () => {

                const confirmationContainer =
                    confirmation.closest(
                        ".form-confirmation"
                    );

                if (confirmationContainer) {

                    confirmationContainer.classList.remove(
                        "checkbox-error"
                    );
                }
            }
        );
    }


    /* =========================================================
       FORM SUBMISSION
       ========================================================= */

   form.addEventListener(
    "submit",
    async (event) => {
            event.preventDefault();

            let firstError = null;


            /* =================================================
               FULL NAME
               ================================================= */

            if (
                !validateField(
                    fullName,
                    fullName &&
                    isValidName(
                        fullName.value
                    ),
                    "Please enter a valid full name."
                )
            ) {

                firstError =
                    firstError || fullName;
            }


            /* =================================================
               AGE
               ================================================= */

            if (
                !validateField(
                    age,
                    age &&
                    isValidAge(
                        age.value
                    ),
                    "Age must be between 18 and 100."
                )
            ) {

                firstError =
                    firstError || age;
            }


            /* =================================================
               GENDER
               OPTIONAL
               ================================================= */


            /* =================================================
               CITY / LOCATION
               MIN 5 / MAX 50
               ================================================= */

            if (
                !validateField(
                    city,
                    city &&
                    isValidCity(
                        city.value
                    ),
                    "Please enter a valid location of at least 5 characters."
                )
            ) {

                firstError =
                    firstError || city;
            }


            /* =================================================
               EMAIL
               ================================================= */

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !validateField(
                    email,
                    email &&
                    emailRegex.test(
                        email.value.trim()
                    ),
                    "Please enter a valid email address."
                )
            ) {

                firstError =
                    firstError || email;
            }


            /* =================================================
               EMAIL VERIFICATION
               ================================================= */

            if (!emailVerified) {

                showFieldError(
                    email,
                    "Please verify your email address before submitting."
                );

                firstError =
                    firstError || email;
            }


            /* =================================================
               INTEREST / SKILLS
               REQUIRED
               AT LEAST ONE MUST BE SELECTED
               ================================================= */

            const selectedSkills =
                form.querySelectorAll(
                    'input[type="checkbox"][name="skills"]:checked, ' +
                    'input[type="checkbox"][name="interests"]:checked, ' +
                    '.skills-grid input[type="checkbox"]:checked, ' +
                    '.skills-options input[type="checkbox"]:checked, ' +
                    '.interest-options input[type="checkbox"]:checked, ' +
                    '.interest-grid input[type="checkbox"]:checked'
                );


            /*
             * Find the actual interest/skills section.
             */

            let interestSection =
                form.querySelector(
                    ".skills-section, " +
                    ".skills-grid, " +
                    ".skills-options, " +
                    ".interest-section, " +
                    ".interest-grid, " +
                    ".interest-options"
                );


            /*
             * Extra fallback:
             * If classes are different, find the parent
             * container of the first detected checkbox.
             */

            if (
                !interestSection &&
                skillCheckboxes.length > 0
            ) {

                interestSection =
                    skillCheckboxes[0].closest(
                        "div, section, fieldset"
                    );
            }


            /*
             * NO INTEREST SELECTED
             */

            if (selectedSkills.length === 0) {

                if (interestSection) {

                    interestSection.classList.add(
                        "checkbox-error"
                    );

                    firstError =
                        firstError ||
                        interestSection;
                }


                /*
                 * If section itself cannot be found,
                 * use the first checkbox as fallback.
                 */

                if (
                    !firstError &&
                    skillCheckboxes.length > 0
                ) {

                    firstError =
                        skillCheckboxes[0];
                }
            }


            /* =================================================
               ABOUT YOU
               MIN 5 / MAX 100
               ================================================= */

            if (
                !validateField(
                    reason,
                    reason &&
                    isValidReason(
                        reason.value
                    ),
                    "Please enter at least 5 characters about yourself."
                )
            ) {

                firstError =
                    firstError || reason;
            }


            /* =================================================
               TIME CONTRIBUTION
               ================================================= */

            if (
                !validateField(
                    time,
                    time &&
                    time.value.trim() !== "",
                    "Please select your available contribution time."
                )
            ) {

                firstError =
                    firstError || time;
            }


            /* =================================================
               CONFIRMATION
               ================================================= */

            if (
                confirmation &&
                !confirmation.checked
            ) {

                const confirmationContainer =
                    confirmation.closest(
                        ".form-confirmation"
                    );

                if (confirmationContainer) {

                    confirmationContainer.classList.add(
                        "checkbox-error"
                    );

                    firstError =
                        firstError ||
                        confirmationContainer;
                }
            }


            /* =================================================
               INVALID FORM
               ================================================= */

            if (firstError) {

                showPremiumAlert(
                    "Registration Incomplete",
                    "Please correct the highlighted information before submitting your registration.",
                    "error"
                );


                setTimeout(() => {

                    if (
                        firstError.scrollIntoView
                    ) {

                        firstError.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    }


                    if (
                        firstError.matches &&
                        firstError.matches(
                            "input, select, textarea"
                        )
                    ) {

                        setTimeout(() => {
                            firstError.focus();
                        }, 350);

                    } else {

                        const focusable =
                            firstError.querySelector?.(
                                "input, select, textarea"
                            );

                        if (focusable) {

                            setTimeout(() => {
                                focusable.focus();
                            }, 350);
                        }
                    }

                }, 100);

                return;
            }


            /* =================================================
               REGISTRATION SUCCESS
               ================================================= */

          /* =================================================
   SEND REGISTRATION DATA TO GOOGLE SHEETS
   ================================================= */

const interests = Array.from(selectedSkills)
    .map((checkbox) => {

        const label =
            checkbox.closest("label");

        return (
            checkbox.value ||
            label?.innerText?.trim() ||
            ""
        );

    })
    .filter(Boolean)
    .join(", ");


const registrationData =
    new URLSearchParams();

registrationData.append(
    "fullName",
    fullName.value.trim()
);

registrationData.append(
    "age",
    age.value.trim()
);

registrationData.append(
    "gender",
    gender ? gender.value.trim() : ""
);

registrationData.append(
    "city",
    city.value.trim()
);

registrationData.append(
    "email",
    email.value.trim()
);

registrationData.append(
    "interests",
    interests
);

registrationData.append(
    "reason",
    reason.value.trim()
);

registrationData.append(
    "time",
    time.value.trim()
);


try {

    await fetch(
        GOOGLE_SHEET_URL,
        {
            method: "POST",
            mode: "no-cors",
            body: registrationData
        }
    );


    /* =============================================
       REGISTRATION SUCCESS
       ============================================= */

    showPremiumAlert(
        "Registration Complete",
        "Your FutureVerse team registration has been submitted successfully.",
        "success"
    );


    setTimeout(() => {

      window.location.replace("success.html");

    }, 1000);


} catch (error) {

    console.error(
        "Google Sheets Error:",
        error
    );


    showPremiumAlert(
        "Submission Failed",
        "We could not save your registration. Please try again.",
        "error"
    );

}

        }
    );

});