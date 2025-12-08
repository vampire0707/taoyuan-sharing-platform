document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("login-email");
    const email = emailInput ? emailInput.value : "";

    alert(`💚 Welcome back (${email})!`);
    form.reset();
  });
});
