document.addEventListener("DOMContentLoaded", function () {

    /* =====================================
       LANGUAGE TOGGLE (EN ↔ AR)
    ===================================== */
    const toggleBtn = document.getElementById("toggle-lang-btn");
    const formEn = document.getElementById("form-en");
    const formAr = document.getElementById("form-ar");

    if (toggleBtn && formEn && formAr) {
        toggleBtn.addEventListener("click", function () {
            if (formEn.classList.contains("active-form")) {
                formEn.classList.replace("active-form", "hidden-form");
                formAr.classList.replace("hidden-form", "active-form");
                toggleBtn.innerText = "Switch to English";
            } else {
                formAr.classList.replace("active-form", "hidden-form");
                formEn.classList.replace("hidden-form", "active-form");
                toggleBtn.innerText = "Switch to Arabic";
            }
        });
    }

    /* =====================================
       WARRANTY VALIDATION & AUTOFILL
    ===================================== */
    let warrantyStatus = { valid: false, message: "" };

    const warrantyData = [
        {
            "warrantyNumber": "1234567",
            "brand": "test",
            "model": "test",
            "issueDate": "2025-10-02"
        },
        // Add more warranty entries here
    ];

    function checkWarranty(issueDate) {
        const purchase = new Date(issueDate);
        const today = new Date();

        // Registration period: 3 months
        const registrationDeadline = new Date(purchase);
        registrationDeadline.setMonth(registrationDeadline.getMonth() + 3);

        // Warranty expiry: 1 year
        const warrantyExpiry = new Date(purchase);
        warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + 1);

        if (today > warrantyExpiry) {
            return { valid: false, message: "❌ Warranty has expired." };
        }

        if (today > registrationDeadline) {
            return { valid: false, message: "❌ Registration period (3 months) has passed." };
        }

        return { valid: true, message: "✅ Warranty valid. You may submit the form." };
    }

    const formWrapper = document.querySelector(".haier-form-wrapper");

    if (formWrapper) {
        formWrapper.addEventListener("input", function (e) {
            if (e.target.name !== "serial-number") return;

            const serial = e.target.value.trim();
            warrantyStatus.valid = false;
            warrantyStatus.message = "";

            const brandField = formWrapper.querySelector("select[name='brand']");
            const modelField = formWrapper.querySelector("input[name='model-number']");

            if (brandField) brandField.value = "";
            if (modelField) modelField.value = "";

            if (!serial) {
                warrantyStatus.message = "❌ Please enter a warranty number.";
                return;
            }

            const data = warrantyData.find(item => item.warrantyNumber === serial);

            if (!data) {
                alert("❌ Invalid warranty number.");
                warrantyStatus.message = "❌ Invalid warranty number.";
                return;
            }

            const check = checkWarranty(data.issueDate);

            if (!check.valid) {
                alert(check.message);
                warrantyStatus.message = check.message;
                return;
            }

            // Valid warranty → autofill
            if (brandField) brandField.value = data.brand;
            if (modelField) modelField.value = data.model;

            warrantyStatus.valid = true;
            warrantyStatus.message = check.message;
            alert(check.message);
        });

        /* =====================================
           BLOCK CF7 SUBMISSION IF WARRANTY INVALID
        ===================================== */
        document.addEventListener("wpcf7beforesubmit", function (event) {
            if (!warrantyStatus.valid) {
                event.preventDefault();
                event.stopImmediatePropagation();
                alert(warrantyStatus.message || "❌ Please enter a valid warranty number.");
            }
        });
    }
});
